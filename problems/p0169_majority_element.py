"""169. Majority Element

Pattern: Boyer-Moore voting, one pass with a candidate and a count.
Recall: pair each vote for the candidate against a vote for something else; the majority
has more than half the votes, so it survives every cancellation. Count 0 means pick a new candidate.
Viz: viz/src/routes/169/  (uv run main.py 169 --viz)
"""

import copy

import pytest

import problem
from problem import example


class Solution(problem.Problem):
    number = 169
    title = "Majority Element"
    url = "https://leetcode.com/problems/majority-element/"
    difficulty = "Easy"
    pattern = "Boyer–Moore voting · one pass"
    viz = "viz/src/routes/169/+page.svelte"

    def solve(self, nums: list[int]) -> int:
        return self.majorityElement(nums)

    def majorityElement(self, nums: list[int]) -> int:
        candidate, count = nums[0], 0  # Avoids an optional candidate type diagnostic.
        for num in nums:
            if count == 0:
                candidate = num

            if candidate == num:
                count += 1
            else:
                count -= 1
        return candidate

    def majorityElement_pass2(self, nums: list[int]) -> int:
        """Return the value that appears more than len(nums) // 2 times.

        Args:
            nums: 1 to 5 * 10^4 integers; a majority value is guaranteed to exist.

        Returns:
            The majority value.
        """
        counts: dict[int, int] = {}
        threshold = len(nums) // 2

        for num in nums:
            counts[num] = counts.get(num, 0) + 1
            if counts[num] > threshold:
                return num

        raise ValueError("nums must contain a majority element")

    def majorityElement_pass1(self, nums: list[int]) -> int:
        """Return the value that appears more than len(nums) // 2 times.

        Args:
            nums: 1 to 5 * 10^4 integers; a majority value is guaranteed to exist.

        Returns:
            The majority value.
        """
        result, max, num_max = {}, 0, 0

        for i in range(len(nums)):
            if nums[i] not in result:
                result[nums[i]] = 1
            else:
                result[nums[i]] += 1

            if result[nums[i]] > num_max:
                max = nums[i]
                num_max = result[nums[i]]

        return max


# Examples from the problem statement: `uv run main.py 169`
EXAMPLES = [
    example([3, 2, 3], expected=3),
    example([2, 2, 1, 1, 1, 2, 2], expected=2),
]

# Edge cases on top of the examples: `uv run main.py 169 --test`
CASES = [
    pytest.param([1], 1, id="single_element"),
    pytest.param([5, 5], 5, id="two_equal_values"),
    pytest.param([4, 4, 4, 4], 4, id="every_value_the_same"),
    pytest.param([1, 2, 2], 2, id="majority_takes_over_after_first"),
    pytest.param([7, 7, 7, 1, 2], 7, id="majority_at_start"),
    pytest.param([1, 2, 3, 3, 3], 3, id="majority_at_end"),
    pytest.param([1, 2, 1, 3, 1, 4, 1], 1, id="alternating_with_others"),
    pytest.param([1, 2, 3, 4, 4, 4, 4], 4, id="candidate_changes_several_times"),
    pytest.param([6, 5, 5, 6, 6], 6, id="count_drops_to_zero_twice"),
    pytest.param([-3, 0, -3, 0, -3], -3, id="negative_and_zero"),
    pytest.param([-1000000000, 1000000000, -1000000000], -1000000000, id="value_bounds"),
    pytest.param([9] * 50000, 9, id="maximum_size_all_same"),
    pytest.param([2] * 24999 + [1] * 25001, 1, id="maximum_size_bare_majority_at_end"),
    pytest.param(
        [x for _ in range(24999) for x in (1, 2)] + [1, 1],
        1,
        id="maximum_size_alternating",
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
