"""14. Longest Common Prefix

Pattern: vertical scanning, one column at a time across every string.
Recall: the prefix can be no longer than strs[0]. Walk its columns; at column i check every
other string has the same character there. The first string that is too short or differs ends it.
Viz: viz/src/routes/14/  (uv run main.py 14 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 14
    title = "Longest Common Prefix"
    url = "https://leetcode.com/problems/longest-common-prefix/"
    viz = "viz/src/routes/14/+page.svelte"

    def solve(self, strs: list[str]) -> str:
        return self.longestCommonPrefix(strs)

    def longestCommonPrefix(self, strs: list[str]) -> str:
        """Return the longest prefix shared by every string in strs.

        Args:
            strs: 1 to 200 strings of lowercase English letters, each 0 to 200 long.

        Returns:
            The longest common prefix, or "" when the strings share none.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 14`
EXAMPLES = [
    example(["flower", "flow", "flight"], expected="fl"),
    example(["dog", "racecar", "car"], expected=""),
]

# Edge cases on top of the examples: `uv run main.py 14 --test`
CASES = [
    pytest.param(["a"], "a", id="single_string"),
    pytest.param([""], "", id="single_empty_string"),
    pytest.param(["", "abc"], "", id="first_string_empty"),
    pytest.param(["abc", ""], "", id="later_string_empty"),
    pytest.param(["abc", "abc", "abc"], "abc", id="all_strings_equal"),
    pytest.param(["ab", "abc", "abcd"], "ab", id="first_string_is_the_prefix"),
    pytest.param(["abcd", "abc", "ab"], "ab", id="shortest_string_last"),
    pytest.param(["a", "b"], "", id="differ_at_first_character"),
    pytest.param(["prefix", "prefixes"], "prefix", id="whole_word_is_prefix"),
    pytest.param(
        ["interspecies", "interstellar", "interstate"], "inters", id="long_shared_run"
    ),
    pytest.param(["reflower", "flow", "flight"], "", id="match_only_off_the_start"),
    pytest.param(["cir", "car"], "c", id="differ_in_the_middle"),
    pytest.param(["a" * 200] * 200, "a" * 200, id="maximum_size_all_equal"),
    pytest.param(
        ["a" * 199 + chr(97 + k % 26) for k in range(200)],
        "a" * 199,
        id="maximum_size_differ_at_last_column",
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
