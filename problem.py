from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, ClassVar


@dataclass(frozen=True)
class Example:
    """One sample input/output pair, usually copied from the problem statement."""

    args: tuple[Any, ...]
    expected: Any


def example(*args: Any, expected: Any) -> Example:
    return Example(args, expected)


class Problem(ABC):
    """Common runtime interface for individual problem implementations."""

    number: ClassVar[int]
    title: ClassVar[str]
    url: ClassVar[str] = ""
    difficulty: ClassVar[str] = ""  # "Easy" | "Medium" | "Hard", as on LeetCode
    pattern: ClassVar[str] = (
        ""  # "Family · detail"; the family before " · " is what the filters group by
    )
    viz: ClassVar[str | None] = None  # the SvelteKit route page, relative to repo root

    @abstractmethod
    def solve(self, *args: Any, **kwargs: Any) -> Any:
        """Solve the problem and return its result (return the mutated input for in-place problems)."""
        raise NotImplementedError

    def check(self, result: Any, expected: Any) -> bool:
        """Override when any valid answer is accepted, e.g. compare sorted results."""
        return result == expected


def as_params(examples: list[Example]) -> list[Any]:
    """Turn EXAMPLES into pytest params so the suite always covers them too."""
    import pytest

    return [
        pytest.param(*ex.args, ex.expected, id=f"example_{i}") for i, ex in enumerate(examples, 1)
    ]
