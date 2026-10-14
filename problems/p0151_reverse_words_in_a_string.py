"""151. Reverse Words in a String

Pattern: two pointers scanning from the right, one word at a time.
Recall: read s backwards. Skip spaces; when you hit a letter, mark the word's end with j,
walk i left to the space before it, and append s[i + 1 : j + 1]. Join the words with one space.
Viz: viz/src/routes/151/  (uv run main.py 151 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 151
    title = "Reverse Words in a String"
    url = "https://leetcode.com/problems/reverse-words-in-a-string/"
    viz = "viz/src/routes/151/+page.svelte"

    def solve(self, s: str) -> str:
        return self.reverseWords(s)

    def reverseWords(self, s: str) -> str:
        """Return the words of s in reverse order, joined by single spaces.

        Args:
            s: Letters, digits and spaces, 1 to 10^4 characters, with at least one word.
                May have leading, trailing or repeated spaces.

        Returns:
            The words last to first, separated by exactly one space, with no
            leading or trailing spaces.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 151`
EXAMPLES = [
    example("the sky is blue", expected="blue is sky the"),
    example("  hello world  ", expected="world hello"),
    example("a good   example", expected="example good a"),
]

# Edge cases on top of the examples: `uv run main.py 151 --test`
CASES = [
    pytest.param("a", "a", id="single_letter"),
    pytest.param("  a  ", "a", id="single_letter_padded"),
    pytest.param("hello", "hello", id="one_word"),
    pytest.param("a b", "b a", id="two_single_letter_words"),
    pytest.param("   a   b  ", "b a", id="padding_everywhere"),
    pytest.param(
        "  Bob    Loves  Alice   ",
        "Alice Loves Bob",
        id="mixed_case_and_runs_of_spaces",
    ),
    pytest.param("1 22 333", "333 22 1", id="digits"),
    pytest.param("EPY2giL", "EPY2giL", id="letters_and_digits_one_word"),
    pytest.param("ab ab ab", "ab ab ab", id="same_word_repeated"),
    pytest.param("ab cd", "cd ab", id="words_not_reversed_inside"),
    pytest.param("a " * 5000, " ".join(["a"] * 5000), id="maximum_size_many_words"),
    pytest.param("x" * 10000, "x" * 10000, id="maximum_size_one_word"),
    pytest.param(" " * 9999 + "z", "z", id="maximum_size_mostly_spaces"),
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
