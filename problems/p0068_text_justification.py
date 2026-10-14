"""68. Text Justification

Pattern: greedy line packing, then even space distribution (simulation).
Recall: pack words while letters + (words - 1) fit; then share maxWidth - letters spaces
over the gaps, the first `extra % gaps` gaps getting one more. Last line and one-word lines
are left-justified and padded on the right.
Viz: viz/src/routes/68/  (uv run main.py 68 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 68
    title = "Text Justification"
    url = "https://leetcode.com/problems/text-justification/"
    viz = "viz/src/routes/68/+page.svelte"

    def solve(self, words: list[str], maxWidth: int) -> list[str]:
        return self.fullJustify(words, maxWidth)

    def fullJustify(self, words: list[str], maxWidth: int) -> list[str]:
        """Pack words greedily into lines of exactly maxWidth chars, fully justified.

        Args:
            words: 1 to 300 words, each 1 to maxWidth non-space characters.
            maxWidth: Width of every output line, 1 to 100.

        Returns:
            The lines in order. Spaces are spread evenly between words, extra ones going
            to the left gaps; the last line and one-word lines are left-justified.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 68`
EXAMPLES = [
    example(
        ["This", "is", "an", "example", "of", "text", "justification."],
        16,
        expected=["This    is    an", "example  of text", "justification.  "],
    ),
    example(
        ["What", "must", "be", "acknowledgment", "shall", "be"],
        16,
        expected=["What   must   be", "acknowledgment  ", "shall be        "],
    ),
    example(
        # fmt: off
        [
            "Science",
            "is",
            "what",
            "we",
            "understand",
            "well",
            "enough",
            "to",
            "explain",
            "to",
            "a",
            "computer.",
            "Art",
            "is",
            "everything",
            "else",
            "we",
            "do",
        ],
        # fmt: on
        20,
        expected=[
            "Science  is  what we",
            "understand      well",
            "enough to explain to",
            "a  computer.  Art is",
            "everything  else  we",
            "do                  ",
        ],
    ),
]

_W20 = "a" * 20
# Edge cases on top of the examples: `uv run main.py 68 --test`
CASES = [
    pytest.param(["abc"], 3, ["abc"], id="single_word_exact_width"),
    pytest.param(["a"], 5, ["a    "], id="single_word_padded_right"),
    pytest.param(["a", "b", "c"], 1, ["a", "b", "c"], id="width_one_word_per_line"),
    pytest.param(["a", "b", "c"], 10, ["a b c     "], id="everything_on_last_line"),
    pytest.param(
        ["ab", "cd", "ef"], 5, ["ab cd", "ef   "], id="exact_fit_single_spaces"
    ),
    pytest.param(
        ["aa", "b", "c", "dddd"], 7, ["aa  b c", "dddd   "], id="extra_space_goes_left"
    ),
    pytest.param(
        ["a", "b", "c", "d", "e"],
        8,
        ["a  b c d", "e       "],
        id="three_gaps_one_extra",
    ),
    pytest.param(
        ["ab", "cd", "ef", "gh"], 6, ["ab  cd", "ef gh "], id="last_line_not_stretched"
    ),
    pytest.param(
        ["a", "verylongword", "b"],
        12,
        ["a           ", "verylongword", "b           "],
        id="one_word_middle_line_left_justified",
    ),
    pytest.param(
        ["Hi,", "you!", "ok."], 10, ["Hi,   you!", "ok.       "], id="symbols"
    ),
    pytest.param([_W20, _W20], 20, [_W20, _W20], id="words_of_maximum_length"),
    pytest.param(
        ["x"] * 300,
        100,
        ["x  " + " ".join(["x"] * 49)] * 5 + [" ".join(["x"] * 50) + " "],
        id="maximum_words_tiny",
    ),
    pytest.param(
        [_W20] * 300,
        100,
        [_W20 + " " * 7 + _W20 + " " * 7 + _W20 + " " * 6 + _W20] * 74
        + [" ".join([_W20] * 4) + " " * 17],
        id="maximum_words_and_width",
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
