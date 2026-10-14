"""238. Product of Array Except Self

Pattern: prefix and suffix products, two passes, no division.
Recall: answer[i] is (product of everything left of i) times (product of everything right
of i). Fill answer with left products going right, then sweep back multiplying in a running
right product.
Viz: viz/src/routes/238/  (uv run main.py 238 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 238
    title = "Product of Array Except Self"
    url = "https://leetcode.com/problems/product-of-array-except-self/"
    difficulty = "Medium"
    pattern = "Prefix and suffix products · two passes"
    viz = "viz/src/routes/238/+page.svelte"

    def solve(self, nums: list[int]) -> list[int]:
        return self.productExceptSelf(nums)

    def productExceptSelf(self, nums: list[int]) -> list[int]:
        """Return the product of every other element for each position, without division.

        Args:
            nums: 2 to 10^5 integers in [-30, 30]; every prefix and suffix product fits in
                32 bits.

        Returns:
            answer, where answer[i] is the product of all of nums except nums[i].
        """
        answer, prefix = [1] * len(nums), 1
        for i, value in enumerate(nums):
            answer[i], prefix = prefix, prefix * value
        suffix = 1
        for i in range(len(nums) - 1, -1, -1):
            answer[i], suffix = answer[i] * suffix, suffix * nums[i]
        return answer


# Examples from the problem statement: `uv run main.py 238`
EXAMPLES = [
    example([1, 2, 3, 4], expected=[24, 12, 8, 6]),
    example([-1, 1, 0, -3, 3], expected=[0, 0, 9, 0, 0]),
]

# Edge cases on top of the examples: `uv run main.py 238 --test`
CASES = [
    pytest.param([2, 3], [3, 2], id="two_elements"),
    pytest.param([0, 0], [0, 0], id="two_zeros_only"),
    pytest.param([0, 4, 5], [20, 0, 0], id="one_zero_at_start"),
    pytest.param([3, 4, 0], [0, 0, 12], id="one_zero_at_end"),
    pytest.param([0, 2, 0, 3], [0, 0, 0, 0], id="two_zeros_everything_zero"),
    pytest.param([1, 1, 1, 1], [1, 1, 1, 1], id="all_ones"),
    pytest.param([-1, -2, -3], [6, 3, 2], id="all_negative"),
    pytest.param([-1, -1, -1, -1], [-1, -1, -1, -1], id="negative_ones"),
    pytest.param([-30, 30], [30, -30], id="value_bounds"),
    pytest.param([2, 3, 4, 5], [60, 40, 30, 24], id="distinct_growing"),
    pytest.param([5, 1, 1, 1, 1, 7], [7, 35, 35, 35, 35, 5], id="ones_in_the_middle"),
    pytest.param([2] * 30, [2**29] * 30, id="large_powers_of_two"),
    pytest.param([1] * 100000, [1] * 100000, id="maximum_size_all_ones"),
    pytest.param([-1] * 99999 + [0], [0] * 99999 + [-1], id="maximum_size_zero_at_end"),
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
