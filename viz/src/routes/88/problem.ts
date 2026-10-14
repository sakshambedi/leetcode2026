// 88. Merge Sorted Array: fill nums1 from the back, largest first.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'Three pointers · in place',
	lede: 'Fill nums1 from the back, largest first, so a write never lands on a value you still need to read.'
};

type Args = [nums1: number[], m: number, nums2: number[], n: number];
export type Step = BaseStep & {
	a: number[];
	b: number[];
	m: number;
	i: number;
	j: number;
	k: number;
	wrote: number | null;
	done?: boolean;
};

const sorted = (xs: number[]) => xs.every((v, x) => x === 0 || xs[x - 1] <= v);

export const problem: Problem<Args, Step, number[]> = {
	fields: [
		{ name: 'nums1', kind: 'list', from: ([a, m]) => a.slice(0, m), placeholder: '1, 2, 3' },
		{ name: 'nums2', kind: 'list', from: ([, , b]) => b, placeholder: '2, 5, 6' }
	],
	toArgs({ nums1, nums2 }) {
		if (!sorted(nums1) || !sorted(nums2)) throw new Error('Both lists must be sorted in non-decreasing order.');
		return [[...nums1, ...nums2.map(() => 0)], nums1.length, nums2, nums2.length];
	},

	trace([nums1, m, b]) {
		const a = [...nums1];
		let i = m - 1, j = b.length - 1, k = m + b.length - 1;
		const out: Step[] = [{
			a: [...a], b, m, i, j, k, wrote: null, line: 1,
			msg: 'Start at the back: i on the last real value of nums1, j on the last value of nums2, k on the last free slot.'
		}];
		while (j >= 0) {
			let msg: string, line: number;
			if (i >= 0 && a[i] > b[j]) {
				line = 4;
				msg = `${a[i]} > ${b[j]}, so ${a[i]} moves from nums1[${i}] to slot ${k}. i steps left.`;
				a[k] = a[i]; i--;
			} else {
				line = 6;
				msg = i < 0
					? `nums1 is used up, so ${b[j]} moves from nums2[${j}] to slot ${k}.`
					: `${a[i]} ≤ ${b[j]}, so ${b[j]} moves from nums2[${j}] to slot ${k}. j steps left.`;
				a[k] = b[j]; j--;
			}
			k--;
			out.push({ a: [...a], b, m, i, j, k, wrote: k + 1, msg, line });
		}
		out.push({
			...out.at(-1)!, wrote: null, done: true, line: 2,
			msg: b.length === 0 ? 'nums2 is empty, so nums1 is already the answer.'
				: i >= 0 ? `j < 0, so nums2 is used up. nums1[0..${i}] never moved and is already in place.`
				: 'j < 0, so nums2 is used up. Every slot is filled.'
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i, note: 'last unread in nums1' },
		{ name: 'j', value: s.j, note: 'last unread in nums2' },
		{ name: 'k', value: s.k, note: 'next slot to fill' },
		{ name: 'free', value: s.k - s.i, note: 'empty slots, always j + 1' }
	],

	result: (s) => s.a
};
