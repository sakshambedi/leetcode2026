"""6. Zigzag Conversion

Pattern: simulation, one bucket per row with a bouncing row index.
Recall: walk the string once, dropping each char into rows[row]; row moves by step,
and step flips at the top (0) and bottom (numRows - 1). Join the rows. numRows == 1 returns s.
Viz: viz/src/routes/6/  (uv run main.py 6 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 6
    title = "Zigzag Conversion"
    url = "https://leetcode.com/problems/zigzag-conversion/"
    difficulty = "Medium"
    pattern = "Simulation · row buckets"
    viz = "viz/src/routes/6/+page.svelte"

    def solve(self, s: str, numRows: int) -> str:
        return self.convert(s, numRows)

    def convert(self, s: str, numRows: int) -> str:
        """Write s in a zigzag over numRows rows, then read it back row by row.

        Args:
            s: English letters, ',' and '.'; 1 to 1000 characters.
            numRows: Number of zigzag rows, 1 to 1000.

        Returns:
            The characters of s read row by row from the zigzag.
        """
        if numRows == 1 or numRows >= len(s):
            return s
        rows = [[] for _ in range(numRows)]
        row, step = 0, 1
        for char in s:
            rows[row].append(char)
            if row == 0:
                step = 1
            elif row == numRows - 1:
                step = -1
            row += step
        return "".join("".join(chars) for chars in rows)


# Examples from the problem statement: `uv run main.py 6`
EXAMPLES = [
    example("PAYPALISHIRING", 3, expected="PAHNAPLSIIGYIR"),
    example("PAYPALISHIRING", 4, expected="PINALSIGYAHRPI"),
    example("A", 1, expected="A"),
]

# Edge cases on top of the examples: `uv run main.py 6 --test`
CASES = [
    pytest.param("AB", 1, "AB", id="one_row_returns_input"),
    pytest.param("A", 2, "A", id="single_char_many_rows"),
    pytest.param("ABCD", 2, "ACBD", id="two_rows_alternate"),
    pytest.param("ABC", 3, "ABC", id="rows_equal_length_one_column"),
    pytest.param("AB", 5, "AB", id="more_rows_than_chars"),
    pytest.param("ABCDE", 4, "ABCED", id="one_bounce_off_the_bottom"),
    pytest.param("PAYPALISHIRING", 2, "PYAIHRNAPLSIIG", id="statement_text_two_rows"),
    pytest.param("PAYPALISHIRING", 5, "PHASIYIRPLIGAN", id="statement_text_five_rows"),
    pytest.param("aBcDeF", 3, "aeBDFc", id="mixed_case_kept"),
    pytest.param("a,b.C", 2, "abC,.", id="punctuation_chars"),
    pytest.param("AAAAAA", 3, "AAAAAA", id="all_same_char"),
    pytest.param("ab" * 499 + "a", 1, "ab" * 499 + "a", id="near_maximum_one_row"),
    pytest.param("ab" * 499 + "a", 2, "a" * 500 + "b" * 499, id="near_maximum_two_rows"),
    pytest.param("xy" * 500, 1000, "xy" * 500, id="maximum_length_and_rows"),
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
