"""274. H-Index

Pattern: sort descending, then walk the ranks.
Recall: after sorting most-cited first, the paper at 1-based rank r counts toward h exactly when
it has at least r citations. Step h forward while citations[h] > h; the first failure stops it.
Viz: viz/src/routes/274/  (uv run main.py 274 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 274
    title = "H-Index"
    url = "https://leetcode.com/problems/h-index/"
    viz = "viz/src/routes/274/+page.svelte"

    def solve(self, citations: list[int]) -> int:
        return self.hIndex(citations)

    def hIndex(self, citations: list[int]) -> int:
        """Compute the researcher's h-index.

        Args:
            citations: citations[i] is the citation count of paper i;
                1 <= len(citations) <= 5000, 0 <= citations[i] <= 1000.

        Returns:
            The largest h such that at least h papers have at least h citations each.
        """
        raise NotImplementedError  # your solution


# Examples from the problem statement: `uv run main.py 274`
EXAMPLES = [
    example([3, 0, 6, 1, 5], expected=3),
    example([1, 3, 1], expected=1),
]

# Edge cases on top of the examples: `uv run main.py 274 --test`
CASES = [
    pytest.param([0], 0, id="single_uncited_paper"),
    pytest.param([1], 1, id="single_cited_paper"),
    pytest.param([100], 1, id="single_paper_many_citations"),
    pytest.param([0, 0, 0], 0, id="no_citations_at_all"),
    pytest.param([1, 1, 1], 1, id="all_ones"),
    pytest.param([5, 5, 5], 3, id="capped_by_paper_count"),
    pytest.param([1, 2], 1, id="two_papers_second_falls_short"),
    pytest.param([2, 2], 2, id="two_papers_both_qualify"),
    pytest.param([0, 0, 4, 4], 2, id="ascending_input"),
    pytest.param([4, 4, 0, 0], 2, id="descending_input"),
    pytest.param([10, 8, 5, 4, 3], 4, id="stops_on_last_paper"),
    pytest.param([25, 8, 5, 3, 3], 3, id="ties_at_the_boundary"),
    pytest.param([1000] * 5, 5, id="citation_upper_bound"),
    pytest.param([0] * 5000, 0, id="maximum_size_all_zero"),
    pytest.param([1000] * 5000, 1000, id="maximum_size_capped_by_citations"),
    pytest.param(
        [i % 1001 for i in range(5000)], 833, id="maximum_size_full_value_range"
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
