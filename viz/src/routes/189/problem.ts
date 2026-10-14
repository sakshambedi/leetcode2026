// 189. Rotate Array: reverse the whole array, then reverse the first k and the last n − k.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Three reversals · in place',
	lede: 'Reverse the whole array to bring the last k values to the front, then reverse each part back into order.'
};

type Args = [nums: number[], k: number];
export type Step = BaseStep & {
	a: number[];
	k0: number; // k as given
	k: number; // k % n
	phase: number; // 0 before the reversals, 1..3 during them
	l: number | null;
	r: number | null;
	lit: number | null;
	done?: boolean;
};

const PHASES = [
	'Reverse the whole array: the last k values land at the front, but backwards.',
	'Reverse the first k slots back into order: they hold the values that moved to the front.',
	'Reverse the last n − k slots back into order: they hold the values that moved right.'
];

export const problem: Problem<Args, Step, number[]> = {
	fields: [
		{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '1, 2, 3, 4, 5, 6, 7' },
		{ name: 'k', kind: 'int', from: ([, k]) => k, placeholder: '3' }
	],
	toArgs({ nums, k }) {
		if (nums.length === 0) throw new Error('nums needs at least one value.');
		if (!Number.isInteger(k) || k < 0) throw new Error('k must be a whole number, 0 or more.');
		return [nums, k];
	},
	// k can be huge without making the figure bigger, so only nums decides whether a case is drawable.
	fits: ([nums]) => nums.length <= 12 && nums.every((v) => Math.abs(v) < 1000),

	trace([nums, k0]) {
		const a = [...nums];
		const n = a.length;
		const k = k0 % n;
		const base = { k0, k, lit: null };
		const out: Step[] = [{
			...base, a: [...a], phase: 0, l: null, r: null, line: 1,
			msg: k0 >= n
				? `Rotating by n is a full turn, so only k % n matters: ${k0} % ${n} = ${k}.`
				: `Rotating right by k = ${k} moves the last ${k} value${k === 1 ? '' : 's'} to the front. k % n leaves k as it is.`
		}];
		const ranges: [number, number][] = [[0, n - 1], [0, k - 1], [k, n - 1]];
		ranges.forEach(([lo, hi], p) => {
			out.push({
				...base, a: [...a], phase: p + 1, l: lo <= hi ? lo : null, r: lo <= hi ? hi : null, line: 2,
				msg: lo >= hi
					? `${PHASES[p]} That part holds ${lo > hi ? 'no values' : 'one value'}, so there is nothing to swap.`
					: `${PHASES[p]} l = ${lo}, r = ${hi}.`
			});
			for (let l = lo, r = hi; l < r; l++, r--) {
				const [x, y] = [a[l], a[r]];
				[a[l], a[r]] = [a[r], a[l]];
				out.push({
					...base, a: [...a], phase: p + 1, l, r, lit: l, line: 4,
					msg: `Swap ${x} and ${y}: slots ${l} and ${r} trade values, then l and r step inward.`
				});
			}
		});
		out.push({
			...base, a: [...a], phase: 3, l: null, r: null, done: true, line: 2,
			msg: k === 0
				? 'k % n is 0, so every reversal undid the last one: nums is unchanged, which is the right answer.'
				: `All three reversals are done: the last ${k} values now lead, both parts in their original order.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'k', value: s.k, note: `${s.k0} % n` },
		{ name: 'n', value: s.a.length, note: 'length of nums' },
		{ name: 'l', value: s.l ?? '–', note: 'left end of the reversal' },
		{ name: 'r', value: s.r ?? '–', note: 'right end of the reversal' },
		{ name: 'pass', value: s.phase === 0 ? '–' : `${s.phase} / 3`, note: ['', 'whole array', 'first k', 'last n − k'][s.phase] }
	],

	result: (s) => s.a
};
