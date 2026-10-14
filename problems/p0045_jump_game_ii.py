"""45. Jump Game II

Pattern: greedy BFS by levels over the array (end / far / jumps).
Recall: cells reachable in k jumps form a contiguous window ending at `end`. Scan it while
tracking `far`, the farthest any cell in it can jump; when i hits end, take a jump: end = far.
Viz: viz/src/routes/45/  (uv run main.py 45 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 45
    title = "Jump Game II"
    url = "https://leetcode.com/problems/jump-game-ii/"
    difficulty = "Medium"
    pattern = "Greedy · BFS by levels"
    viz = "viz/src/routes/45/+page.svelte"

    def solve(self, nums: list[int]) -> int:
        return self.jump(nums)

    def jump(self, nums: list[int]) -> int:
        """Count the fewest jumps from index 0 to the last index.

        Args:
            nums: Maximum forward jump length at each index; 1 <= len(nums) <= 10^4,
                0 <= nums[i] <= 1000. The last index is always reachable.

        Returns:
            The minimum number of jumps needed to reach index len(nums) - 1.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 45`
EXAMPLES = [
    example([2, 3, 1, 1, 4], expected=2),
    example([2, 3, 0, 1, 4], expected=2),
]

# Edge cases on top of the examples: `uv run main.py 45 --test`
CASES = [
    pytest.param([0], 0, id="single_element_no_jump"),
    pytest.param([1, 0], 1, id="two_elements"),
    pytest.param([2, 1], 1, id="jump_longer_than_needed"),
    pytest.param([1, 1, 1, 1], 3, id="all_ones_one_step_each"),
    pytest.param([4, 1, 1, 1, 1], 1, id="first_jump_reaches_end"),
    pytest.param([1, 2, 3], 2, id="growing_jumps"),
    pytest.param([1, 2, 1, 1, 1], 3, id="short_hops_at_end"),
    pytest.param([2, 0, 2, 0, 1], 2, id="land_exactly_past_zeros"),
    pytest.param([3, 4, 3, 1, 0, 7, 0, 0, 0, 0], 3, id="longest_first_jump_is_a_trap"),
    pytest.param(
        [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0], 2, id="one_short_then_one_more"
    ),
    pytest.param([1000, 0, 0, 0, 0, 0], 1, id="jump_length_upper_bound"),
    pytest.param([1] * 10000, 9999, id="maximum_size_all_ones"),
    pytest.param([2] * 10000, 5000, id="maximum_size_all_twos"),
    pytest.param([1000] * 10000, 10, id="maximum_size_all_max_jumps"),
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
