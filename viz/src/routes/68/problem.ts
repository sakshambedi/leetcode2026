// 68. Text Justification: pack words greedily, then share the spare spaces over the gaps, left gaps first.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Hard',
	pattern: 'Greedy packing · simulation',
	lede: 'Pack each line with as many words as fit with single spaces, then spread the spare spaces over the gaps, extra ones to the left; the last line and one-word lines stay left-justified.'
};

type Args = [words: string[], maxWidth: number];
type Phase = 'start' | 'pack' | 'close' | 'split' | 'gap' | 'left' | 'done';
export type Step = BaseStep & {
	maxWidth: number;
	/** Finished lines, plus the line being built (always maxWidth chars, spaces for free room). */
	lines: string[];
	/** Number of lines the answer will have, so the figure size never jumps. */
	total: number;
	phase: Phase;
	/** Line being built: words[i..j), `length` letters. */
	i: number;
	j: number;
	length: number;
	/** The word being tried and what the line would need with it. */
	word: string | null;
	need: number | null;
	gaps: number;
	q: number | null;
	r: number | null;
	/** Gap just filled. */
	k: number | null;
	/** Column (in the current line) of the tile that just changed. */
	lit: number | null;
	done?: boolean;
};

const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));

/** The canonical answer, used only to size the figure. */
function lineCount(words: string[], maxWidth: number) {
	let count = 0;
	for (let i = 0; i < words.length; count++) {
		let j = i, length = 0;
		while (j < words.length && length + words[j].length + (j - i) <= maxWidth) length += words[j++].length;
		i = j;
	}
	return count;
}

export const problem: Problem<Args, Step, string[]> = {
	fields: [
		{ name: 'words', kind: 'strings', from: ([w]) => w, placeholder: 'This, is, an, example, of, text' },
		{ name: 'maxWidth', kind: 'int', from: ([, m]) => m, placeholder: '16' }
	],
	toArgs({ words, maxWidth }) {
		if (!Number.isInteger(maxWidth) || maxWidth < 1 || maxWidth > 100) throw new Error('maxWidth must be 1 to 100.');
		if (words.length < 1 || words.length > 300) throw new Error('words needs 1 to 300 words.');
		for (const w of words as string[]) {
			if (w.length < 1 || /\s/.test(w)) throw new Error('Each word needs at least one character and no spaces.');
			if (w.length > 20 || w.length > maxWidth) throw new Error(`"${w}" is longer than maxWidth (or 20).`);
		}
		return [words, maxWidth];
	},
	fits: ([words, maxWidth]) => maxWidth <= 20 && words.length <= 24,

	trace([words, maxWidth]) {
		const n = words.length;
		const total = lineCount(words, maxWidth);
		const done: string[] = [];
		const blank = { word: null, need: null, gaps: 0, q: null, r: null, k: null, lit: null };
		const out: Step[] = [{
			maxWidth, lines: [], total, phase: 'start', i: 0, j: 0, length: 0, ...blank, line: 1,
			msg: `res is empty and i = 0. Each line gets exactly ${maxWidth} characters.`
		}];
		const snap = (cur: string, s: Omit<Step, 'maxWidth' | 'lines' | 'total'>) =>
			out.push({ maxWidth, total, lines: [...done, cur], ...s });

		let i = 0;
		while (i < n) {
			let j = i, length = 0;
			// Greedy packing: words join with one space while they fit.
			while (j < n && length + words[j].length + (j - i) <= maxWidth) {
				const w = words[j], need = length + w.length + (j - i);
				const col = length + (j - i);
				length += w.length; j++;
				snap(pad(words.slice(i, j).join(' '), maxWidth), {
					phase: 'pack', i, j, length, ...blank, word: w, need, lit: col, line: 5,
					msg: j - i === 1
						? `"${w}" starts line ${done.length}: ${w.length} letters ≤ ${maxWidth}.`
						: `"${w}" fits: ${length - w.length} letters + ${w.length} + ${j - i - 1} space${j - i - 1 === 1 ? '' : 's'} = ${need} ≤ ${maxWidth}, so it joins.`
				});
			}
			const draft = pad(words.slice(i, j).join(' '), maxWidth);
			const gaps = j - i - 1;
			const next = j < n ? words[j] : null;
			const needNext = next === null ? null : length + next.length + (j - i);
			snap(draft, {
				phase: 'close', i, j, length, ...blank, word: next, need: needNext, gaps, line: 6,
				msg: (next === null
					? 'No words left, so this is the last line'
					: `"${next}" would need ${needNext} > ${maxWidth}, so the line closes`) +
					` with ${j - i} word${j - i === 1 ? '' : 's'}, ${length} letters and ${gaps} gap${gaps === 1 ? '' : 's'}.`
			});
			if (j === n || gaps === 0) {
				done.push(draft);
				snap(draft, {
					phase: 'left', i, j, length, ...blank, gaps, line: 8,
					msg: (j === n ? 'Last line' : 'One word, no gap to stretch') +
						`: keep single spaces and pad ${maxWidth - (length + gaps)} space${maxWidth - (length + gaps) === 1 ? '' : 's'} on the right.`
				});
			} else {
				const spaces = maxWidth - length, q = Math.floor(spaces / gaps), r = spaces % gaps;
				snap(draft, {
					phase: 'split', i, j, length, ...blank, gaps, q, r, line: 10,
					msg: `${maxWidth} − ${length} letters = ${spaces} spaces over ${gaps} gap${gaps === 1 ? '' : 's'}: q = ${q} each` +
						(r ? `, and the first r = ${r} gap${r === 1 ? '' : 's'} get one more.` : ', no remainder.')
				});
				let line = '';
				for (let k = 0; k < gaps; k++) {
					const width = q + (k < r ? 1 : 0);
					line += words[i + k] + ' '.repeat(width);
					const moved = words[i + k + 1];
					const cur = pad(line + words.slice(i + k + 1, j).join(' '), maxWidth);
					snap(cur, {
						phase: 'gap', i, j, length, ...blank, gaps, q, r, k, lit: line.length, line: 13,
						msg: `Gap ${k} gets ${width} space${width === 1 ? '' : 's'}` +
							(k < r ? ` (q + 1, since k < r: extra spaces go left)` : r ? ` (just q, the extras are used up)` : '') +
							`, so "${moved}" starts at column ${line.length}.`
					});
				}
				done.push(pad(line + words[j - 1], maxWidth));
			}
			i = j;
		}
		out.push({
			...out.at(-1)!, lines: [...done], phase: 'done', ...blank, done: true, line: 17,
			msg: `i reached the end of words. Return the ${done.length} line${done.length === 1 ? '' : 's'}.`
		});
		return out;
	},

	vars: (s) => {
		const packing = s.phase === 'start' || s.phase === 'pack' || s.phase === 'close';
		const dash = (v: number | null, show = true) => (v === null || !show ? '–' : v);
		return [
			{ name: 'i', value: s.done ? '–' : s.i, note: 'first word of the line' },
			{ name: 'j', value: s.done ? '–' : s.j, note: 'one past its last word' },
			{ name: 'words[j]', value: packing && s.word !== null ? JSON.stringify(s.word) : '–', note: 'word being tried' },
			{ name: 'length', value: s.done ? '–' : s.length, note: 'letters on the line' },
			{ name: 'need', value: dash(s.need, packing), note: 'length + len(words[j]) + (j − i)' },
			{ name: 'maxWidth', value: s.maxWidth, note: 'need must stay ≤ this' },
			{ name: 'gaps', value: dash(s.gaps, !packing && !s.done), note: 'j − i − 1 slots between words' },
			{ name: 'q', value: dash(s.q), note: '(maxWidth − length) // gaps' },
			{ name: 'r', value: dash(s.r), note: 'first r gaps get q + 1' },
			{ name: 'k', value: dash(s.k), note: 'gap just filled' }
		];
	},

	result: (s) => s.lines
};
