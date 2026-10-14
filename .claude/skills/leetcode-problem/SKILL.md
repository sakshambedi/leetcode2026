---
name: leetcode-problem
description: Add a LeetCode problem to this practice repo end to end. Fetches the statement from a leetcode.com URL or slug, scaffolds problems/pNNNN_<slug>.py with the statement examples and verified edge cases (leaving the solution for the user), and builds the step-through visualization route in viz/src/routes/N/. Use when the user shares a LeetCode link, names a LeetCode problem to add, or asks to "do this for" a new question.
---

# Add a LeetCode problem

Input: a LeetCode URL (study-plan query strings are fine) or a slug like `two-sum`.
Read `CLAUDE.md` first; it defines the file layout, the Python file shape and the viz conventions this skill follows.
`problems/p0026_remove_duplicates_from_sorted_array.py` and `viz/src/routes/26/` are a finished example made with this skill.

## 1. Fetch the problem

```bash
uv run leetcode.py "<url or slug>"
```

This prints JSON: number, title, difficulty, tags, the plain-text statement (examples and constraints included), the python3 starter code, and the method name and parameter types.
Read the whole statement. Note:
- what is returned, and whether the input is modified in place;
- whether the judge accepts any order or any valid answer;
- the constraints: size limits, value ranges, sortedness, guarantees.

Premium problems have no public statement; tell the user and stop.

## 2. Scaffold, without overwriting the user's work

```bash
ls problems/p$(printf %04d N)_* viz/src/routes/N 2>/dev/null   # already started?
uv run main.py new "<url or slug>"
```

`new` skips files that exist. If the user already started, edit their files in place:
- **Never** replace or "fix" the body of the LeetCode method. That's their practice.
- Only fill in what the steps below describe.

## 3. Python file: `problems/pNNNN_<slug>.py`

1. **Docstring:** `Pattern:` (e.g. "two pointers, read and write (fast / slow) in place") and `Recall:`, two sentences that unlock the solution.
   **Class attributes:** `difficulty` is filled from LeetCode; replace the `pattern` TODO with a short `"Family · detail"` label.
   Reuse a family already in `uv run main.py list` when it fits (Two pointers, Sliding window, Greedy, ...), since the index filters by family.
2. **`solve()`:** adapt it so its return value can be compared with `expected`.
   - In-place with a count, like Remove Element: `k = self.method(nums); return k, nums[:k]`, with `expected=(k, [...])`.
   - In-place with no return: call the method, then return the mutated input.
   - Override `check()` only when the judge accepts several answers (any order, any valid index pair, ...). Mirror the judge exactly.
3. **The LeetCode method:** leave it unsolved (`raise NotImplementedError  # your solution`, or the user's stub). Write a solution only if the user asks for one.
   - **Signature:** typed with builtins (`list[int]`, `TreeNode | None`). `main.py new` converts LeetCode's `List` / `Optional` for you.
   - **Docstring:** Google style, so editor hovers render it. Replace the TODOs with a one-line summary, an `Args:` entry per parameter (meaning, constraints, "Modified in place." when it is), and `Returns:`.
     If the user pasted LeetCode's old reST docstring (`:type nums: List[int]`), convert it to this style and type the signature, without touching the body.
   - **Node classes:** for linked-list or tree problems, define `ListNode` / `TreeNode` at the top of the problem file, as LeetCode's commented starter shows.
4. **`EXAMPLES`:** every example from the statement, verbatim, with `example(*args, expected=...)`. Turn underscores in the expected output into the compared shape (e.g. `(2, [1, 2])`).
5. **`CASES`:** 10–15 edge cases as `pytest.param(*args, expected, id="snake_case")`. The **expected value always comes last**.
   - Cover: minimum size, two elements, all-equal, nothing-to-do, everything-to-do, boundary values from the constraints, negatives/zero when allowed, patterns at the start, middle and end.
   - Add one or two maximum-size cases built with expressions like `[7] * 30000`.
   - Every input must satisfy the constraints.
6. **Copy inputs in the test:** the test must call `solution.solve(*copy.deepcopy(args))`.

**Verify the expected values** with a throwaway reference solution. It lives in `/tmp` and never goes in the repo:

```bash
mkdir -p /tmp/lcN && cat > /tmp/lcN/reference.py   # METHOD = "<methodName>" and def reference(self, ...): a correct solution
uv run python .claude/skills/leetcode-problem/check_cases.py N /tmp/lcN/reference.py
```

All cases must pass. If one fails, the expected value is wrong; fix the case, never the reference to match.
After this, `uv run main.py N --test` failing only because the method is unsolved is expected.

**Non-array inputs:** keep `EXAMPLES` / `CASES` args JSON-like (lists, ints, strings) so they export to the viz. Convert inside `solve()`, e.g. a list to `ListNode` and back, defining the node class in the problem file.

## 4. Visualization: `viz/src/routes/N/`

Follow the "Visualization" section of `CLAUDE.md`. In short:

- **`problem.ts`:**
  - `meta`: a one-sentence lede. Difficulty and pattern live on the Python class.
  - `trace(args)`: the canonical solution. Each step is a full-state snapshot with a *why* `msg` and the `line` of `code` it runs.
  - `vars`: every variable the code uses, each with a short note.
  - `result`: the answer in the same shape as Python's `expected`.
  - `check`: same rules as the Python `check`.
  - `toArgs`: rejects Custom input that breaks the constraints (unsorted, empty, ...).
- **`+page.svelte`:**
  - `<ProblemPage>` with a `figure` snippet. Arrays use `<ArrayRow>` with `up` / `free` / `spent` states, one `lit` tile, pointer labels, and the write pointer `strong`.
  - The `recall` snippet: Key insight, Invariant, Each step, Stop when, Pitfall, Cost.
  - `code`: the core loop, using the same names as the figure. Mention a related problem in the Pitfall when it helps tell them apart.
- **New drawing needs** (grid, tree, linked list, hash map, stack): add a reusable component under `viz/src/lib/components/figure/` in the Anatomy style. Don't draw ad hoc SVG in the route.

## 5. Verify, and look

```bash
uv run ruff format . && uv run ruff check .   # clean, apart from findings inside the user's unfinished method body
uv run main.py viz serve            # exports cases, starts the dev server
cd viz && pnpm check && pnpm test   # 0 errors; every case's trace matches pytest's expected
/usr/bin/python3 .claude/skills/leetcode-problem/shoot.py N --case "Example 2"
```

`shoot.py` saves the start, middle and end steps in paper and dark themes to `/tmp/viz-shots/`, and prints the Output verdict and any page errors.
**Read the screenshots.** Check that:
- the figure matches each step's narration;
- free and spent slots are where the invariant says;
- labels are readable and nothing overlaps;
- the end shows "✓ matches".

Fix what looks wrong and shoot again.

## 6. Report to the user

Keep it short:
- the files created or changed;
- how many examples and edge cases there are, and that a reference solution confirmed them;
- that the method is left for them to solve;
- how to run it: `uv run main.py N` (examples), `uv run main.py N --test` (all cases), `uv run main.py N --viz` (visualization).
