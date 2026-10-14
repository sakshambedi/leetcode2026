// 55. Jump Game: sweep i left to right, stretching reach, the farthest index any visited cell can jump to.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Greedy · farthest reach',
	lede: 'Walk forward while i stays within reach, stretching reach to i + nums[i]; you win once reach covers the last index, and lose if i ever steps past it.'
};

type Args = [nums: number[]];
export type Step = BaseStep & {
	a: number[];
	i: number;
	reach: number;
	/** The tile that just stood up as reach grew. */
	lit: number | null;
	/** The answer once known. */
	ok: boolean | null;
	/** i read this step: its jump is used up. */
	used: boolean;
	done?: boolean;
};

export const problem: Problem<Args, Step, boolean> = {
	fields: [{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '2, 3, 1, 1, 4' }],
	toArgs({ nums }) {
		if (nums.length === 0) throw new Error('nums needs at least one value.');
		if (nums.some((v: number) => v < 0)) throw new Error('Jump lengths must be 0 or more.');
		return [nums];
	},

	trace([nums]) {
		const a = [...nums], last = a.length - 1;
		let reach = 0;
		const out: Step[] = [{
			a, i: 0, reach, lit: null, ok: null, used: false, line: 1,
			msg: 'Only index 0 is reachable so far, so reach = 0. Cells past reach lie flat: no jump lands there yet.'
		}];
		for (let i = 0; i < a.length; i++) {
			if (i > reach) {
				out.push({
					a, i, reach, lit: null, ok: false, used: false, line: 4, done: true,
					msg: `i = ${i} is past reach = ${reach}: no visited cell can jump this far, so the last index is out of reach. Return false.`
				});
				return out;
			}
			const to = i + a[i], before = reach;
			reach = Math.max(reach, to);
			out.push({
				a, i, reach, used: true, ok: null, line: 5,
				lit: reach > before ? Math.min(reach, last) : null,
				msg: a[i] === 0
					? `nums[${i}] = 0: this cell jumps nowhere, so reach stays ${reach}.`
					: reach > before
						? `From ${i}, a jump of up to ${a[i]} reaches ${to} > ${before}, so reach grows to ${reach}; every cell up to it is now reachable.`
						: `From ${i}, a jump of up to ${a[i]} reaches only ${to} ≤ ${before}, so reach stays ${reach}.`
			});
			if (reach >= last) {
				out.push({
					...out.at(-1)!, lit: null, ok: true, line: 7, done: true,
					msg: last === 0
						? 'There is only one cell, and you start on it. Return true.'
						: `reach = ${reach} ≥ ${last}, the last index, so it can be reached. Return true.`
				});
				return out;
			}
		}
		return out; // unreachable: i = last always ends the loop above
	},

	vars: (s) => [
		{ name: 'i', value: s.i, note: 'cell being read' },
		{ name: 'nums[i]', value: s.used ? s.a[s.i] : '–', note: 'longest jump from i' },
		{ name: 'i + nums[i]', value: s.used ? s.i + s.a[s.i] : '–', note: 'farthest jump from i' },
		{ name: 'reach', value: s.reach, note: 'farthest reachable index' },
		{ name: 'n - 1', value: s.a.length - 1, note: 'the target' }
	],

	result: (s) => s.ok ?? false
};
