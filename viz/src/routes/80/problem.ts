// 80. Remove Duplicates from Sorted Array II: read with i, keep a value at k unless nums[k - 2] already equals it.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	lede: 'A value may stay unless the kept value two back already equals it: compare nums[i] with nums[k − 2], and write keepers at k.'
};

type Args = [nums: number[]];
export type Step = BaseStep & {
	a: number[];
	i: number;
	k: number;
	wrote: number | null;
	done?: boolean;
};

const sorted = (xs: number[]) => xs.every((v, x) => x === 0 || xs[x - 1] <= v);

export const problem: Problem<Args, Step, [number, number[]]> = {
	fields: [{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '1, 1, 1, 2, 2, 3' }],
	toArgs({ nums }) {
		if (nums.length === 0) throw new Error('nums needs at least one value.');
		if (!sorted(nums)) throw new Error('nums must be sorted in non-decreasing order.');
		return [nums];
	},

	trace([nums]) {
		const a = [...nums];
		let k = Math.min(2, a.length);
		const out: Step[] = [{
			a: [...a], i: 2, k, wrote: null, line: 1,
			msg: a.length <= 2
				? `With ${a.length} value${a.length === 1 ? '' : 's'}, nothing can appear three times, so all of them stay.`
				: 'The first two values always stay: no value can appear more than twice yet. k starts at 2, and i reads from slot 2.'
		}];
		for (let i = 2; i < a.length; i++) {
			const back = a[k - 2];
			let msg: string, wrote: number | null = null;
			if (a[i] !== back) {
				msg = k === i
					? `${a[i]} ≠ nums[k − 2] = ${back}, so it has fewer than two copies kept. It is already in place at slot ${k}; k steps right.`
					: `${a[i]} ≠ nums[k − 2] = ${back}, so it has fewer than two copies kept. It moves from slot ${i} down to slot ${k}; k steps right.`;
				a[k] = a[i]; wrote = k; k++;
			} else {
				msg = `${a[i]} = nums[k − 2], so two ${a[i]}s are already kept. Skip it; slot ${i} joins the free gap.`;
			}
			out.push({ a: [...a], i: i + 1, k, wrote, msg, line: wrote === null ? 3 : 4 });
		}
		out.push({
			...out.at(-1)!, i: Math.max(a.length, 2), wrote: null, done: true, line: 6,
			msg: k === a.length
				? `i reached the end with nothing to drop. Return k = ${k}.`
				: `i reached the end. Return k = ${k}: slots 0..${k - 1} hold each value at most twice, in order; the rest are leftovers.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.done ? '–' : s.i, note: 'next value to read' },
		{ name: 'k', value: s.k, note: 'values kept, next write slot' },
		{ name: 'nums[k-2]', value: s.k >= 2 ? s.a[s.k - 2] : '–', note: 'kept value two back' },
		{ name: 'nums[i]', value: s.done || s.i >= s.a.length ? '–' : s.a[s.i], note: 'next value read' },
		{ name: 'gap', value: s.done ? 0 : Math.max(s.i - s.k, 0), note: 'extra copies skipped so far' }
	],

	// The judge checks k and the first k values in order, so plain equality is right.
	result: (s) => [s.k, s.a.slice(0, s.k)]
};
