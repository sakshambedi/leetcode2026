// 6. Zigzag Conversion: drop each char into rows[row], bounce row between 0 and numRows - 1, join the rows.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Simulation · row buckets',
	lede: 'Walk s once, appending each char to the current row; the row index bounces off the top and bottom, then the rows are read out in order.'
};

type Args = [s: string, numRows: number];
export type Step = BaseStep & {
	s: string;
	numRows: number;
	/** Zigzag cell [row, column] of every char of s; shared by every step. */
	pos: [number, number][];
	cols: number;
	/** Chars of s placed so far. */
	placed: number;
	/** Row and step for the next char. */
	row: number;
	step: number;
	/** Rows already read into the answer (read phase only). */
	read: number;
	out: string;
	/** The cell that just changed: a grid cell, or the last answer char. */
	litCell: [number, number] | null;
	litOut: number | null;
	done?: boolean;
};

/** Where each char sits in the classic zigzag drawing: down a column, then up the diagonal. */
export function layout(n: number, numRows: number) {
	const pos: [number, number][] = [];
	let row = 0, col = 0, step = 1;
	for (let i = 0; i < n; i++) {
		pos.push([row, col]);
		if (numRows === 1) { col++; continue; }
		if (row === 0) step = 1;
		else if (row === numRows - 1) step = -1;
		row += step;
		if (step === -1) col++;
	}
	return { pos, cols: n === 0 ? 0 : Math.max(...pos.map(([, c]) => c)) + 1 };
}

/** rows[r] built from the first `placed` chars. */
export function rowText(s: Step, r: number) {
	let t = '';
	for (let i = 0; i < s.placed; i++) if (s.pos[i][0] === r) t += s.s[i];
	return t;
}

export const problem: Problem<Args, Step, string> = {
	fields: [
		{ name: 's', kind: 'string', from: ([s]) => s, placeholder: 'PAYPALISHIRING' },
		{ name: 'numRows', kind: 'int', from: ([, n]) => n, placeholder: '3' }
	],
	toArgs({ s, numRows }) {
		if (s.length < 1 || s.length > 1000) throw new Error('s needs 1 to 1000 characters.');
		if (!/^[A-Za-z,.]+$/.test(s)) throw new Error("s may hold only English letters, ',' and '.'.");
		if (!Number.isInteger(numRows) || numRows < 1 || numRows > 1000) throw new Error('numRows must be 1 to 1000.');
		return [s, numRows];
	},
	fits: ([s, numRows]) => s.length <= 16 && numRows <= 6,

	trace([s, numRows]) {
		const n = s.length;
		const { pos, cols } = layout(n, numRows);
		const base = { s, numRows, pos, cols, read: 0, out: '', litCell: null, litOut: null };
		if (numRows === 1) {
			return [
				{ ...base, placed: n, row: 0, step: 0, line: 1,
					msg: 'With one row there is no zigzag: every char stays in row 0, in order.' },
				{ ...base, placed: n, row: 0, step: 0, read: 1, out: s, done: true, line: 2,
					msg: `Return s unchanged: "${s}".` }
			];
		}
		const out: Step[] = [{
			...base, placed: 0, row: 0, step: 1, line: 4,
			msg: `rows starts as ${numRows} empty strings. row = 0 and step = +1: the first chars go straight down.`
		}];
		let row = 0, step = 1;
		for (let i = 0; i < n; i++) {
			const c = s[i], r = row;
			let msg: string, line = 6;
			if (r === 0 && i > 0) {
				step = 1; line = 8;
				msg = `'${c}' lands in row 0, the top, so step flips to +1: the next column runs down again.`;
			} else if (r === numRows - 1) {
				step = -1; line = 10;
				msg = `'${c}' lands in row ${r}, the bottom, so step flips to −1: the zigzag climbs the diagonal.`;
			} else {
				msg = i === 0
					? `'${c}' goes into row 0. step is +1, so the next char goes to row 1.`
					: `'${c}' goes into row ${r}. step is ${step > 0 ? '+1' : '−1'}, so the next char goes to row ${r + step}.`;
			}
			row += step;
			out.push({ ...base, placed: i + 1, row, step, litCell: pos[i], line, msg });
		}
		const last = out.at(-1)!;
		let answer = '';
		for (let r = 0; r < numRows; r++) {
			const text = rowText(last, r);
			answer += text;
			out.push({
				...last, read: r + 1, out: answer, litCell: null, litOut: text ? answer.length - 1 : null, line: 12,
				msg: text
					? `Every char is placed. Read row ${r} left to right: "${text}" joins the answer.`
					: `Row ${r} is empty (more rows than the zigzag reaches), so nothing joins.`
			});
		}
		out.push({ ...out.at(-1)!, litOut: null, done: true, line: 12, msg: `Return the rows joined: "${answer}".` });
		return out;
	},

	vars: (s) => {
		const placing = s.read === 0 && !s.done && s.placed < s.s.length;
		const r = placing ? s.row : s.read > 0 ? s.read - 1 : null;
		return [
			{ name: 'c', value: placing ? s.s[s.placed] : '–', note: 'next char of s to place' },
			{ name: 'row', value: r ?? '–', note: placing ? 'row c goes to' : 'row just read' },
			{ name: 'step', value: placing ? (s.step > 0 ? '+1' : '−1') : '–', note: 'down (+1) or up (−1)' },
			{ name: 'numRows', value: s.numRows, note: 'row bounces off 0 and numRows − 1' },
			{ name: 'rows[row]', value: r === null ? '–' : JSON.stringify(rowText(s, r)), note: placing ? 'that row so far' : 'joins the answer' },
			{ name: 'answer', value: JSON.stringify(s.out), note: '"".join(rows) so far' }
		];
	},

	result: (s) => s.out
};
