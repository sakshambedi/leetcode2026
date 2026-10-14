"""189. Rotate Array

Pattern: in-place reversal, three reverses of a list.
Recall: rotating right by k moves the last k values to the front. Reverse the whole array,
then reverse the first k and the last n - k back into order. Take k %= n first.
Viz: viz/src/routes/189/  (uv run main.py 189 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 189
    title = "Rotate Array"
    url = "https://leetcode.com/problems/rotate-array/"
    difficulty = "Medium"
    pattern = "Three reversals · in place"
    viz = "viz/src/routes/189/+page.svelte"

    def solve(self, nums: list[int], k: int) -> list[int]:
        self.rotate(nums, k)
        return nums

    def rotate(self, nums: list[int], k: int) -> None:
        """Rotate nums to the right by k steps, in place.

        Args:
            nums: 1 to 10^5 integers. Modified in place.
            k: Steps to rotate right, 0 <= k <= 10^5; may exceed len(nums).

        Returns:
            None; nums itself holds the rotated values.
        """
        k %= len(nums)
        nums.reverse()
        nums[:k] = reversed(nums[:k])
        nums[k:] = reversed(nums[k:])


# Examples from the problem statement: `uv run main.py 189`
# expected is nums after rotating it in place.
EXAMPLES = [
    example([1, 2, 3, 4, 5, 6, 7], 3, expected=[5, 6, 7, 1, 2, 3, 4]),
    example([-1, -100, 3, 99], 2, expected=[3, 99, -1, -100]),
]

# Edge cases on top of the examples: `uv run main.py 189 --test`
CASES = [
    pytest.param([1], 0, [1], id="single_element_k_zero"),
    pytest.param([1], 5, [1], id="single_element_large_k"),
    pytest.param([1, 2], 1, [2, 1], id="two_elements_k_one"),
    pytest.param([1, 2], 2, [1, 2], id="two_elements_k_equals_n"),
    pytest.param([1, 2, 3, 4], 0, [1, 2, 3, 4], id="k_zero_nothing_to_do"),
    pytest.param([1, 2, 3, 4, 5], 1, [5, 1, 2, 3, 4], id="k_one"),
    pytest.param([1, 2, 3, 4, 5], 4, [2, 3, 4, 5, 1], id="k_n_minus_one"),
    pytest.param([1, 2, 3, 4, 5], 5, [1, 2, 3, 4, 5], id="k_equals_n"),
    pytest.param([1, 2, 3], 4, [3, 1, 2], id="k_greater_than_n"),
    pytest.param([1, 2, 3, 4, 5, 6], 3, [4, 5, 6, 1, 2, 3], id="k_half_of_n"),
    pytest.param([1, 2, 3], 100000, [3, 1, 2], id="k_maximum_small_array"),
    pytest.param([7, 7, 7, 7], 3, [7, 7, 7, 7], id="every_value_the_same"),
    pytest.param([-(2**31), 0, 2**31 - 1], 1, [2**31 - 1, -(2**31), 0], id="value_bounds"),
    pytest.param(
        list(range(100000)),
        99999,
        list(range(1, 100000)) + [0],
        id="maximum_size_k_n_minus_one",
    ),
    pytest.param(
        list(range(100000)),
        100000,
        list(range(100000)),
        id="maximum_size_k_equals_n",
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
