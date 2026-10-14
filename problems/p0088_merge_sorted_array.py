"""88. Merge Sorted Array

Pattern: three pointers, fill from the back.
Recall: nums1's empty tail is free space, so write the largest remaining value at the
end. Stop once nums2 runs out; whatever is left in nums1 is already in place.
Viz: viz/src/routes/88/  (uv run main.py 88 --viz)
"""

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 88
    title = "Merge Sorted Array"
    url = "https://leetcode.com/problems/merge-sorted-array/"
    difficulty = "Easy"
    pattern = "Three pointers · in place"
    viz = "viz/src/routes/88/+page.svelte"

    def solve(self, nums1: list[int], m: int, nums2: list[int], n: int) -> list[int]:
        self.merge(nums1, m, nums2, n)
        return nums1

    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> None:
        """Merge nums2 into nums1 in place."""
        m_point, n_point, extra = m - 1, n - 1, m + n - 1
        while n_point >= 0:
            if m_point >= 0 and nums1[m_point] > nums2[n_point]:
                nums1[extra] = nums1[m_point]
                m_point -= 1
            else:
                nums1[extra] = nums2[n_point]
                n_point -= 1
            extra -= 1


# Examples from the problem statement: `uv run main.py 88`
EXAMPLES = [
    example([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3, expected=[1, 2, 2, 3, 5, 6]),
    example([1], 1, [], 0, expected=[1]),
    example([0], 0, [1], 1, expected=[1]),
]

# Edge cases on top of the examples: `uv run main.py 88 --test`
CASES = [
    pytest.param(
        [1, 2, 3, 0, 0, 0],
        3,
        [4, 5, 6],
        3,
        [1, 2, 3, 4, 5, 6],
        id="nums1_all_less_than_nums2",
    ),
    pytest.param(
        [4, 5, 6, 0, 0, 0],
        3,
        [1, 2, 3],
        3,
        [1, 2, 3, 4, 5, 6],
        id="nums2_all_less_than_nums1",
    ),
    pytest.param(
        [1, 2, 2, 0, 0, 0], 3, [2, 2, 3], 3, [1, 2, 2, 2, 2, 3], id="duplicate_values"
    ),
    pytest.param(
        [-3, -1, 0, 0, 0],
        3,
        [-2, 0],
        2,
        [-3, -2, -1, 0, 0],
        id="negative_and_zero_values",
    ),
    pytest.param([7, 0], 1, [7], 1, [7, 7], id="single_elements_equal"),
    pytest.param(
        [2, 2, 2, 0, 0, 0], 3, [2, 2, 2], 3, [2, 2, 2, 2, 2, 2], id="all_values_equal"
    ),
    pytest.param(
        [-5, -4, 0, 0],
        2,
        [-3, -2],
        2,
        [-5, -4, -3, -2],
        id="all_negative_below_placeholders",
    ),
    pytest.param(
        [-(10**9), 0, 10**9, 0, 0],
        3,
        [-(10**9), 10**9],
        2,
        [-(10**9), -(10**9), 0, 10**9, 10**9],
        id="extreme_constraint_values",
    ),
    pytest.param(
        list(range(-100, 100, 2)) + [0] * 100,
        100,
        list(range(-99, 101, 2)),
        100,
        list(range(-100, 100)),
        id="maximum_input_size",
    ),
    pytest.param(
        [0, 0, 0], 0, [1, 2, 3], 3, [1, 2, 3], id="empty_nums1_multiple_nums2_values"
    ),
    pytest.param(
        [5, 0, 0, 0], 1, [1, 2, 3], 3, [1, 2, 3, 5], id="nums1_exhausted_before_nums2"
    ),
    pytest.param(
        [1, 10, 0, 0, 0],
        2,
        [2, 3, 4],
        3,
        [1, 2, 3, 4, 10],
        id="multiple_nums2_between_nums1_values",
    ),
    pytest.param(
        [0, 0, 0, 0], 2, [0, 0], 2, [0, 0, 0, 0], id="real_zeros_matching_placeholders"
    ),
    pytest.param(
        list(range(200)), 200, [], 0, list(range(200)), id="maximum_m_empty_nums2"
    ),
    pytest.param(
        [0] * 200,
        0,
        list(range(200)),
        200,
        list(range(200)),
        id="maximum_n_empty_nums1",
    ),
    pytest.param(
        [10**9] * 100 + [0] * 100,
        100,
        [-(10**9)] * 100,
        100,
        [-(10**9)] * 100 + [10**9] * 100,
        id="maximum_size_all_nums2_smaller_at_extremes",
    ),
]


@pytest.mark.parametrize(
    "nums1, m, nums2, n, expected", problem.as_params(EXAMPLES) + CASES
)
def test_merge(nums1, m, nums2, n, expected):
    nums1, nums2 = nums1.copy(), nums2.copy()
    assert Solution().merge(nums1, m, nums2, n) is None
    assert nums1 == expected
