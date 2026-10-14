"""26. Remove Duplicates from Sorted Array

Pattern: two pointers, read and write (fast / slow) in place.
Recall: the array is sorted, so duplicates sit next to each other. A value is new exactly
when it differs from the last value kept, nums[k - 1]; write new values at k and step k.
Viz: viz/src/routes/26/  (uv run main.py 26 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 26
    title = "Remove Duplicates from Sorted Array"
    url = "https://leetcode.com/problems/remove-duplicates-from-sorted-array/"
    viz = "viz/src/routes/26/+page.svelte"

    def solve(self, nums: list[int]) -> tuple[int, list[int]]:
        k = self.removeDuplicates(nums)
        return k, nums[:k]

    def removeDuplicates(self, nums: list[int]) -> int:
        """Remove duplicates in place so each value appears once, keeping their order.

        Args:
            nums: Integers sorted in non-decreasing order. Modified in place.

        Returns:
            k, the number of unique values; they end up in ``nums[:k]``.
        """
        start = 1
        for i in range(1, len(nums)):
            if nums[i] != nums[start - 1]:
                nums[start] = nums[i]
                start += 1

        return start


# Examples from the problem statement: `uv run main.py 26`
# expected is (k, the first k values of nums); the judge checks their order too.
EXAMPLES = [
    example([1, 1, 2], expected=(2, [1, 2])),
    example([0, 0, 1, 1, 1, 2, 2, 3, 3, 4], expected=(5, [0, 1, 2, 3, 4])),
]

# Edge cases on top of the examples: `uv run main.py 26 --test`
CASES = [
    pytest.param([5], (1, [5]), id="single_element"),
    pytest.param([1, 1], (1, [1]), id="two_equal_values"),
    pytest.param([1, 2], (2, [1, 2]), id="two_distinct_values"),
    pytest.param([2, 2, 2, 2], (1, [2]), id="every_value_the_same"),
    pytest.param([1, 2, 3, 4], (4, [1, 2, 3, 4]), id="no_duplicates"),
    pytest.param([0, 0, 0, 1, 2], (3, [0, 1, 2]), id="duplicates_only_at_start"),
    pytest.param([1, 2, 3, 3, 3], (3, [1, 2, 3]), id="duplicates_only_at_end"),
    pytest.param([-3, -3, -1, 0, 0, 2], (4, [-3, -1, 0, 2]), id="negative_values"),
    pytest.param([-100, -100, 100, 100], (2, [-100, 100]), id="value_bounds"),
    pytest.param(
        [1, 1, 2, 3, 3, 4, 5, 5], (5, [1, 2, 3, 4, 5]), id="runs_of_mixed_length"
    ),
    pytest.param([7] * 30000, (1, [7]), id="maximum_size_all_same"),
    pytest.param(
        sorted(list(range(-100, 101)) * 149 + list(range(-100, -49))),
        (201, list(range(-100, 101))),
        id="maximum_size_full_value_range",
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
