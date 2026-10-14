from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, ClassVar

@dataclass(frozen=True)
class Example:
    args: tuple[Any, ...]
    expected: Any

def example(*args: Any, expected: Any) -> Example: ...

class Problem(ABC):
    number: ClassVar[int]
    title: ClassVar[str]
    url: ClassVar[str]
    viz: ClassVar[str | None]
    @abstractmethod
    def solve(self, *args: Any, **kwargs: Any) -> Any: ...
    def check(self, result: Any, expected: Any) -> bool: ...

def as_params(examples: list[Example]) -> list[Any]: ...
