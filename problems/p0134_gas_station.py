"""134. Gas Station

Pattern: greedy one pass, reset the start when the tank goes negative.
Recall: if the tank runs dry going from start to i, no station in start..i can be the
start, so restart at i + 1 with an empty tank. A start exists iff sum(gas) >= sum(cost).
Viz: viz/src/routes/134/  (uv run main.py 134 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 134
    title = "Gas Station"
    url = "https://leetcode.com/problems/gas-station/"
    viz = "viz/src/routes/134/+page.svelte"

    def solve(self, gas: list[int], cost: list[int]) -> int:
        return self.canCompleteCircuit(gas, cost)

    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        """Find the station to start from to drive the whole circle once.

        Args:
            gas: gas[i] is the fuel picked up at station i; 0 <= gas[i] <= 10^4.
            cost: cost[i] is the fuel used to drive from station i to i + 1;
                same length as gas, 1 <= n <= 10^5.

        Returns:
            The unique starting index that completes the circuit, or -1 if none does.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 134`
EXAMPLES = [
    example([1, 2, 3, 4, 5], [3, 4, 5, 1, 2], expected=3),
    example([2, 3, 4], [3, 4, 3], expected=-1),
]

# Edge cases on top of the examples: `uv run main.py 134 --test`
CASES = [
    pytest.param([5], [4], 0, id="single_station_enough"),
    pytest.param([4], [5], -1, id="single_station_short"),
    pytest.param([0], [0], 0, id="single_station_zero"),
    pytest.param([3, 1], [2, 2], 0, id="start_at_first"),
    pytest.param([1, 3], [2, 2], 1, id="start_at_last"),
    pytest.param([5, 1, 2, 3, 4], [4, 4, 1, 5, 1], 4, id="start_at_end_after_resets"),
    pytest.param([2, 0, 0, 5], [1, 2, 3, 1], 3, id="reset_more_than_once"),
    pytest.param([1, 2, 3, 4], [2, 3, 4, 2], -1, id="total_short_by_one"),
    pytest.param([3, 1, 1], [1, 2, 2], 0, id="total_exactly_enough"),
    pytest.param([10000, 0], [0, 10000], 0, id="value_bounds"),
    pytest.param([0, 0, 10000], [5000, 5000, 0], 2, id="all_gas_at_one_station"),
    pytest.param(
        [0] * 99999 + [10000],
        [1 if i % 10 == 8 else 0 for i in range(99999)] + [0],
        99999,
        id="maximum_size_start_last",
    ),
    pytest.param(
        [10000 if i == 50000 else 0 for i in range(100000)],
        [1 if i % 10 == 9 else 0 for i in range(100000)],
        50000,
        id="maximum_size_start_middle",
    ),
    pytest.param(
        [0] * 99999 + [10000],
        [1] * 99999 + [10000],
        -1,
        id="maximum_size_short",
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
