# LeetCode practice

Python 3.14 through `uv`. The visualizations are a SvelteKit 3 / Svelte 5 app in `viz/` (pnpm).

```bash
uv run main.py 88            # run the statement examples for problem 88
uv run main.py 88 --test     # full pytest suite (examples + edge cases)
uv run main.py 88 --viz      # export cases, start the viz dev server if needed, open localhost:5274/88
uv run main.py viz           # open the viz index; `viz serve` starts the server only; `viz stop` stops it
uv run main.py list          # list problems with section, difficulty and pattern
uv run main.py list -d medium -p greedy -s "sliding window"   # filter; -s also lists the section's problems not added yet
uv run main.py new <url>     # scaffold from a LeetCode URL: number, title, difficulty, method signature
uv run main.py new 1 Two Sum # scaffold by hand, without fetching
uv run leetcode.py <url>     # print a problem's statement, examples, constraints and signature as JSON
uv run leetcode.py plan top-interview-150 > studyplans/top-interview-150.json   # refresh the study plan's sections
uv run pytest                # every Python problem
uv run ruff format .         # format Python (also formats ```python blocks inside docstrings)
uv run ruff check .          # lint: pyflakes, imports, modern syntax, bugbear, Google docstrings
cd viz && pnpm test          # every viz trace against every Python case
cd viz && pnpm check         # svelte-check / TypeScript
```

## Layout

- `problem.py`: `Problem` base class, `example()` helper, `as_params()`. Keep `problem.pyi` in sync.
- `problems/pNNNN_<slug>.py`: one file per problem; number zero-padded to 4 digits, slug in snake_case.
- `studyplans/top-interview-150.json`: the Top Interview 150 sections in plan order, fetched from LeetCode.
  A problem's section is looked up here by number, so there is nothing to set per problem.
- `templates/`: `problem.py.tmpl` plus `viz/problem.ts.tmpl` and `viz/+page.svelte.tmpl`, used by `main.py new`.
- `viz/`: the SvelteKit app.
  - `src/routes/<N>/problem.ts`: the algorithm side of problem N: `meta`, and `problem` (trace, vars, result, ...).
  - `src/routes/<N>/+page.svelte`: the figure and recall notes, rendered through `<ProblemPage>`.
  - `src/routes/+page.svelte`: index of every problem, grouped by plan section, filterable by difficulty, section and pattern family (kept in the query string).
  - `src/lib/components/`: shared UI. `ProblemPage` (the whole page), `CasePicker`, `Transport`, `VarsTable`, `CodeBlock`, `ThemeSwitch`,
    and the text transitions `SwapText` (narration, verdict), `SoftText` (values, counts), `MorphText` (button labels).
  - `src/lib/components/figure/`: shared drawing. `Figure` (svg + camera), `ArrayRow`, `Tile`, `Slot`, `Halo`, `Label`, `Dots`; `TILE` sizes in `context.ts`.
  - `src/lib/iso.ts`: pure isometric geometry. `src/lib/player.svelte.ts`: playback state. `src/lib/types.ts`: `Problem`, `Step`, `Case`, `Meta`.
  - `src/lib/generated/`: `problems.json` (number, title, url, difficulty, pattern, section), `studyplan.json` and `cases/<stem>.json`, written by `main.py` from the Python files. Never edit by hand.
  - `src/lib/traces.test.ts`: runs every route's trace on every exported case.
  - `src/app.css`: the Anatomy design tokens for all five themes, plus shared `.btn` styles.
  - `src/lib/transitions.css` + `transitions.ts`: UI motion from the transitions-dev skill (`.agents/skills/`): the motion tokens
    (`--duration-*`, `--ease-*`, ...) and the `t-*` snippets, plus `slidingPill` (tabs sliding), `shake` and `ms()` (reads a duration token).
    Use the tokens for any new UI motion instead of hard-coded `ms` values; the figure's own motion stays physical (tiles rise and fall).

To add a problem from a LeetCode link, use the **`leetcode-problem` skill** (`.claude/skills/leetcode-problem/`).
It fetches the statement and scaffolds both files. It fills in the examples and verified edge cases, builds the visualization, and checks the result with screenshots.
It leaves the LeetCode method for the user to solve, and never overwrites a solution the user has started.

- `leetcode.py`: fetches public problem data from LeetCode's GraphQL API (stdlib only; it sends a browser User-Agent because the default one gets a 403).

## Problem file

Top to bottom:

1. Module docstring: `N. Title`, `Pattern:`, `Recall:` (the one idea that unlocks it), `Viz: viz/src/routes/N/`.
2. `class Solution(problem.Problem)` with `number`, `title`, `url`, `difficulty` (`"Easy"` / `"Medium"` / `"Hard"`, as on LeetCode),
   `pattern`, `viz = "viz/src/routes/N/+page.svelte"`.
   - `pattern` is a short label, `"Family · detail"` (e.g. `"Two pointers · in place"`, `"Sliding window · shrink while valid"`).
     The family before ` · ` is what the index's Pattern filter groups by, so reuse an existing family when one fits (`uv run main.py list`).
     This is the source of truth for difficulty and pattern: the viz reads them from `problems.json`.
   - The LeetCode method keeps its original name (e.g. `merge`). Type it with builtins (`list[int]`, `X | None`, never `typing.List` / `Optional`).
     Give it a Google-style docstring (summary, `Args:`, `Returns:`) so editor hovers show it properly; never reST `:type:` fields.
   - `solve()` calls it and returns the result; for in-place problems it returns the mutated input.
   - Override `check(result, expected)` only when any valid answer is accepted.
3. `EXAMPLES`: only the examples from the problem statement, as `example(*args, expected=...)`. `main.py` runs these.
4. `CASES`: extra edge cases as `pytest.param(*args, expected, id="snake_case_description")`. The **last value is always the expected answer**, because `main.py` relies on it to export cases to the viz. Don't repeat EXAMPLES here.
5. One parametrized test over `problem.as_params(EXAMPLES) + CASES`. Copy mutable inputs before calling.

No `if __name__ == "__main__"` block; `main.py` is the entry point.

## Visualization

The goal is recall: opening the viz weeks later should bring the approach back in under a minute.
`viz/src/routes/88/` is the reference example: two rows, three pointers, free and spent slots.

### Svelte conventions
- SvelteKit 3: config lives in the `sveltekit()` plugin in `vite.config.ts` (there is no `svelte.config.js`).
  Import shared code as `#lib/...` **with the file extension** (`#lib/types.ts`, `#lib/components/ProblemPage.svelte`).
- Svelte 5 runes only (`$props`, `$state`, `$derived`). Components that render SVG fragments start with `<svelte:options namespace="svg" />`.
- Reuse the shared components. A route should contain only problem-specific logic (`problem.ts`) and markup (`+page.svelte`).
  If two problems need the same drawing, add a component to `src/lib/components/figure/` rather than copying it.
- No new runtime dependencies or CDNs. Style with the `--anatomy-*` tokens in scoped `<style>` blocks.
  The one exception is `thinking-orbs` (MIT), whose React-free `thinking-orbs/engine` animates the tab icon (`src/lib/favicon.ts`).

### problem.ts
- `meta`: `lede`, one sentence that gives the whole idea. (Difficulty and pattern come from the Python class.)
- `trace(args)` takes the same arguments as the Python `solve()` and returns one snapshot per step. Each has the full state the figure needs,
  a one-sentence `msg` explaining *why* that move happens, and `line`, the 1-based line of the core-loop `code` that step runs.
- `vars(step)` returns `[{ name, value, note }]` for every variable the code uses: pointers, counters, derived quantities like `gap`, and inputs like `val`.
  `note` is a few words on what it means. The page shows them in a table and highlights values that changed this step.
- `result(lastStep)` returns the answer in the same shape as `expected`. Add `check` when the Python `Solution.check` is looser than equality.
- `fields` + `toArgs` define the Custom form. `toArgs` throws `Error("message")` for input that breaks the problem's rules (e.g. unsorted).

### +page.svelte
- `<ProblemPage number meta problem cases code>` with two snippets: `figure(step)` and `recall()`.
  ProblemPage provides the test-case picker (Examples / Edge cases / Custom, too-big cases hidden), Input / Expected / Output with a ✓ or ✗ verdict,
  the variables table, the narration, Restart / Prev / Play / Next with a step count, speed control, keyboard shortcuts (← → Space Home End),
  themes, and the code block with the current `line` lit up. Don't rebuild any of these in a route.
- `figure`: a `<Figure bounds dots label>` holding one `<ArrayRow>` per array. `ArrayRow` takes `values`, `states` (`up` / `free` / `spent`),
  `name`, `y`, `lit`, `pointers` (name → index) and `strong`. Space rows `ROW2 = 110` apart.
- `recall`: `<dt>`/`<dd>` pairs: Key insight, Invariant, Each step, Stop when, Pitfall, Cost.
- `code`: the core loop as a template string, short, using the same pointer names as the figure.

### Aesthetic: Anatomy (skills.wheresryan.sh/anatomy)
- Quiet, technical-plate look. Paper theme by default; all five themes must work, so never hard-code colors.
- Typography: serif (`--font-serif`) for the title, lede and narration; sans for body text; mono (`--anatomy-mono`) for labels, the variables table and controls.
- The plate holds only the figure and the variables table. No corner labels, titles or readout text on it.
- One house camera (`camera()` in `iso.ts`: azimuth 90, elevation 38, scale 1.8), square to the reader: rows run level and tiles look like keycaps. Don't override it per page.
- Use physical state instead of color. Live values stand up as tiles. Free space is a dashed flat slot. Spent values are dotted flat slots. Height changes tween.
- **Exactly one lit part** per frame (`lit`): the thing that just changed.
- Colors (`--anatomy-red/green/blue`) only when color is itself the subject.
- No arrows, leader lines or callouts. Inside the figure, the only text is: values engraved on top faces, the row name, and the index and pointer labels.
  Scalars like `val` go in the variables table.

### Verify
- `cd viz && pnpm check && pnpm test`. The trace test must pass on every case up to 1000 values, including ones too big to draw.
  Larger cases are skipped there (a trace snapshots the array every step, so memory grows as n²); pytest covers them.
- Figure labels (`Label`) are sized in screen pixels via the `getScale` context, so they stay readable on long arrays; pass `dy` in pixels.
- Claude builds these well but does not always see them. With the dev server running, screenshot a few steps in light and dark and look at them.
  Playwright works through the system Python: `/usr/bin/python3 script.py`, using `page.goto("http://localhost:5274/N")` and
  `localStorage.setItem('viz-theme', 'dark')` to switch themes.
