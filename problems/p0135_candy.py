"""135. Candy

Pattern: two greedy passes, left to right then right to left.
Recall: satisfy each neighbor rule on its own. Going right, a child rated above its left
neighbor gets one more; going left, take the max with one more than the right neighbor.
Viz: viz/src/routes/135/  (uv run main.py 135 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 135
    title = "Candy"
    url = "https://leetcode.com/problems/candy/"
    viz = "viz/src/routes/135/+page.svelte"

    def solve(self, ratings: list[int]) -> int:
        return self.candy(ratings)

    def candy(self, ratings: list[int]) -> int:
        """Count the fewest candies so higher-rated children beat their neighbors.

        Args:
            ratings: 1 to 5 * 10^4 ratings in [0, 5 * 10^4], one per child in line.

        Returns:
            The minimum total, with every child getting at least one candy.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 135`
EXAMPLES = [
    example([1, 0, 2], expected=5),
    example([1, 2, 2], expected=4),
]

# Edge cases on top of the examples: `uv run main.py 135 --test`
CASES = [
    pytest.param([5], 1, id="single_child"),
    pytest.param([1, 1], 2, id="two_equal"),
    pytest.param([1, 2], 3, id="two_increasing"),
    pytest.param([2, 1], 3, id="two_decreasing"),
    pytest.param([3, 3, 3, 3], 4, id="all_equal"),
    pytest.param([1, 2, 3, 4, 5], 15, id="strictly_increasing"),
    pytest.param([5, 4, 3, 2, 1], 15, id="strictly_decreasing"),
    pytest.param([3, 2, 1, 2, 3], 11, id="valley"),
    pytest.param([1, 3, 4, 5, 2], 11, id="peak_short_right_slope"),
    pytest.param([1, 2, 3, 5, 4, 3, 2, 1], 21, id="peak_long_right_slope"),
    pytest.param([1, 3, 2, 2, 1], 7, id="equal_neighbors_reset"),
    pytest.param([1, 2, 87, 87, 87, 2, 1], 13, id="plateau_between_slopes"),
    pytest.param([0, 50000, 0], 4, id="value_bounds"),
    pytest.param([0] * 50000, 50000, id="maximum_size_all_equal"),
    pytest.param(
        list(range(50000, 0, -1)), 1250025000, id="maximum_size_strictly_decreasing"
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
