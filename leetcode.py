"""Fetch a LeetCode problem's public metadata.

uv run leetcode.py https://leetcode.com/problems/two-sum/   print it as JSON (for the skill)
uv run main.py new https://leetcode.com/problems/two-sum/   scaffold from it
"""

import html
import json
import re
import sys
import urllib.request
from dataclasses import asdict, dataclass
from html.parser import HTMLParser

GRAPHQL = "https://leetcode.com/graphql"
QUERY = """
query question($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId title titleSlug difficulty content
    exampleTestcaseList metaData
    topicTags { name }
    codeSnippets { langSlug code }
  }
}"""


@dataclass
class LeetCodeProblem:
    number: int
    title: str
    slug: str
    url: str
    difficulty: str
    tags: list[str]
    statement: str  # plain text, examples and constraints included
    example_inputs: list[str]  # raw testcase inputs, one line per argument
    python: str  # the python3 starter code
    method: str  # e.g. "removeDuplicates"
    params: list[dict]  # [{"name": "nums", "type": "integer[]"}, ...]
    returns: str  # e.g. "integer"


def slug_of(url_or_slug: str) -> str:
    m = re.search(r"leetcode\.com/problems/([\w-]+)", url_or_slug)
    return m.group(1) if m else url_or_slug.strip("/ ")


class _Text(HTMLParser):
    """HTML statement to readable text: keeps line breaks, marks superscripts as ^."""

    def __init__(self) -> None:
        super().__init__()
        self.out: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in ("p", "pre", "ul", "br"):
            self.out.append("\n")
        elif tag == "li":
            self.out.append("\n- ")
        elif tag == "sup":
            self.out.append("^")

    def handle_data(self, data):
        self.out.append(data)

    def text(self) -> str:
        t = html.unescape("".join(self.out)).replace("\u200b", "").replace("\xa0", " ")
        # Trailing whitespace, including tab-only lines.
        t = re.sub(r"[ \t]+\n", "\n", t)
        t = re.sub(r"\n\s*\n(?=- )", "\n", t)  # no blank lines inside lists
        return re.sub(r"\n{3,}", "\n\n", t).strip()


def fetch(url_or_slug: str) -> LeetCodeProblem:
    slug = slug_of(url_or_slug)
    body = json.dumps({"query": QUERY, "variables": {"titleSlug": slug}}).encode()
    req = urllib.request.Request(
        GRAPHQL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "User-Agent": "Mozilla/5.0",  # the default Python-urllib agent gets a 403
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        q = json.load(resp)["data"]["question"]
    if q is None:
        raise ValueError(f"No LeetCode problem with slug {slug!r}")
    if not q["content"]:
        raise ValueError(f"{slug} is a premium problem; its statement isn't public")

    parser = _Text()
    parser.feed(q["content"])
    meta = json.loads(q["metaData"] or "{}")
    python = next(
        (s["code"] for s in q["codeSnippets"] or [] if s["langSlug"] == "python3"), ""
    )
    return LeetCodeProblem(
        number=int(q["questionFrontendId"]),
        title=q["title"],
        slug=q["titleSlug"],
        url=f"https://leetcode.com/problems/{q['titleSlug']}/",
        difficulty=q["difficulty"],
        tags=[t["name"] for t in q["topicTags"]],
        statement=parser.text(),
        example_inputs=q["exampleTestcaseList"] or [],
        python=python,
        method=meta.get("name", ""),
        params=meta.get("params", []),
        returns=meta.get("return", {}).get("type", ""),
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    print(json.dumps(asdict(fetch(sys.argv[1])), indent=2))
