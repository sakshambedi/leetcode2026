"""55. Jump Game

Pattern: greedy, farthest reach in one pass.
Recall: keep `reach`, the farthest index any visited cell can jump to. Walk i left to right;
if i ever passes reach you are stuck, otherwise stretch reach to max(reach, i + nums[i]).
Viz: viz/src/routes/55/  (uv run main.py 55 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 55
    title = "Jump Game"
    url = "https://leetcode.com/problems/jump-game/"
    difficulty = "Medium"
    pattern = "Greedy · farthest reach"
    viz = "viz/src/routes/55/+page.svelte"

    def solve(self, nums: list[int]) -> bool:
        return self.canJump(nums)

    def canJump(self, nums: list[int]) -> bool:
        """Decide whether the last index can be reached from index 0.

        Args:
            nums: Maximum jump length at each index; 1 <= len(nums) <= 10^4,
                0 <= nums[i] <= 10^5.

        Returns:
            True if some sequence of jumps lands on the last index, else False.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 55`
EXAMPLES = [
    example([2, 3, 1, 1, 4], expected=True),
    example([3, 2, 1, 0, 4], expected=False),
]

# Edge cases on top of the examples: `uv run main.py 55 --test`
CASES = [
    pytest.param([0], True, id="single_element_already_there"),
    pytest.param([1, 0], True, id="two_elements_one_step"),
    pytest.param([0, 1], False, id="stuck_at_start"),
    pytest.param([1, 1, 1, 1], True, id="all_ones"),
    pytest.param([3, 0, 0, 0], True, id="first_jump_lands_exactly_on_end"),
    pytest.param([3, 0, 0, 0, 1], False, id="first_jump_one_short"),
    pytest.param([2, 0, 0], True, id="zeros_after_a_long_enough_jump"),
    pytest.param([1, 0, 1, 0], False, id="zero_trap_in_middle"),
    pytest.param([2, 0, 1, 0, 1], False, id="reach_stalls_before_end"),
    pytest.param([1, 2, 0, 1, 0, 2], False, id="zero_trap_near_end"),
    pytest.param([2, 5, 0, 0, 0, 0], True, id="later_cell_reaches_farther"),
    pytest.param([5, 9, 3, 2, 1, 0, 2, 3, 3, 1, 0, 0], True, id="jump_over_zeros"),
    pytest.param([100000, 0, 0], True, id="jump_length_upper_bound"),
    pytest.param([1] * 10000, True, id="maximum_size_all_ones"),
    pytest.param([1] * 9998 + [0, 0], False, id="maximum_size_stuck_at_end"),
    pytest.param([10000] + [0] * 9999, True, id="maximum_size_one_big_jump"),
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
