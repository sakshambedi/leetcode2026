"""Run LeetCode practice problems.

uv run main.py 88              run the statement examples for problem 88
uv run main.py 88 --test       run the full pytest suite (examples + edge cases)
uv run main.py 88 --viz        open the visualization (starts the viz dev server if needed)
uv run main.py viz             open the visualization index
uv run main.py viz serve       export cases and start the dev server without opening a browser
uv run main.py viz stop        stop the viz dev server
uv run main.py list            list every problem with its section, difficulty and pattern
uv run main.py list -d easy -p "two pointers" -s "sliding window"
                               filter by difficulty, pattern and study-plan section; with -s,
                               the section's problems not added yet are listed too
uv run main.py new 1 Two Sum   scaffold problems/p0001_two_sum.py + viz/src/routes/1/
uv run main.py new <url>       same, with number, title, difficulty and signature from LeetCode
"""

import argparse
import copy
import importlib
import inspect
import json
import os
import re
import signal
import subprocess
import sys
import time
import urllib.request
import webbrowser
from itertools import zip_longest
from pathlib import Path
from types import ModuleType

import problem

ROOT = Path(__file__).resolve().parent
PROBLEMS = ROOT / "problems"
VIZ = ROOT / "viz"  # SvelteKit app
ROUTES = VIZ / "src" / "routes"
GENERATED = VIZ / "src" / "lib" / "generated"
TEMPLATES = ROOT / "templates"
# Sections come from this plan; refresh with: uv run leetcode.py plan top-interview-150 > <file>
STUDYPLAN = ROOT / "studyplans" / "top-interview-150.json"
PORT = 5274
PIDFILE = VIZ / ".dev.pid"

GREEN, RED, DIM, BOLD, RESET = "\033[32m", "\033[31m", "\033[2m", "\033[1m", "\033[0m"


def find(number: int) -> Path:
    matches = sorted(PROBLEMS.glob(f"p{number:04d}_*.py"))
    if not matches:
        sys.exit(f"No problem {number}. Create it with: uv run main.py new {number} <title>")
    return matches[0]


def load(path: Path) -> ModuleType:
    return importlib.import_module(f"problems.{path.stem}")


def run_examples(module: ModuleType) -> bool:
    solution: problem.Problem = module.Solution()
    params = inspect.signature(solution.solve).parameters.values()
    names = [p.name for p in params if p.kind is p.POSITIONAL_OR_KEYWORD]
    print(f"{BOLD}{solution.number}. {solution.title}{RESET}  {DIM}{solution.url}{RESET}\n")

    if not module.EXAMPLES:
        print(
            f"{RED}No EXAMPLES yet{RESET}: add the statement's examples to {module.__name__.split('.')[-1]}.py"
        )
        return False

    all_passed = True
    for i, ex in enumerate(module.EXAMPLES, 1):
        shown = ", ".join(
            f"{name}={arg!r}" if name else repr(arg)
            for name, arg in zip_longest(names[: len(ex.args)], ex.args)
        )
        try:
            result = solution.solve(*copy.deepcopy(ex.args))
            passed = solution.check(result, ex.expected)
        except Exception as exc:
            result, passed = f"{type(exc).__name__}: {exc}", False
        all_passed &= passed

        mark = f"{GREEN}✓{RESET}" if passed else f"{RED}✗{RESET}"
        print(f"{mark} Example {i}: {shown}")
        print(f"    output:   {result!r}")
        if not passed:
            print(f"    expected: {ex.expected!r}")

    print(
        f"\n{GREEN}All examples pass{RESET}"
        if all_passed
        else f"\n{RED}Some examples failed{RESET}"
    )
    if solution.viz:
        print(f"{DIM}Viz: {solution.viz}  (--viz to open){RESET}")
    return all_passed


def run_tests(path: Path) -> int:
    import pytest

    return pytest.main([str(path), "-v"])


def route(number: int) -> Path:
    return ROUTES / str(number) / "+page.svelte"


def load_plan() -> dict:
    return json.loads(STUDYPLAN.read_text())


def sections(plan: dict) -> dict[int, str]:
    """Problem number -> its section in the study plan."""
    return {q["number"]: sec["name"] for sec in plan["sections"] for q in sec["problems"]}


def export_cases(module: ModuleType) -> list[dict]:
    """EXAMPLES + CASES in the shape the viz test-case picker and its tests read."""
    cases = [
        {"id": f"example_{i}", "args": list(ex.args), "expected": ex.expected}
        for i, ex in enumerate(module.EXAMPLES, 1)
    ]
    for param in getattr(module, "CASES", []):
        *args, expected = param.values  # convention: the last value is the expected answer
        cases.append({"id": param.id, "args": args, "expected": expected})
    return cases


def export_all() -> None:
    """Write problems.json and cases/<stem>.json into the viz app from every problem file."""
    (GENERATED / "cases").mkdir(parents=True, exist_ok=True)
    index = GENERATED / "problems.json"
    previous = {p["stem"]: p for p in json.loads(index.read_text())} if index.exists() else {}
    plan = load_plan()
    section_of = sections(plan)
    problems = []
    for path in sorted(PROBLEMS.glob("p[0-9]*.py")):
        try:
            module = load(path)
        except Exception as exc:  # keep the last good export while a file is mid-edit
            print(
                f"{RED}skip{RESET} {path.name}: {type(exc).__name__}: {exc}",
                file=sys.stderr,
            )
            if path.stem in previous:
                problems.append(previous[path.stem])
            continue
        cls = module.Solution
        problems.append(
            {
                "number": cls.number,
                "title": cls.title,
                "url": cls.url,
                "stem": path.stem,
                "difficulty": cls.difficulty,
                "pattern": cls.pattern,
                "section": section_of.get(cls.number),
            }
        )
        (GENERATED / "cases" / f"{path.stem}.json").write_text(
            json.dumps(export_cases(module)) + "\n"
        )
    index.write_text(json.dumps(problems, indent=2) + "\n")
    (GENERATED / "studyplan.json").write_text(json.dumps(plan, indent=2) + "\n")


def server_up() -> bool:
    try:
        with urllib.request.urlopen(f"http://localhost:{PORT}/", timeout=0.5):
            return True
    except OSError:
        return False


def ensure_server() -> None:
    """Start the viz dev server in the background unless it is already running."""
    if server_up():
        return
    if not (VIZ / "node_modules").exists():
        print("Installing viz dependencies (pnpm install)...")
        subprocess.run(["pnpm", "install"], cwd=VIZ, check=True)
    log = open(VIZ / ".dev.log", "w")
    proc = subprocess.Popen(
        ["pnpm", "exec", "vite", "dev", "--port", str(PORT), "--strictPort"],
        cwd=VIZ,
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    PIDFILE.write_text(str(proc.pid))
    print(f"Starting viz dev server on http://localhost:{PORT} (log: viz/.dev.log)")
    for _ in range(60):
        if server_up():
            return
        if proc.poll() is not None:
            sys.exit(f"Viz dev server exited; see {VIZ / '.dev.log'}")
        time.sleep(0.5)
    sys.exit(f"Viz dev server did not start; see {VIZ / '.dev.log'}")


def stop_server() -> None:
    if not PIDFILE.exists():
        print("No viz dev server started by main.py.")
        return
    try:
        os.killpg(int(PIDFILE.read_text()), signal.SIGTERM)
        print("Stopped viz dev server.")
    except ProcessLookupError:
        print("Viz dev server was not running.")
    PIDFILE.unlink()


def open_viz(number: int | None = None) -> None:
    if number is not None and not route(number).exists():
        sys.exit(
            f"No visualization for problem {number} yet: create {route(number).relative_to(ROOT)}"
        )
    export_all()
    ensure_server()
    url = f"http://localhost:{PORT}/{number if number is not None else ''}"
    webbrowser.open(url)
    print(f"Opened {url}")


def list_problems(
    difficulty: str | None = None, pattern: str | None = None, section: str | None = None
) -> None:
    """Print problems, filtered by case-insensitive matches on difficulty, pattern and section.

    Args:
        difficulty: ``easy``, ``medium`` or ``hard``.
        pattern: Any part of the pattern label, e.g. ``two pointers`` or ``greedy``.
        section: Any part of a study-plan section name, e.g. ``sliding``. Lists those sections
            in plan order, including problems not added yet.
    """
    plan = load_plan()
    section_of = sections(plan)
    added = {cls.number: cls for cls in (load(p).Solution for p in PROBLEMS.glob("p[0-9]*.py"))}

    order = sorted(added)
    if section is not None:
        picked = [s for s in plan["sections"] if section.lower() in s["name"].lower()]
        if not picked:
            names = ", ".join(s["name"] for s in plan["sections"])
            sys.exit(f"No section matches {section!r}. Sections: {names}")
        order = [q["number"] for s in picked for q in s["problems"]]
    titles = {q["number"]: q for s in plan["sections"] for q in s["problems"]}

    shown = 0
    for number in order:
        cls = added.get(number)
        diff = cls.difficulty if cls else titles[number]["difficulty"]
        if difficulty and diff.lower() != difficulty.lower():
            continue
        if pattern and (not cls or pattern.lower() not in cls.pattern.lower()):
            continue
        shown += 1
        sec = section_of.get(number, "-")
        title = cls.title if cls else titles[number]["title"]
        title = title if len(title) <= 44 else title[:43] + "…"
        if cls is None:
            print(f"{DIM}{number:>5}  {title:<44} {diff:<7} {sec:<16} not added yet{RESET}")
            continue
        viz = "" if route(number).exists() else f"  {DIM}(no viz){RESET}"
        print(f"{number:>5}  {title:<44} {diff:<7} {sec:<16} {DIM}{cls.pattern}{RESET}{viz}")
    if not shown:
        print("No problems match.")


STUB = """    def solve(self, *args):
        # Adapt to the LeetCode method; return the mutated input for in-place problems.
        raise NotImplementedError
"""


def modern_types(annotation: str) -> str:
    """Rewrite typing aliases from LeetCode's starter code as builtins (``List[int]`` -> ``list[int]``)."""
    for old, new in (
        ("List[", "list["),
        ("Dict[", "dict["),
        ("Set[", "set["),
        ("Tuple[", "tuple["),
    ):
        annotation = annotation.replace(old, new)
    # Optional[X] -> X | None, innermost first so nested Optionals unwrap too.
    while m := re.search(r"Optional\[([^\[\]]*(?:\[[^\[\]]*\])?)\]", annotation):
        annotation = annotation[: m.start()] + f"{m.group(1)} | None" + annotation[m.end() :]
    return annotation


def methods_from(starter: str) -> str:
    """Build the solve() adapter and an unsolved LeetCode method from the python3 starter code.

    Args:
        starter: LeetCode's python3 starter, e.g. ``class Solution: def twoSum(self, nums: List[int], ...``.

    Returns:
        Indented method source for the problem template, typed and with a Google-style
        docstring skeleton so editor hovers show the parameters and return value.
    """
    # Tree and list starters open with a commented-out node class; skip it and read class Solution.
    code = "\n".join(line for line in starter.splitlines() if not line.lstrip().startswith("#"))
    code = code[code.find("class Solution") :]
    m = re.search(r"def (\w+)\(self(?:, ([^)]*))?\)(\s*->\s*[^:]+)?:", code)
    if not m:
        return STUB
    name, params, ret = (
        m.group(1),
        modern_types(m.group(2) or ""),
        modern_types(m.group(3) or ""),
    )
    names = re.findall(r"(?:^|,)\s*(\w+)\s*:", params)
    args_doc = "".join(f"            {n}: TODO\n" for n in names)
    args_section = f"        Args:\n{args_doc}\n" if names else ""
    return (
        f"    def solve(self, {params}){ret}:\n"
        f"        # Return the mutated input too if the problem works in place.\n"
        f"        return self.{name}({', '.join(names)})\n\n"
        f"    def {name}(self, {params}){ret}:\n"
        f'        """TODO one-line summary of what the method does.\n\n'
        f"{args_section}"
        f"        Returns:\n"
        f"            TODO\n"
        f'        """\n'
        f"        raise NotImplementedError  # your solution\n"
    )


def new_problem(
    number: int,
    title: str,
    methods: str = STUB,
    difficulty: str = "Easy",
    url_slug: str | None = None,
) -> None:
    slug = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")
    stem = f"p{number:04d}_{slug}"
    targets = {
        TEMPLATES / "problem.py.tmpl": PROBLEMS / f"{stem}.py",
        TEMPLATES / "viz" / "problem.ts.tmpl": ROUTES / str(number) / "problem.ts",
        TEMPLATES / "viz" / "+page.svelte.tmpl": ROUTES / str(number) / "+page.svelte",
    }
    fields = {
        "{{NUMBER}}": str(number),
        "{{TITLE}}": title,
        # LeetCode's own slug when fetched: titles like "O(1)" don't map back to it.
        "{{SLUG}}": url_slug or slug.replace("_", "-"),
        "{{STEM}}": stem,
        "{{METHODS}}": methods,
        "{{DIFFICULTY}}": difficulty,
    }
    for template, target in targets.items():
        if target.exists():
            print(f"skip   {target.relative_to(ROOT)} (exists)")
            continue
        text = template.read_text()
        for key, value in fields.items():
            text = text.replace(key, value)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)
        if target.suffix == ".py":  # wrap long LeetCode signatures the way ruff would
            subprocess.run(
                [sys.executable, "-m", "ruff", "format", "--quiet", str(target)],
                check=False,
            )
        print(f"create {target.relative_to(ROOT)}")
    export_all()  # the new route imports its cases JSON


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("target", help="problem number, 'list', 'new', or 'viz'")
    parser.add_argument(
        "rest",
        nargs="*",
        help="for 'new': <number> <title...> or <url>; for 'viz': [serve|stop]",
    )
    parser.add_argument("-t", "--test", action="store_true", help="run the pytest suite")
    parser.add_argument("-v", "--viz", action="store_true", help="open the visualization")
    parser.add_argument(
        "-d",
        "--difficulty",
        choices=["easy", "medium", "hard"],
        type=str.lower,
        help="for 'list': only this difficulty",
    )
    parser.add_argument("-p", "--pattern", help="for 'list': pattern contains this text")
    parser.add_argument("-s", "--section", help="for 'list': study-plan section contains this text")
    args = parser.parse_args()

    if args.target == "list":
        list_problems(args.difficulty, args.pattern, args.section)
        return 0
    if args.target == "viz":
        if args.rest == ["stop"]:
            stop_server()
        elif args.rest == ["serve"]:
            export_all()
            ensure_server()
            print(f"Viz dev server at http://localhost:{PORT}")
        else:
            open_viz()
        return 0
    if args.target == "new":
        if len(args.rest) == 1 and not args.rest[0].isdigit():
            import leetcode

            lc = leetcode.fetch(args.rest[0])
            new_problem(lc.number, lc.title, methods_from(lc.python), lc.difficulty, lc.slug)
            return 0
        if len(args.rest) < 2 or not args.rest[0].isdigit():
            parser.error("usage: main.py new <number> <title...>  or  main.py new <leetcode url>")
        new_problem(int(args.rest[0]), " ".join(args.rest[1:]))
        return 0
    if not args.target.isdigit():
        parser.error(f"unknown target {args.target!r}")

    path = find(int(args.target))
    module = load(path)
    if args.viz:
        open_viz(module.Solution.number)
        return 0
    if args.test:
        return run_tests(path)
    return 0 if run_examples(module) else 1


if __name__ == "__main__":
    raise SystemExit(main())
