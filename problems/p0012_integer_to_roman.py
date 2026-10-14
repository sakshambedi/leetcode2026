"""12. Integer to Roman

Pattern: greedy over a fixed table of 13 value/symbol pairs.
Recall: put the six subtractive forms (CM, CD, XC, XL, IX, IV) in the table beside the
seven symbols, largest first; then append the biggest pair that fits and subtract it, until num is 0.
Viz: viz/src/routes/12/  (uv run main.py 12 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 12
    title = "Integer to Roman"
    url = "https://leetcode.com/problems/integer-to-roman/"
    viz = "viz/src/routes/12/+page.svelte"

    def solve(self, num: int) -> str:
        return self.intToRoman(num)

    def intToRoman(self, num: int) -> str:
        """Convert an integer to its Roman numeral.

        Args:
            num: The integer to convert, 1 <= num <= 3999.

        Returns:
            The Roman numeral for ``num``, using the subtractive forms IV, IX, XL, XC, CD and CM.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 12`
EXAMPLES = [
    example(3749, expected="MMMDCCXLIX"),
    example(58, expected="LVIII"),
    example(1994, expected="MCMXCIV"),
]

# Edge cases on top of the examples: `uv run main.py 12 --test`
CASES = [
    pytest.param(1, "I", id="minimum_value"),
    pytest.param(3, "III", id="repeat_ones_three_times"),
    pytest.param(4, "IV", id="subtractive_four"),
    pytest.param(9, "IX", id="subtractive_nine"),
    pytest.param(40, "XL", id="subtractive_forty"),
    pytest.param(90, "XC", id="subtractive_ninety"),
    pytest.param(400, "CD", id="subtractive_four_hundred"),
    pytest.param(900, "CM", id="subtractive_nine_hundred"),
    pytest.param(49, "XLIX", id="forty_nine_is_xl_ix_not_il"),
    pytest.param(444, "CDXLIV", id="every_digit_subtractive"),
    pytest.param(1000, "M", id="exact_thousand"),
    pytest.param(2024, "MMXXIV", id="zero_in_the_hundreds"),
    pytest.param(3999, "MMMCMXCIX", id="maximum_value"),
    pytest.param(3888, "MMMDCCCLXXXVIII", id="longest_numeral"),
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
