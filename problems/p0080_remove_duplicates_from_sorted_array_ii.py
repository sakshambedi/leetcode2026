"""80. Remove Duplicates from Sorted Array II

Pattern: two pointers, read and write (fast / slow) in place.
Recall: sorted, so a value may be kept unless the two kept values before the write head
already equal it; compare nums[i] with nums[k - 2], not nums[k - 1]. Write at k and step k.
Viz: viz/src/routes/80/  (uv run main.py 80 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 80
    title = "Remove Duplicates from Sorted Array II"
    url = "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/"
    difficulty = "Medium"
    pattern = "Two pointers · in place"
    viz = "viz/src/routes/80/+page.svelte"

    def solve(self, nums: list[int]) -> tuple[int, list[int]]:
        k = self.removeDuplicates(nums)
        return k, nums[:k]

    def removeDuplicates(self, nums: list[int]) -> int:
        """Remove extra duplicates in place so each value appears at most twice, keeping order.

        Args:
            nums: Integers sorted in non-decreasing order. Modified in place.

        Returns:
            k, the length of the result; it ends up in ``nums[:k]``.
        """
        if len(nums) <= 1:
            return len(nums)

        return 1


# Examples from the problem statement: `uv run main.py 80`
# expected is (k, the first k values of nums); the judge checks their order too.
EXAMPLES = [
    example([1, 1, 1, 2, 2, 3], expected=(5, [1, 1, 2, 2, 3])),
    example([0, 0, 1, 1, 1, 1, 2, 3, 3], expected=(7, [0, 0, 1, 1, 2, 3, 3])),
]

# Edge cases on top of the examples: `uv run main.py 80 --test`
CASES = [
    pytest.param([5], (1, [5]), id="single_element"),
    pytest.param([1, 1], (2, [1, 1]), id="two_equal_values"),
    pytest.param([1, 2], (2, [1, 2]), id="two_distinct_values"),
    pytest.param([4, 4, 4], (2, [4, 4]), id="three_equal_values"),
    pytest.param([2, 2, 2, 2, 2, 2], (2, [2, 2]), id="every_value_the_same"),
    pytest.param([1, 2, 3, 4], (4, [1, 2, 3, 4]), id="no_duplicates"),
    pytest.param([1, 1, 2, 2, 3, 3], (6, [1, 1, 2, 2, 3, 3]), id="pairs_only"),
    pytest.param([0, 0, 0, 0, 1, 2], (4, [0, 0, 1, 2]), id="long_run_at_start"),
    pytest.param([1, 2, 3, 3, 3, 3], (4, [1, 2, 3, 3]), id="long_run_at_end"),
    pytest.param([1, 2, 2, 2, 2, 3, 4], (5, [1, 2, 2, 3, 4]), id="long_run_in_middle"),
    pytest.param(
        [-3, -3, -3, -1, 0, 0, 0, 2],
        (6, [-3, -3, -1, 0, 0, 2]),
        id="negative_values",
    ),
    pytest.param(
        [-10000, -10000, -10000, 10000, 10000, 10000],
        (4, [-10000, -10000, 10000, 10000]),
        id="value_bounds",
    ),
    pytest.param([7] * 30000, (2, [7, 7]), id="maximum_size_all_same"),
    pytest.param(
        sorted(list(range(-10000, 5000)) * 2),
        (30000, sorted(list(range(-10000, 5000)) * 2)),
        id="maximum_size_every_value_twice",
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
