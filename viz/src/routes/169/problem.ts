// 169. Majority Element: Boyer–Moore voting; a different value cancels one vote for the candidate.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'Boyer–Moore voting · one pass',
	lede: 'Let each different value cancel one vote for the candidate; the majority has more than half the votes, so it is the one left standing.'
};

type Args = [nums: number[]];
export type Step = BaseStep & {
	a: number[];
	i: number; // index just read, -1 before the loop
	cand: number | null;
	count: number;
	done?: boolean;
};

const majority = (xs: number[]) => {
	const seen = new Map<number, number>();
	for (const x of xs) seen.set(x, (seen.get(x) ?? 0) + 1);
	return [...seen.values()].some((c) => c > xs.length / 2);
};

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '2, 2, 1, 1, 1, 2, 2' }],
	toArgs({ nums }) {
		if (nums.length === 0) throw new Error('nums needs at least one value.');
		if (!majority(nums)) throw new Error('One value must appear more than ⌊n / 2⌋ times.');
		return [nums];
	},

	trace([nums]) {
		const a = [...nums];
		let cand: number | null = null, count = 0;
		const out: Step[] = [{
			a, i: -1, cand, count, line: 1,
			msg: 'No votes yet: count is 0 and there is no candidate. Read the values left to right.'
		}];
		a.forEach((x, i) => {
			let msg: string, line: number;
			if (count === 0) {
				msg = cand === null
					? `count is 0, so ${x} becomes the candidate with one vote.`
					: `count is 0: every vote for ${cand} was cancelled. ${x} becomes the new candidate with one vote.`;
				cand = x; count = 1; line = 4;
			} else if (x === cand) {
				count++; line = 5;
				msg = `${x} = cand, one more vote for it: count is ${count}.`;
			} else {
				count--; line = 5;
				msg = `${x} ≠ cand ${cand}, so it cancels one vote for ${cand}: count is ${count}.`;
			}
			out.push({ a, i, cand, count, msg, line });
		});
		out.push({
			...out.at(-1)!, i: a.length, done: true, line: 6,
			msg: `Every value is read. ${cand} still has ${count} vote${count === 1 ? '' : 's'} left; the majority can never be cancelled out, so return ${cand}.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'x', value: s.i < 0 || s.done ? '–' : s.a[s.i], note: 'value just read' },
		{ name: 'cand', value: s.cand ?? 'None', note: 'current candidate' },
		{ name: 'count', value: s.count, note: 'its uncancelled votes' },
		{ name: 'read', value: `${Math.min(s.i + 1, s.a.length)} / ${s.a.length}`, note: 'values seen so far' }
	],

	result: (s) => s.cand!
};
