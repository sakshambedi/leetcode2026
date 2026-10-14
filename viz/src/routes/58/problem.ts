// 58. Length of Last Word: scan from the end, skip trailing spaces, then count letters until a space.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	lede: 'The last word is at the end, so walk in from the back: skip the trailing spaces, then count letters until the next space.'
};

type Args = [s: string];
export type Step = BaseStep & {
	s: string;
	i: number;
	length: number;
	/** Index of the last letter, once the trailing spaces are skipped. */
	end: number | null;
	lit: number | null;
	done?: boolean;
};

const show = (c: string) => (c === ' ' ? '·' : c);

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 's', kind: 'string', from: ([s]) => s, placeholder: '  fly me to the moon ' }],
	toArgs({ s }) {
		if (!/^[A-Za-z ]*$/.test(s)) throw new Error('s may hold only English letters and spaces.');
		if (!/[A-Za-z]/.test(s)) throw new Error('s needs at least one word.');
		return [s];
	},
	fits: ([s]) => s.length <= 30,

	trace([s]) {
		let i = s.length - 1;
		let length = 0;
		let end: number | null = null;
		const out: Step[] = [{
			s, i, length, end, lit: null, line: 1,
			msg: 'The last word sits at the end, so i starts at the last character and walks left. Nothing counted yet.'
		}];
		while (i >= 0 && s[i] === ' ') {
			i--;
			out.push({
				s, i, length, end, lit: null, line: 3,
				msg: `s[${i + 1}] is a trailing space, not part of any word. Skip it.`
			});
		}
		end = i;
		while (i >= 0 && s[i] !== ' ') {
			length++;
			i--;
			out.push({
				s, i, length, end, lit: i + 1, line: 5,
				msg: length === 1
					? `s[${i + 1}] = '${s[i + 1]}' is the last letter of the last word. Count it: length = 1.`
					: `s[${i + 1}] = '${s[i + 1]}' is still a letter, still the same word. length = ${length}.`
			});
		}
		out.push({
			s, i, length, end, lit: null, done: true, line: 7,
			msg: i < 0
				? `i ran off the start, so the word began at index 0. Return length = ${length}.`
				: `s[${i}] is a space, so the word is over. Nothing to its left matters. Return length = ${length}.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i, note: 'next character to read' },
		{ name: 's[i]', value: s.i >= 0 ? `'${show(s.s[s.i])}'` : '–', note: '· is a space' },
		{ name: 'length', value: s.length, note: 'letters of the last word so far' }
	],

	result: (s) => s.length
};
