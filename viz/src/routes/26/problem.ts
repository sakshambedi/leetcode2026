// 26. Remove Duplicates from Sorted Array: read with i, keep a value at k when it differs from nums[k - 1].
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'Two pointers · in place',
	lede: 'Sorted means duplicates touch: keep a value only when it differs from the last one you kept, and write it at k.'
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
	fields: [{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '0, 0, 1, 1, 2' }],
	toArgs({ nums }) {
		if (nums.length === 0) throw new Error('nums needs at least one value.');
		if (!sorted(nums)) throw new Error('nums must be sorted in non-decreasing order.');
		return [nums];
	},

	trace([nums]) {
		const a = [...nums];
		let k = 1;
		const out: Step[] = [{
			a: [...a], i: 1, k, wrote: null, line: 1,
			msg: 'nums[0] is always kept, so k starts at 1. i reads from slot 1 and compares each value with the last kept one, nums[k − 1].'
		}];
		for (let i = 1; i < a.length; i++) {
			const last = a[k - 1];
			let msg: string, wrote: number | null = null;
			if (a[i] !== last) {
				msg = k === i
					? `${a[i]} ≠ ${last}, so it's new and already in place at slot ${k}. k steps right.`
					: `${a[i]} ≠ ${last}, so it's new: it moves from slot ${i} down to slot ${k}. k steps right.`;
				a[k] = a[i]; wrote = k; k++;
			} else {
				msg = `${a[i]} = ${last}, the last kept value, so it's a duplicate. Skip it; slot ${i} joins the free gap.`;
			}
			out.push({ a: [...a], i: i + 1, k, wrote, msg, line: wrote === null ? 3 : 4 });
		}
		out.push({
			...out.at(-1)!, wrote: null, done: true, line: 6,
			msg: k === a.length
				? `i reached the end with no duplicates. Return k = ${k}.`
				: `i reached the end. Return k = ${k}: slots 0..${k - 1} hold each value once, in order; the rest are leftovers.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.done ? '–' : s.i, note: 'next value to read' },
		{ name: 'k', value: s.k, note: 'values kept, next write slot' },
		{ name: 'nums[k-1]', value: s.a[s.k - 1], note: 'last kept value' },
		{ name: 'gap', value: s.done ? 0 : s.i - s.k, note: 'duplicates skipped so far' }
	],

	// The judge checks k and the first k values in order, so plain equality is right.
	result: (s) => [s.k, s.a.slice(0, s.k)]
};
