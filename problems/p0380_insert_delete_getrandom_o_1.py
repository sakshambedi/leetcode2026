"""380. Insert Delete GetRandom O(1)

Pattern: design, array + hash map (value -> index), swap-with-last delete.
Recall: keep the values packed in a list so a random index is a uniform pick, and a dict
from value to its index. To remove, move the last value into the hole and pop the end.
Viz: viz/src/routes/380/  (uv run main.py 380 --viz)
"""

import copy

import pytest

import problem
from problem import example


class RandomizedSet:
    """A set of ints with average O(1) insert, remove and uniform random pick."""

    def __init__(self):
        """Create an empty set."""
        raise NotImplementedError  # your solution

    def insert(self, val: int) -> bool:
        """Add ``val`` if it is not in the set yet.

        Args:
            val: The value to add, -2**31 <= val <= 2**31 - 1.

        Returns:
            True if ``val`` was added, False if it was already present.
        """
        raise NotImplementedError  # your solution

    def remove(self, val: int) -> bool:
        """Remove ``val`` if it is in the set.

        Args:
            val: The value to remove, -2**31 <= val <= 2**31 - 1.

        Returns:
            True if ``val`` was present and removed, False otherwise.
        """
        raise NotImplementedError  # your solution

    def getRandom(self) -> int:
        """Pick a value from the set, each with the same probability.

        Returns:
            One of the current values. The set is never empty when this is called.
        """
        raise NotImplementedError  # your solution


class Solution(problem.Problem):
    number = 380
    title = "Insert Delete GetRandom O(1)"
    url = "https://leetcode.com/problems/insert-delete-getrandom-o1/"
    viz = "viz/src/routes/380/+page.svelte"

    def solve(
        self, operations: list[str], values: list[list[int]]
    ) -> list[bool | int | None]:
        """Replay LeetCode's call list; the constructor's output is None."""
        rs = None
        out: list[bool | int | None] = []
        for op, args in zip(operations, values, strict=True):
            if op == "RandomizedSet":
                rs = RandomizedSet()
                out.append(None)
            else:
                out.append(getattr(rs, op)(*args))
        return out

    def check(self, result: list, expected: list) -> bool:
        """Accept any valid value at getRandom, whose expected entry lists them all."""
        if len(result) != len(expected):
            return False
        for r, e in zip(result, expected, strict=True):
            if isinstance(e, list):
                if type(r) is not int or r not in e:
                    return False
            elif type(r) is not type(e) or r != e:
                return False
        return True


# Examples from the problem statement: `uv run main.py 380`
# expected: None for the constructor, the bool for insert/remove, and for getRandom the
# sorted list of values in the set at that moment (any one of them is accepted).
EXAMPLES = [
    example(
        [
            "RandomizedSet",
            "insert",
            "remove",
            "insert",
            "getRandom",
            "remove",
            "insert",
            "getRandom",
        ],
        [[], [1], [2], [2], [], [1], [2], []],
        expected=[None, True, False, True, [1, 2], True, False, [2]],
    ),
]

_N = 20000  # many calls: insert 0..N-1, then remove from the front, so every remove swaps

# Edge cases on top of the examples: `uv run main.py 380 --test`
CASES = [
    pytest.param(
        ["RandomizedSet", "insert", "getRandom"],
        [[], [5], []],
        [None, True, [5]],
        id="single_value_get_random",
    ),
    pytest.param(
        ["RandomizedSet", "insert", "insert", "getRandom"],
        [[], [1], [1], []],
        [None, True, False, [1]],
        id="duplicate_insert_returns_false",
    ),
    pytest.param(
        ["RandomizedSet", "remove", "insert", "getRandom"],
        [[], [1], [1], []],
        [None, False, True, [1]],
        id="remove_from_empty_set",
    ),
    pytest.param(
        ["RandomizedSet", "insert", "remove", "remove", "insert", "getRandom"],
        [[], [3], [3], [3], [4], []],
        [None, True, True, False, True, [4]],
        id="remove_twice",
    ),
    pytest.param(
        ["RandomizedSet", "insert", "insert", "insert", "remove", "getRandom"],
        [[], [1], [2], [3], [3], []],
        [None, True, True, True, True, [1, 2]],
        id="remove_last_value_no_swap",
    ),
    pytest.param(
        [
            "RandomizedSet",
            "insert",
            "insert",
            "insert",
            "remove",
            "getRandom",
            "insert",
            "remove",
            "getRandom",
        ],
        [[], [1], [2], [3], [1], [], [4], [3], []],
        [None, True, True, True, True, [2, 3], True, True, [2, 4]],
        id="remove_first_value_swaps_last_in",
    ),
    pytest.param(
        [
            "RandomizedSet",
            "insert",
            "insert",
            "remove",
            "remove",
            "insert",
            "getRandom",
        ],
        [[], [8], [9], [9], [8], [8], []],
        [None, True, True, True, True, True, [8]],
        id="empty_then_reinsert",
    ),
    pytest.param(
        ["RandomizedSet", "insert", "remove", "getRandom", "getRandom"],
        [[], [1], [2], [], []],
        [None, True, False, [1], [1]],
        id="remove_missing_value_from_nonempty_set",
    ),
    pytest.param(
        ["RandomizedSet", "insert", "insert", "insert", "remove", "getRandom"],
        [[], [-1], [0], [-7], [-1], []],
        [None, True, True, True, True, [-7, 0]],
        id="negative_values_and_zero",
    ),
    pytest.param(
        ["RandomizedSet", "insert", "insert", "remove", "getRandom", "remove"],
        [[], [-(2**31)], [2**31 - 1], [-(2**31)], [], [2**31 - 1]],
        [None, True, True, True, [2**31 - 1], True],
        id="int32_bounds",
    ),
    pytest.param(
        [
            "RandomizedSet",
            "remove",
            "remove",
            "insert",
            "getRandom",
            "remove",
            "insert",
        ],
        [[], [0], [0], [0], [], [0], [0]],
        [None, False, False, True, [0], True, True],
        id="same_value_in_and_out",
    ),
    pytest.param(
        ["RandomizedSet"] + ["insert"] * _N + ["remove"] * (_N - 1) + ["getRandom"],
        [[]] + [[v] for v in range(_N)] + [[v] for v in range(_N - 1)] + [[]],
        [None] + [True] * (2 * _N - 1) + [[_N - 1]],
        id="many_calls_every_remove_swaps",
    ),
]


@pytest.mark.parametrize(
    "args, expected",
    [
        pytest.param(p.values[:-1], p.values[-1], id=p.id)
        for p in problem.as_params(EXAMPLES) + CASES
    ],
)
def test_solve(args, expected):
    solution = Solution()
    assert solution.check(solution.solve(*copy.deepcopy(args)), expected)
