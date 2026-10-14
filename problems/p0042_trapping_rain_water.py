"""42. Trapping Rain Water

Pattern: two pointers from both ends, tracking left_max and right_max.
Recall: water over a bar is min(tallest on its left, tallest on its right) minus the bar.
Move the side with the lower max: that max is the limit there, whatever lies between.
Viz: viz/src/routes/42/  (uv run main.py 42 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 42
    title = "Trapping Rain Water"
    url = "https://leetcode.com/problems/trapping-rain-water/"
    difficulty = "Hard"
    pattern = "Two pointers · running max from each end"
    viz = "viz/src/routes/42/+page.svelte"

    def solve(self, height: list[int]) -> int:
        return self.trap(height)

    def trap(self, height: list[int]) -> int:
        """Count the units of rain water an elevation map traps.

        Args:
            height: 1 to 2 * 10^4 bar heights in [0, 10^5], each bar one unit wide.

        Returns:
            The total units of water held between the bars.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 42`
EXAMPLES = [
    example([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], expected=6),
    example([4, 2, 0, 3, 2, 5], expected=9),
]

# Edge cases on top of the examples: `uv run main.py 42 --test`
CASES = [
    pytest.param([5], 0, id="single_bar"),
    pytest.param([2, 0], 0, id="two_bars"),
    pytest.param([0, 0, 0], 0, id="flat_ground"),
    pytest.param([1, 0, 1], 1, id="smallest_basin"),
    pytest.param([2, 2, 2], 0, id="flat_bars"),
    pytest.param([1, 2, 3, 4], 0, id="strictly_increasing"),
    pytest.param([4, 3, 2, 1], 0, id="strictly_decreasing"),
    pytest.param([1, 3, 5, 3, 1], 0, id="mountain"),
    pytest.param([2, 0, 2, 0, 2], 4, id="two_basins"),
    pytest.param([3, 0, 0, 2, 0, 4], 10, id="lower_inner_wall"),
    pytest.param([5, 2, 1, 2, 1, 5], 14, id="uneven_floor"),
    pytest.param([0, 4, 0, 1, 0, 2, 0], 5, id="walls_off_the_ends"),
    pytest.param([100000, 0, 100000], 100000, id="value_bounds"),
    pytest.param([1, 0] * 10000, 9999, id="maximum_size_alternating"),
    pytest.param(
        [100000] + [0] * 19998 + [100000], 1999800000, id="maximum_size_one_wide_pool"
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
