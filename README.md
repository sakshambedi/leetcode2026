# LeetCode 2026

LeetCode practice in Python, working through the [Top Interview 150](https://leetcode.com/studyplan/top-interview-150/) study plan in order.
Each problem has a pytest suite and a step-through visualization, so a solution I wrote weeks ago comes back in under a minute.

The visualizations are published to GitHub Pages: **https://sakshambedi.github.io/leetcode2026/**

## What's in a problem

Every problem has two parts:

- **`problems/pNNNN_<slug>.py`** holds the solution, the examples from the statement, extra edge cases, and a parametrized test.
  The module docstring gives the pattern and the one idea that unlocks the problem (`Recall:`).
- **`viz/src/routes/<N>/`** is an animated walkthrough of the algorithm. Pick a test case (or type your own), then step through it.
  Each step shows the array and its pointers, the variables, a sentence on why the move happens, and the line of code it runs.
  Below that are the recall notes: key insight, invariant, stop condition, pitfall, and cost.

The Python file is the source of truth. The viz reads its difficulty, pattern and test cases from it, and the viz tests replay every Python case through the TypeScript trace.

## Setup

You need [uv](https://docs.astral.sh/uv/) (it installs Python 3.14 for you), and Node 24 with pnpm for the visualizations.

```bash
uv sync
cd viz && pnpm install
```

## Usage

```bash
uv run main.py list                 # every problem with its section, difficulty and pattern
uv run main.py list -d medium -p greedy -s "sliding window"   # filter; -s also lists the section's problems not added yet
uv run main.py 88                   # run problem 88 on the statement examples
uv run main.py 88 --test            # its full pytest suite
uv run main.py 88 --viz             # open its visualization (starts the dev server if needed)
uv run main.py viz                  # open the index of all problems; `viz stop` stops the server
```

The dev server runs at http://localhost:5274.

### Adding a problem

```bash
uv run main.py new https://leetcode.com/problems/two-sum/   # scaffold from a LeetCode URL
uv run main.py new 1 Two Sum                                # or by hand, without fetching
```

This writes the problem file and the viz route from `templates/`. The LeetCode method is left for you to solve.
In Claude Code, the `leetcode-problem` skill goes further: it adds verified edge cases and builds the visualization too.

## Checks

```bash
uv run pytest            # every Python problem
uv run ruff format .     # format
uv run ruff check .      # lint (pyflakes, imports, modern syntax, bugbear, Google docstrings)
cd viz && pnpm test      # every viz trace against every Python case
cd viz && pnpm check     # svelte-check / TypeScript
```

## Layout

```
problem.py               Problem base class and helpers (keep problem.pyi in sync)
main.py                  the CLI above; also exports cases and metadata to the viz
leetcode.py              fetches problem data from LeetCode's GraphQL API (stdlib only)
problems/                one file per problem
studyplans/              Top Interview 150 sections, in plan order
templates/               scaffolds used by `main.py new`
viz/                     SvelteKit 3 / Svelte 5 app
  src/routes/<N>/        one problem: problem.ts (the trace) and +page.svelte (figure + recall)
  src/lib/components/    the shared page, controls and isometric figure parts
  src/lib/generated/     written by main.py from the Python files; never edited by hand
```

The look follows [Anatomy](https://skills.wheresryan.sh/anatomy): a quiet technical plate with five themes (paper, light, dark, blueprint, sepia).
UI motion uses the tokens and snippets from [transitions.dev](https://transitions.dev), and respects reduced-motion settings.
`CLAUDE.md` has the full conventions for problem files and visualizations.

## Deploy

Every push to `main` runs `.github/workflows/pages.yml`. It regenerates the viz data from the Python files, runs the viz tests, builds the static site, and publishes it to GitHub Pages.
