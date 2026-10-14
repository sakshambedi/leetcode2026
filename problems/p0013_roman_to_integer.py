"""13. Roman to Integer

Pattern: single left-to-right scan with one symbol of lookahead.
Recall: add each symbol's value, except subtract it when the next symbol is bigger
(the I in IV, the C in CM). That one comparison handles all six subtractive pairs.
Viz: viz/src/routes/13/  (uv run main.py 13 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 13
    title = "Roman to Integer"
    url = "https://leetcode.com/problems/roman-to-integer/"
    viz = "viz/src/routes/13/+page.svelte"

    def solve(self, s: str) -> int:
        return self.romanToInt(s)

    def romanToInt(self, s: str) -> int:
        """Convert a Roman numeral to the integer it represents.

        Args:
            s: A valid Roman numeral in [1, 3999], 1 to 15 characters from I, V, X, L, C, D, M.

        Returns:
            The integer value of ``s``.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 13`
EXAMPLES = [
    example("III", expected=3),
    example("LVIII", expected=58),
    example("MCMXCIV", expected=1994),
]

# Edge cases on top of the examples: `uv run main.py 13 --test`
CASES = [
    pytest.param("I", 1, id="single_symbol_minimum"),
    pytest.param("M", 1000, id="single_largest_symbol"),
    pytest.param("IV", 4, id="subtractive_four"),
    pytest.param("IX", 9, id="subtractive_nine"),
    pytest.param("XL", 40, id="subtractive_forty"),
    pytest.param("XC", 90, id="subtractive_ninety"),
    pytest.param("CD", 400, id="subtractive_four_hundred"),
    pytest.param("CM", 900, id="subtractive_nine_hundred"),
    pytest.param("XLIX", 49, id="forty_nine_is_xl_ix_not_il"),
    pytest.param("CDXLIV", 444, id="every_digit_subtractive"),
    pytest.param("DCXXI", 621, id="no_subtraction_descending"),
    pytest.param("MMM", 3000, id="repeated_symbol"),
    pytest.param("MMMCMXCIX", 3999, id="maximum_value"),
    pytest.param("MMMDCCCLXXXVIII", 3888, id="maximum_length"),
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
