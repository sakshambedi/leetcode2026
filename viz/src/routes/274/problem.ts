// 274. H-Index: sort most-cited first; the paper at rank r counts while it has at least r citations.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Sort · walk the ranks',
	lede: 'Sort citations high to low; the paper at rank h + 1 must have at least h + 1 citations, so step h until one falls short.'
};

type Args = [citations: number[]];
export type Step = BaseStep & {
	a: number[];
	sorted: boolean;
	h: number;
	lit: number | null;
	done?: boolean;
};

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 'citations', kind: 'list', from: ([c]) => c, placeholder: '3, 0, 6, 1, 5' }],
	toArgs({ citations }) {
		if (citations.length === 0) throw new Error('citations needs at least one value.');
		if (citations.some((v: number) => v < 0)) throw new Error('Citation counts must be 0 or more.');
		return [citations];
	},
	// Up to 1000 citations still fits on a tile.
	fits: ([c]) => c.length <= 12 && c.every((v) => v <= 1000),

	trace([citations]) {
		const n = citations.length;
		const a = [...citations].sort((x, y) => y - x);
		const out: Step[] = [
			{
				a: [...citations], sorted: false, h: 0, lit: null, line: 1,
				msg: 'h counts the top papers that each have enough citations, so sort most-cited first.'
			},
			{
				a, sorted: true, h: 0, lit: null, line: 2,
				msg: 'Sorted high to low. Under each tile is what its rank demands: the r-th paper needs at least r citations. Start with h = 0.'
			}
		];
		let h = 0;
		while (h < n && a[h] > h) {
			h++;
			out.push({
				a, sorted: true, h, lit: h - 1, line: 4,
				msg: h === 1
					? `Rank 1 has ${a[0]} ≥ 1 citation, so 1 paper has at least 1. h = 1.`
					: `Rank ${h} has ${a[h - 1]} ≥ ${h} citations, and the papers above it have at least as many: ${h} papers with ≥ ${h} each. h = ${h}.`
			});
		}
		out.push({
			a, sorted: true, h, lit: null, line: 5, done: true,
			msg: h === n
				? `Every paper passed. h can never exceed the paper count, so return h = ${h}.`
				: `Rank ${h + 1} has only ${a[h]} < ${h + 1} citations, and every paper after it has no more. Return h = ${h}.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'h', value: s.h, note: 'papers confirmed so far' },
		{ name: 'citations[h]', value: s.h < s.a.length && s.sorted ? s.a[s.h] : '–', note: 'next paper, rank h + 1' },
		{ name: 'needs', value: s.h < s.a.length && s.sorted ? `> ${s.h}` : '–', note: 'to push h to h + 1' },
		{ name: 'n', value: s.a.length, note: 'papers, the cap on h' }
	],

	result: (s) => s.h
};
