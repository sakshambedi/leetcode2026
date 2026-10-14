"""58. Length of Last Word

Pattern: reverse scan with one pointer: skip, then count.
Recall: the last word sits at the end, so scan from the back. Skip trailing spaces first,
then count letters until a space or the start; that count is the answer.
Viz: viz/src/routes/58/  (uv run main.py 58 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 58
    title = "Length of Last Word"
    url = "https://leetcode.com/problems/length-of-last-word/"
    difficulty = "Easy"
    pattern = "Reverse scan · skip, then count"
    viz = "viz/src/routes/58/+page.svelte"

    def solve(self, s: str) -> int:
        return self.lengthOfLastWord(s)

    def lengthOfLastWord(self, s: str) -> int:
        """Return the length of the last word in s.

        Args:
            s: English letters and spaces, 1 to 10^4 characters, with at least one word.
                A word is a maximal run of non-space characters.

        Returns:
            The number of characters in the last word.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 58`
EXAMPLES = [
    example("Hello World", expected=5),
    example("   fly me   to   the moon  ", expected=4),
    example("luffy is still joyboy", expected=6),
]

# Edge cases on top of the examples: `uv run main.py 58 --test`
CASES = [
    pytest.param("a", 1, id="single_letter"),
    pytest.param("a ", 1, id="single_letter_trailing_space"),
    pytest.param(" a", 1, id="single_letter_leading_space"),
    pytest.param("day", 3, id="one_word_no_spaces"),
    pytest.param("   day   ", 3, id="one_word_padded_both_sides"),
    pytest.param("hello a", 1, id="last_word_one_letter"),
    pytest.param("a hello", 5, id="last_word_longer_than_first"),
    pytest.param("ab  cd     ", 2, id="many_trailing_spaces"),
    pytest.param("Today is a NICE Day", 3, id="mixed_case"),
    pytest.param("x y z", 1, id="single_letter_words"),
    pytest.param("a" * 10000, 10000, id="maximum_size_one_word"),
    pytest.param(" " * 9999 + "z", 1, id="maximum_size_word_at_the_very_end"),
    pytest.param("w" + " " * 9999, 1, id="maximum_size_word_at_the_very_start"),
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
