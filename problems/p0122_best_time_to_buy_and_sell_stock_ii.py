"""122. Best Time to Buy and Sell Stock II

Pattern: greedy, sum of positive day-to-day differences.
Recall: any rising stretch splits into its daily steps, so with unlimited trades the best
profit is just every positive prices[i] - prices[i - 1] added up.
Viz: viz/src/routes/122/  (uv run main.py 122 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 122
    title = "Best Time to Buy and Sell Stock II"
    url = "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/"
    difficulty = "Medium"
    pattern = "Greedy · sum of positive differences"
    viz = "viz/src/routes/122/+page.svelte"

    def solve(self, prices: list[int]) -> int:
        return self.maxProfit(prices)

    def maxProfit(self, prices: list[int]) -> int:
        """Find the best profit from any number of trades, holding one share at most.

        Args:
            prices: prices[i] is the stock price on day i; 1 <= len <= 3 * 10^4,
                0 <= prices[i] <= 10^4.

        Returns:
            The maximum total profit; 0 if prices never rise.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 122`
EXAMPLES = [
    example([7, 1, 5, 3, 6, 4], expected=7),
    example([1, 2, 3, 4, 5], expected=4),
    example([7, 6, 4, 3, 1], expected=0),
]

# Edge cases on top of the examples: `uv run main.py 122 --test`
CASES = [
    pytest.param([5], 0, id="single_day"),
    pytest.param([1, 2], 1, id="two_days_rising"),
    pytest.param([2, 1], 0, id="two_days_falling"),
    pytest.param([3, 3, 3, 3], 0, id="flat_prices"),
    pytest.param([1, 5, 1, 5, 1, 5], 12, id="zigzag"),
    pytest.param([5, 1, 2, 3], 2, id="rise_only_at_end"),
    pytest.param([1, 2, 3, 2, 1], 2, id="rise_only_at_start"),
    pytest.param([3, 1, 4, 4, 1, 5, 9, 2], 11, id="plateau_inside_rise"),
    pytest.param([2, 2, 5, 5, 3, 3, 6], 6, id="flat_days_between_moves"),
    pytest.param([0, 10000, 0, 10000], 20000, id="value_bounds"),
    pytest.param([10000, 0], 0, id="value_bounds_falling"),
    pytest.param(
        [(i % 2) * 10000 for i in range(30000)],
        150000000,
        id="maximum_size_zigzag",
    ),
    pytest.param([i // 3 for i in range(30000)], 9999, id="maximum_size_rising"),
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
