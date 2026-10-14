"""121. Best Time to Buy and Sell Stock

Pattern: one pass, running minimum (greedy / Kadane-style).
Recall: the best sell on day i buys at the lowest price seen before it. Walk once, keep
the cheapest price so far and the best prices[i] - cheapest; never look back.
Viz: viz/src/routes/121/  (uv run main.py 121 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 121
    title = "Best Time to Buy and Sell Stock"
    url = "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
    difficulty = "Easy"
    pattern = "One pass · running minimum"
    viz = "viz/src/routes/121/+page.svelte"

    def solve(self, prices: list[int]) -> int:
        return self.maxProfit(prices)

    def maxProfit(self, prices: list[int]) -> int:
        """Find the best profit from one buy followed by one later sell.

        Args:
            prices: prices[i] is the stock price on day i; 1 <= len <= 10^5,
                0 <= prices[i] <= 10^4.

        Returns:
            The maximum profit of a single transaction, or 0 if no sale makes money.
        """
        buy, profit = 0, 0
        for sell in range(1, len(prices)):
            if prices[sell] - prices[buy] > profit:
                profit = prices[sell] - prices[buy]
            if prices[buy] > prices[sell]:
                buy = sell
        return profit


# Examples from the problem statement: `uv run main.py 121`
EXAMPLES = [
    example([7, 1, 5, 3, 6, 4], expected=5),
    example([7, 6, 4, 3, 1], expected=0),
]

# Edge cases on top of the examples: `uv run main.py 121 --test`
CASES = [
    pytest.param([5], 0, id="single_day"),
    pytest.param([1, 2], 1, id="two_days_rising"),
    pytest.param([2, 1], 0, id="two_days_falling"),
    pytest.param([3, 3, 3, 3], 0, id="flat_prices"),
    pytest.param([1, 2, 3, 4, 5], 4, id="strictly_rising"),
    pytest.param([2, 4, 1], 2, id="new_minimum_after_best_sale"),
    pytest.param([3, 8, 1, 4], 5, id="best_sale_before_lower_minimum"),
    pytest.param([3, 8, 1, 10], 9, id="best_sale_before_lower_minimum"),
    pytest.param([5, 9, 1, 6, 2, 8], 7, id="later_minimum_gives_better_profit"),
    pytest.param([4, 7, 2, 4, 1, 3], 3, id="lower_minimums_never_beat_first"),
    pytest.param([0, 10000], 10000, id="value_bounds"),
    pytest.param([10000, 0], 0, id="value_bounds_falling"),
    pytest.param([9, 3, 5, 0, 1, 2, 0, 4], 4, id="minimum_repeats"),
    pytest.param([10000 - i // 10 for i in range(100000)], 0, id="maximum_size_falling"),
    pytest.param([i % 10001 for i in range(100000)], 10000, id="maximum_size_sawtooth"),
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
