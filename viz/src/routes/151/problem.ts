// 151. Reverse Words in a String: scan from the right; j marks a word's end, i walks to its start; append it.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	lede: 'Read s from the right: skip spaces, mark a word’s last letter with j, walk i to the space before it, and append that word; the words come out already reversed.'
};

type Args = [s: string];
export type Step = BaseStep & {
	s: string;
	i: number;
	/** End of the word being read, or null while skipping spaces. */
	j: number | null;
	/** Words appended so far, in output order. */
	out: string[];
	/** Which row holds the one lit tile. */
	lit: { row: 's' | 'out'; at: number } | null;
	done?: boolean;
};

export const problem: Problem<Args, Step, string> = {
	fields: [{ name: 's', kind: 'string', from: ([s]) => s, placeholder: '  the sky  is blue ' }],
	toArgs({ s }) {
		if (!/^[A-Za-z0-9 ]*$/.test(s)) throw new Error('s may hold only letters, digits and spaces.');
		if (!/[A-Za-z0-9]/.test(s)) throw new Error('s needs at least one word.');
		return [s];
	},

	trace([s]) {
		const out: string[] = [];
		let i = s.length - 1;
		const steps: Step[] = [{
			s, i, j: null, out: [], lit: null, line: 1,
			msg: 'Read s from the right, so the last word comes out first. out starts empty; i starts at the last character.'
		}];
		while (i >= 0) {
			if (s[i] === ' ') {
				i--;
				steps.push({ s, i, j: null, out: [...out], lit: null, line: 4, msg: `s[${i + 1}] is a space, between words or at an end. Skip it.` });
				continue;
			}
			const j = i;
			steps.push({ s, i, j, out: [...out], lit: { row: 's', at: j }, line: 5, msg: `s[${j}] = '${s[j]}' is a letter after a space (or the end): a word ends here. Mark it with j = ${j}.` });
			while (i >= 0 && s[i] !== ' ') {
				i--;
				const msg = i < 0
					? `i ran off the start, so the word starts at index 0.`
					: s[i] === ' '
						? `s[${i}] is a space, so the word starts at ${i + 1}. i stops here.`
						: `s[${i}] = '${s[i]}' is still a letter of the same word. Keep walking left.`;
				steps.push({ s, i, j, out: [...out], lit: i >= 0 && s[i] !== ' ' ? { row: 's', at: i } : null, line: 7, msg });
			}
			const word = s.slice(i + 1, j + 1);
			const at = out.reduce((n, w) => n + w.length + 1, 0);
			out.push(word);
			steps.push({
				s, i, j: null, out: [...out], lit: { row: 'out', at }, line: 8,
				msg: out.length === 1
					? `Append s[${i + 1}..${j}] = "${word}". It was the last word of s, so it goes first.`
					: `Append "${word}" after one space. Earlier words of s come out later, so the order is reversed.`
			});
		}
		steps.push({
			s, i, j: null, out: [...out], lit: null, done: true, line: 9,
			msg: `i is past the start. Join the ${out.length} word${out.length === 1 ? '' : 's'} with single spaces: "${out.join(' ')}".`
		});
		return steps;
	},

	vars: (s) => [
		{ name: 'i', value: s.i, note: 'next character to read' },
		{ name: 's[i]', value: s.i >= 0 ? `'${s.s[s.i] === ' ' ? '·' : s.s[s.i]}'` : '–', note: '· is a space' },
		{ name: 'j', value: s.j ?? '–', note: 'last letter of this word' },
		{ name: 'out', value: JSON.stringify(s.out).replace(/,/g, ', '), note: 'words appended so far' }
	],

	result: (s) => s.out.join(' ')
};
