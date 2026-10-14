// 27. Remove Element: read with i, write kept values at k.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'Two pointers · in place',
	lede: "Read every value with i and copy each one that isn't val down to the write head k; the first k slots are the answer."
};

type Args = [nums: number[], val: number];
export type Step = BaseStep & {
	a: number[];
	val: number;
	i: number;
	k: number;
	wrote: number | null;
	dropped: number | null;
	done?: boolean;
};

const sameValues = (x: number[], y: number[]) =>
	JSON.stringify([...x].sort((p, q) => p - q)) === JSON.stringify([...y].sort((p, q) => p - q));

export const problem: Problem<Args, Step, [number, number[]]> = {
	fields: [
		{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '0, 1, 2, 2, 3' },
		{ name: 'val', kind: 'int', from: ([, v]) => v, placeholder: '2' }
	],
	toArgs: ({ nums, val }) => [nums, val],

	trace([nums, val]) {
		const a = [...nums];
		let k = 0;
		const out: Step[] = [{
			a: [...a], val, i: 0, k, wrote: null, dropped: null, line: 1,
			msg: `Start with i and k both on slot 0. i reads every value; k marks where the next value ≠ ${val} goes.`
		}];
		for (let i = 0; i < a.length; i++) {
			let msg: string, wrote: number | null = null, dropped: number | null = null;
			if (a[i] !== val) {
				msg = k === i
					? `${a[i]} ≠ ${val}, so it stays: nums[${k}] is already ${a[i]}. k steps right.`
					: `${a[i]} ≠ ${val}, so it moves from slot ${i} down to slot ${k}. k steps right.`;
				a[k] = a[i]; wrote = k; k++;
			} else {
				msg = `${a[i]} = ${val}, so skip it. Slot ${i} joins the free gap; k stays on ${k}.`;
				dropped = i;
			}
			out.push({ a: [...a], val, i: i + 1, k, wrote, dropped, msg, line: wrote === null ? 3 : 4 });
		}
		out.push({
			...out.at(-1)!, wrote: null, dropped: null, done: true, line: 6,
			msg: k === a.length
				? `i reached the end with nothing to skip. Return k = ${k}.`
				: `i reached the end. Return k = ${k}: slots 0..${k - 1} hold every value ≠ ${val}; the rest are leftovers.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i, note: 'next value to read' },
		{ name: 'k', value: s.k, note: 'next write slot' },
		{ name: 'gap', value: s.i - s.k, note: 'slots free to overwrite' },
		{ name: 'val', value: s.val, note: 'value to remove' }
	],

	result: (s) => [s.k, s.a.slice(0, s.k)],
	// Like the judge: k must match, and the first k values in any order.
	check: ([k, kept], [wantK, wantKept]) => k === wantK && sameValues(kept, wantKept)
};
