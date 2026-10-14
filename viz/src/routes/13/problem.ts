// 13. Roman to Integer: scan left to right; subtract a symbol when the next one is bigger, else add it.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'Single scan · one-symbol lookahead',
	lede: 'Add each symbol, except subtract it when the symbol after it is bigger: the I in IV, the C in CM.'
};

export const VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const VALID = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

type Args = [s: string];
export type Step = BaseStep & {
	s: string[];
	i: number;
	/** Signed contribution of each symbol read so far; null while unread. */
	signed: (number | null)[];
	total: number;
	done?: boolean;
};

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 's', kind: 'string', from: ([s]) => s, placeholder: 'MCMXCIV' }],
	toArgs({ s }) {
		const t = String(s).trim().toUpperCase();
		if (t.length < 1 || t.length > 15) throw new Error('s must be 1 to 15 characters long.');
		if (/[^IVXLCDM]/.test(t)) throw new Error('s may only use I, V, X, L, C, D and M.');
		if (!VALID.test(t)) throw new Error(`"${t}" is not a valid Roman numeral in [1, 3999].`);
		return [t];
	},

	trace([str]) {
		const s = [...str];
		const signed: (number | null)[] = s.map(() => null);
		let total = 0;
		const out: Step[] = [{
			s, i: 0, signed: [...signed], total, line: 1,
			msg: 'total starts at 0. Read the symbols left to right, peeking one symbol ahead.'
		}];
		for (let i = 0; i < s.length; i++) {
			const v = VALUE[s[i]];
			const next = i + 1 < s.length ? VALUE[s[i + 1]] : null;
			let msg: string;
			if (next !== null && v < next) {
				total -= v;
				signed[i] = -v;
				msg = `${s[i]} = ${v} is smaller than the next symbol ${s[i + 1]} = ${next}, so it is subtracted: total = ${total}.`;
			} else {
				total += v;
				signed[i] = v;
				msg = next === null
					? `${s[i]} = ${v} is the last symbol, nothing after it can make it negative, so add it: total = ${total}.`
					: `${s[i]} = ${v} is not smaller than the next symbol ${s[i + 1]} = ${next}, so add it: total = ${total}.`;
			}
			out.push({ s, i, signed: [...signed], total, line: signed[i]! < 0 ? 5 : 7, msg });
		}
		out.push({
			...out.at(-1)!, i: s.length, done: true, line: 8,
			msg: `Every symbol is read. Return total = ${total}.`
		});
		return out;
	},

	vars: (s) => {
		const cur = !s.done && s.line !== 1 ? s.s[s.i] : undefined;
		const nxt = cur !== undefined && s.i + 1 < s.s.length ? s.s[s.i + 1] : undefined;
		return [
			{ name: 'i', value: s.done || s.line === 1 ? '–' : s.i, note: 'index into s' },
			{ name: 's[i]', value: cur ?? '–', note: 'symbol being read' },
			{ name: 'v', value: cur ? VALUE[cur] : '–', note: 'value of s[i]' },
			{ name: 'next', value: nxt ? VALUE[nxt] : '–', note: 'value of s[i+1]; bigger means subtract v' },
			{ name: 'total', value: s.total, note: 'sum of signed values so far' }
		];
	},

	result: (s) => s.total
};
