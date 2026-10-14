"""27. Remove Element

Pattern: two pointers, read and write (fast / slow) in place.
Recall: k is the write head for the next kept value. Read every value with i and copy
each one that isn't val to nums[k]. k never passes i, so a write only lands on a slot
that was already read. Return k; whatever sits past it doesn't matter.
Viz: viz/src/routes/27/  (uv run main.py 27 --viz)
"""

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 27
    title = "Remove Element"
    url = "https://leetcode.com/problems/remove-element/"
    viz = "viz/src/routes/27/+page.svelte"

    def solve(self, nums: list[int], val: int) -> tuple[int, list[int]]:
        k = self.removeElement(nums, val)
        return k, nums[:k]

    def check(
        self, result: tuple[int, list[int]], expected: tuple[int, list[int]]
    ) -> bool:
        # The judge accepts the first k values in any order.
        (k, kept), (want_k, want_kept) = result, expected
        return k == want_k and sorted(kept) == sorted(want_kept)

    def removeElement(self, nums: list[int], val: int) -> int:
        """Remove every val from nums in place; return how many values remain."""
        j = 0
        for i in range(len(nums)):
            if nums[i] != val:
                nums[j] = nums[i]
                j += 1
        return j


# Examples from the problem statement: `uv run main.py 27`
# expected is (k, the first k values of nums); their order doesn't matter.
EXAMPLES = [
    example([3, 2, 2, 3], 3, expected=(2, [2, 2])),
    example([0, 1, 2, 2, 3, 0, 4, 2], 2, expected=(5, [0, 1, 4, 0, 3])),
]

# Edge cases on top of the examples: `uv run main.py 27 --test`
CASES = [
    pytest.param([], 0, (0, []), id="empty_nums"),
    pytest.param([1], 1, (0, []), id="single_element_removed"),
    pytest.param([1], 2, (1, [1]), id="single_element_kept"),
    pytest.param([4, 4, 4, 4], 4, (0, []), id="every_value_removed"),
    pytest.param([1, 2, 3, 4], 5, (4, [1, 2, 3, 4]), id="val_not_present"),
    pytest.param([5, 5, 1, 2], 5, (2, [1, 2]), id="val_only_at_front"),
    pytest.param([1, 2, 5, 5], 5, (2, [1, 2]), id="val_only_at_back"),
    pytest.param([3, 1, 2, 3], 3, (2, [1, 2]), id="val_at_both_ends"),
    pytest.param([1, 2, 1, 2, 1], 2, (3, [1, 1, 1]), id="alternating_values"),
    pytest.param([0, 1, 0, 2, 0], 0, (2, [1, 2]), id="val_is_zero"),
    pytest.param([50, 49, 0], 100, (3, [50, 49, 0]), id="val_above_value_range"),
    pytest.param([7, 7, 7, 3], 7, (1, [3]), id="one_survivor_at_end"),
    pytest.param([50] * 100, 50, (0, []), id="maximum_size_all_removed"),
    pytest.param([0, 1] * 50, 1, (50, [0] * 50), id="maximum_size_half_removed"),
    pytest.param(
        list(range(50)) * 2,
        50,
        (100, list(range(50)) * 2),
        id="maximum_size_none_removed",
    ),
]


@pytest.mark.parametrize("nums, val, expected", problem.as_params(EXAMPLES) + CASES)
def test_remove_element(nums, val, expected):
    solution = Solution()
    assert solution.check(solution.solve(nums.copy(), val), expected)
