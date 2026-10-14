"""Screenshot a problem's visualization so you can look at it, not just test it.

    /usr/bin/python3 .claude/skills/leetcode-problem/shoot.py 26
    /usr/bin/python3 .claude/skills/leetcode-problem/shoot.py 26 --case "Example 2" --themes paper dark sepia

Needs the dev server (`uv run main.py viz serve`) and Playwright, which is installed for the
system Python (not the uv venv), hence /usr/bin/python3. For each theme it saves the first,
middle and last step of the chosen case to /tmp/viz-shots/ and prints the paths, the final
Output verdict, and any page errors.
"""

import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:5274"
OUT = Path("/tmp/viz-shots")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("number", type=int)
    ap.add_argument(
        "--case",
        default=None,
        help='chip label, e.g. "Example 2" (default: the first chip)',
    )
    ap.add_argument("--themes", nargs="+", default=["paper", "dark"])
    ap.add_argument("--width", type=int, default=900)
    args = ap.parse_args()
    OUT.mkdir(exist_ok=True)

    errors: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for theme in args.themes:
            page = browser.new_page(viewport={"width": args.width, "height": 1300})
            # Bind theme now; a plain closure would report every error under the last theme.
            page.on("pageerror", lambda e, t=theme: errors.append(f"{t}: {e}"))
            page.on(
                "console",
                lambda m, t=theme: (
                    m.type == "error" and errors.append(f"{t}: {m.text}")
                ),
            )
            page.goto(BASE + "/")
            page.evaluate(f"localStorage.setItem('viz-theme', '{theme}')")
            page.goto(f"{BASE}/{args.number}")
            page.wait_for_load_state("networkidle")
            if args.case:
                page.get_by_role("radio", name=args.case, exact=True).click()
            page.locator("h1").click()  # move focus off the chips so arrow keys step

            total = int(page.locator(".count").inner_text().split("/")[1])
            for label, target in [("start", 0), ("middle", total // 2), ("end", total)]:
                page.keyboard.press("Home")
                for _ in range(target):
                    page.keyboard.press("ArrowRight")
                page.wait_for_timeout(450)  # let the tile tween settle
                path = OUT / f"{args.number}-{theme}-{label}.png"
                page.screenshot(path=str(path))
                print(path)
            print(f"{theme} output: {page.locator('.io dd').nth(2).inner_text()}")
            page.close()
        browser.close()
    print("page errors:", errors or "none")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
