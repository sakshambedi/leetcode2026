// 135. Candy: one pass for the left-neighbor rule, one pass back for the right-neighbor rule.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Hard',
	pattern: 'Greedy · two passes',
	lede: 'Climb each rising slope going right, then each falling slope coming back, keeping the larger count where the two meet.'
};

type Args = [ratings: number[]];
export type Step = BaseStep & {
	r: number[];
	c: number[];
	i: number | null;
	pass: 1 | 2;
	lit: number | null;
	/** Most candies any child gets by the end; fixes the figure's height for the whole run. */
	top: number;
	done?: boolean;
};

const sum = (xs: number[]) => xs.reduce((t, x) => t + x, 0);

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 'ratings', kind: 'list', from: ([ratings]) => ratings, placeholder: '1, 0, 2' }],
	toArgs({ ratings }) {
		if (ratings.length === 0) throw new Error('ratings needs at least one child.');
		if (ratings.some((v: number) => v < 0)) throw new Error('Ratings must be 0 or more.');
		return [ratings];
	},
	fits: ([ratings]) => ratings.length <= 12 && ratings.every((v) => v < 1000),

	trace([ratings]) {
		const r = [...ratings], n = r.length;
		const c = r.map(() => 1);
		const out: Step[] = [];
		const push = (s: Omit<Step, 'r' | 'c' | 'top'>) => out.push({ r, c: [...c], top: 0, ...s });
		push({
			i: null, pass: 1, lit: null, line: 2,
			msg: 'Every child starts with the minimum, 1 candy. Pass 1 walks right and fixes the left-neighbor rule.'
		});
		for (let i = 1; i < n; i++) {
			if (r[i] > r[i - 1]) {
				c[i] = c[i - 1] + 1;
				push({
					i, pass: 1, lit: i, line: 5,
					msg: `ratings[${i}] = ${r[i]} > ratings[${i - 1}] = ${r[i - 1]}, so child ${i} needs one more than its left neighbor: ${c[i]}.`
				});
			} else {
				push({
					i, pass: 1, lit: null, line: 4,
					msg: `ratings[${i}] = ${r[i]} is not above ratings[${i - 1}] = ${r[i - 1]}: no rule from the left, child ${i} keeps ${c[i]}.`
				});
			}
		}
		if (n > 1)
			push({
				i: null, pass: 2, lit: null, line: 6,
				msg: 'Rising slopes are done. Pass 2 walks back from the right and fixes the right-neighbor rule without breaking the left one.'
			});
		for (let i = n - 2; i >= 0; i--) {
			if (r[i] > r[i + 1]) {
				const need = c[i + 1] + 1, had = c[i];
				c[i] = Math.max(had, need);
				push({
					i, pass: 2, lit: need > had ? i : null, line: 8,
					msg: need > had
						? `ratings[${i}] = ${r[i]} > ratings[${i + 1}] = ${r[i + 1]}, so child ${i} needs more than ${c[i + 1]}: max(${had}, ${need}) = ${c[i]}.`
						: `ratings[${i}] = ${r[i]} > ratings[${i + 1}] = ${r[i + 1]}, but child ${i} already has ${had} from the left pass, more than ${c[i + 1]}: max keeps ${had}.`
				});
			} else {
				push({
					i, pass: 2, lit: null, line: 7,
					msg: `ratings[${i}] = ${r[i]} is not above ratings[${i + 1}] = ${r[i + 1]}: no rule from the right, child ${i} keeps ${c[i]}.`
				});
			}
		}
		push({
			i: null, pass: 2, lit: null, done: true, line: 9,
			msg: `Both neighbor rules hold everywhere with no candy to spare. Return ${c.join(' + ')} = ${sum(c)}.`
		});
		const top = Math.max(...c);
		for (const s of out) s.top = top;
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i ?? '–', note: s.pass === 1 ? 'walking right' : 'walking left' },
		{ name: 'n', value: s.r.length, note: 'children in line' },
		{ name: 'ratings[i]', value: s.i === null ? '–' : s.r[s.i], note: 'this child' },
		{
			name: s.pass === 1 ? 'ratings[i-1]' : 'ratings[i+1]',
			value: s.i === null ? '–' : s.r[s.pass === 1 ? s.i - 1 : s.i + 1],
			note: s.pass === 1 ? 'left neighbor' : 'right neighbor'
		},
		{ name: 'candies[i]', value: s.i === null ? '–' : s.c[s.i], note: 'candies for child i' },
		{
			name: s.pass === 1 ? 'candies[i-1]' : 'candies[i+1]',
			value: s.i === null ? '–' : s.c[s.pass === 1 ? s.i - 1 : s.i + 1],
			note: 'the neighbor to beat'
		},
		{ name: 'sum(candies)', value: sum(s.c), note: 'total handed out' }
	],

	result: (s) => sum(s.c)
};
