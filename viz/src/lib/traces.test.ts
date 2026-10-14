// Every visualization's trace must reach the answer pytest expects, on every case up to
// MAX_ELEMENTS values, including the ones the picker hides. Run with `pnpm test`.
// Bigger cases are skipped: a trace snapshots the array every step, so memory grows as n².
// pytest still covers them against the Python solution.
import { describe, expect, it } from 'vitest';
import problems from './generated/problems.json';
import { sameJSON, type Case, type Problem, type ProblemInfo } from './types.ts';

const MAX_ELEMENTS = 1000;
// A string counts one value per character: string traces snapshot it every step too.
const weight = (a: unknown): number =>
	Array.isArray(a) ? a.reduce<number>((n, x) => n + weight(x), 0) : typeof a === 'string' ? Math.max(1, a.length) : 1;
const size = (args: unknown[]) => args.reduce<number>((n, a) => n + weight(a), 0);

const routes = import.meta.glob<{ problem: Problem }>('../routes/*/problem.ts', { eager: true });
const caseFiles = import.meta.glob<{ default: Case[] }>('./generated/cases/*.json', { eager: true });

for (const [path, { problem }] of Object.entries(routes)) {
	const number = Number(path.match(/routes\/(\d+)\//)![1]);
	const info = (problems as ProblemInfo[]).find((p) => p.number === number);

	describe(`${number}. ${info?.title ?? 'unknown problem'}`, () => {
		it('has a Python problem and exported cases', () => {
			expect(info, `no problems/p${String(number).padStart(4, '0')}_*.py`).toBeDefined();
			expect(caseFiles[`./generated/cases/${info!.stem}.json`]).toBeDefined();
		});

		const cases = info ? caseFiles[`./generated/cases/${info.stem}.json`]?.default ?? [] : [];
		for (const c of cases) {
			if (size(c.args as unknown[]) > MAX_ELEMENTS) {
				it.skip(`${c.id} (${size(c.args as unknown[])} values, too large to trace)`, () => {});
				continue;
			}
			it(c.id, () => {
				const steps = problem.trace(structuredClone(c.args) as any[]);
				expect(steps.length).toBeGreaterThan(0);
				for (const s of steps) expect(s.msg).toBeTruthy();
				const result = problem.result(steps.at(-1));
				expect((problem.check ?? sameJSON)(result, c.expected), JSON.stringify(result)).toBe(true);
			});
		}
	});
}
