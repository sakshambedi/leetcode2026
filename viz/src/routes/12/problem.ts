// 12. Integer to Roman: greedy over 13 value/symbol pairs, largest first; append the biggest pair that fits.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Greedy · fixed table',
	lede: 'Put the six subtractive forms in the table with the seven symbols, then keep appending the biggest pair that still fits in num.'
};

/** The 13 pairs, largest first: the seven symbols plus CM, CD, XC, XL, IX, IV. */
export const PAIRS: [number, string][] = [
	[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'],
	[40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

type Args = [num: number];
export type Step = BaseStep & {
	/** Index of the current pair in PAIRS. */
	k: number;
	num: number;
	/** Symbols appended so far, one tile per append. */
	out: string[];
	/** The part that just changed: a new out tile, or the pair k landed on. */
	lit: { row: 'pairs' | 'out'; at: number } | null;
	done?: boolean;
};

export const problem: Problem<Args, Step, string> = {
	fields: [{ name: 'num', kind: 'int', from: ([num]) => num, placeholder: '1994' }],
	toArgs({ num }) {
		if (!Number.isInteger(num) || num < 1 || num > 3999) throw new Error('num must be a whole number from 1 to 3999.');
		return [num];
	},
	// num up to 3999 is fine: the figure is always the 13 pairs plus at most 15 out tiles.
	fits: () => true,

	trace([start]) {
		let num = start, k = 0;
		const out: string[] = [];
		const steps: Step[] = [{
			k, num, out: [], lit: null, line: 1,
			msg: `out starts empty. Walk the 13 pairs from the largest, M = 1000, taking each as often as it fits in ${num}.`
		}];
		while (num > 0) {
			const [value, symbol] = PAIRS[k];
			if (num >= value) {
				out.push(symbol);
				num -= value;
				steps.push({
					k, num, out: [...out], lit: { row: 'out', at: out.length - 1 }, line: 4,
					msg: `${symbol} = ${value} fits in ${num + value}, so append ${symbol} and subtract: num = ${num}.`
				});
			} else {
				// Skip every pair that is too big in one step.
				const from = k;
				while (PAIRS[k][0] > num) k++;
				const skipped = PAIRS.slice(from, k).map(([, s]) => s);
				const [v, s] = PAIRS[k];
				steps.push({
					k, num, out: [...out], lit: { row: 'pairs', at: k }, line: 3,
					msg: `${skipped.join(', ')} ${skipped.length > 1 ? 'are' : 'is'} bigger than num = ${num}, so move on to ${s} = ${v}, the biggest pair that fits.`
				});
			}
		}
		steps.push({
			...steps.at(-1)!, lit: null, done: true, line: 6,
			msg: `num is 0: every value is spelled out. Return "${out.join('')}".`
		});
		return steps;
	},

	vars: (s) => [
		{ name: 'num', value: s.num, note: 'still to convert' },
		{ name: 'value', value: s.done ? '–' : PAIRS[s.k][0], note: 'current pair, largest that may fit' },
		{ name: 'symbol', value: s.done ? '–' : PAIRS[s.k][1], note: 'appended while value ≤ num' },
		{ name: 'out', value: s.out.join('') || '""', note: 'numeral so far' }
	],

	result: (s) => s.out.join('')
};
