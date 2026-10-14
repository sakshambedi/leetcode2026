"""28. Find the Index of the First Occurrence in a String

Pattern: sliding window, compare the needle at each start (naive string matching).
Recall: try every start from 0 to n - m. At each one, match needle against haystack[start:]
letter by letter; a full match returns start, a mismatch slides the window one to the right.
Viz: viz/src/routes/28/  (uv run main.py 28 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 28
    title = "Find the Index of the First Occurrence in a String"
    url = "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/"
    viz = "viz/src/routes/28/+page.svelte"

    def solve(self, haystack: str, needle: str) -> int:
        return self.strStr(haystack, needle)

    def strStr(self, haystack: str, needle: str) -> int:
        """Return the index where needle first occurs in haystack, or -1.

        Args:
            haystack: Lowercase English letters, 1 to 10^4 long; the text to search.
            needle: Lowercase English letters, 1 to 10^4 long; the pattern to find.

        Returns:
            The smallest index i with haystack[i : i + len(needle)] == needle,
            or -1 if needle does not occur.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 28`
EXAMPLES = [
    example("sadbutsad", "sad", expected=0),
    example("leetcode", "leeto", expected=-1),
]

# Edge cases on top of the examples: `uv run main.py 28 --test`
CASES = [
    pytest.param("a", "a", 0, id="single_letter_match"),
    pytest.param("a", "b", -1, id="single_letter_no_match"),
    pytest.param("abc", "abc", 0, id="needle_equals_haystack"),
    pytest.param("abc", "abcd", -1, id="needle_longer_than_haystack"),
    pytest.param("abc", "c", 2, id="match_at_the_end"),
    pytest.param("hello", "ll", 2, id="match_in_the_middle"),
    pytest.param("aaab", "aab", 1, id="partial_match_then_overlap"),
    pytest.param("mississippi", "issip", 4, id="restart_after_long_partial_match"),
    pytest.param("mississippi", "issipi", -1, id="near_miss"),
    pytest.param("abcabcabd", "abcabd", 3, id="repeating_prefix"),
    pytest.param("aaaaa", "bba", -1, id="no_letter_in_common"),
    pytest.param("a" * 10000, "a" * 10000, 0, id="maximum_size_equal"),
    pytest.param("a" * 9999 + "b", "ab", 9998, id="maximum_size_match_at_end"),
    pytest.param("a" * 10000, "b" * 10000, -1, id="maximum_size_no_match"),
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
