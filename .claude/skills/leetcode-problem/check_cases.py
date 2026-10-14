"""Run a problem's EXAMPLES + CASES against a throwaway reference solution.

    uv run python .claude/skills/leetcode-problem/check_cases.py 26 /tmp/lc26/reference.py

The reference file defines the LeetCode method name and a correct implementation:

    METHOD = "removeDuplicates"
    def reference(self, nums):
        ...

It is patched onto Solution in memory only; the problem file is never changed. Every case
must pass, which proves the expected values are right before the user writes a solution.
"""

import copy
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

import main  # noqa: E402


def run(number: int, ref_path: str) -> int:
    module = main.load(main.find(number))
    spec = importlib.util.spec_from_file_location("reference", ref_path)
    ref = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ref)
    setattr(module.Solution, ref.METHOD, ref.reference)

    cases = [
        (f"example_{i}", ex.args, ex.expected)
        for i, ex in enumerate(module.EXAMPLES, 1)
    ]
    cases += [(p.id, p.values[:-1], p.values[-1]) for p in getattr(module, "CASES", [])]
    failed = 0
    for case_id, args, expected in cases:
        solution = module.Solution()
        try:
            result = solution.solve(*copy.deepcopy(args))
            ok = solution.check(result, expected)
        except Exception as exc:
            result, ok = f"{type(exc).__name__}: {exc}", False
        if not ok:
            failed += 1
            print(
                f"FAIL {case_id}: got {str(result)[:200]}, expected {str(expected)[:200]}"
            )
    print(f"{len(cases) - failed}/{len(cases)} cases pass with the reference solution")
    return 1 if failed else 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    raise SystemExit(run(int(sys.argv[1]), sys.argv[2]))
