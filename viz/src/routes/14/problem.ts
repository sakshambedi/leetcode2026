// 14. Longest Common Prefix: vertical scan; column i of strs[0] against column i of every other string.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Easy',
	pattern: 'Vertical scanning · column by column',
	lede: 'Read the strings column by column: the prefix grows while every string has the same letter at i, and stops at the first one that is too short or differs.'
};

type Args = [strs: string[]];
export type Step = BaseStep & {
	strs: string[];
	/** Column being checked; also the prefix length confirmed so far. */
	i: number;
	/** Row being compared with strs[0], or null between columns. */
	j: number | null;
	lit: [row: number, col: number] | null;
	done?: boolean;
};

export const problem: Problem<Args, Step, string> = {
	fields: [{ name: 'strs', kind: 'strings', from: ([strs]) => strs, placeholder: 'flower, flow, flight' }],
	toArgs({ strs }) {
		if (strs.length === 0) throw new Error('strs needs at least one string.');
		if (strs.length > 200) throw new Error('strs holds at most 200 strings.');
		if (!strs.every((w: string) => /^[a-z]*$/.test(w))) throw new Error('Strings may hold only lowercase letters.');
		if (strs.some((w: string) => w.length > 200)) throw new Error('Each string is at most 200 letters.');
		return [strs];
	},
	// Few strings, each short: one row per string.
	fits: ([strs]) => strs.length <= 6 && strs.every((w) => w.length <= 14),

	trace([strs]) {
		const first = strs[0];
		const out: Step[] = [{
			strs, i: 0, j: null, lit: null, line: 1,
			msg: `The prefix can be no longer than strs[0] = "${first}". Walk its columns with i, checking every other string at the same column.`
		}];
		const finish = (i: number, why: string) =>
			out.push({ strs, i, j: null, lit: null, done: true, line: i === first.length ? 6 : 5, msg: why });

		for (let i = 0; i < first.length; i++) {
			const c = first[i];
			if (strs.length === 1) continue;
			for (let j = 1; j < strs.length; j++) {
				const s = strs[j];
				if (i === s.length) {
					out.push({ strs, i, j, lit: null, line: 4, msg: `strs[${j}] = "${s}" has no column ${i}: it has run out, so the prefix cannot grow past it.` });
					finish(i, `Return strs[0][:${i}] = "${first.slice(0, i)}".`);
					return out;
				}
				if (s[i] !== c) {
					out.push({ strs, i, j, lit: [j, i], line: 4, msg: `strs[${j}][${i}] = '${s[i]}' differs from c = '${c}'. Column ${i} is not shared.` });
					finish(i, `Return strs[0][:${i}] = "${first.slice(0, i)}".`);
					return out;
				}
				out.push({
					strs, i, j, lit: [j, i], line: 4,
					msg: j === strs.length - 1
						? `strs[${j}][${i}] = '${c}' matches too. Every string has '${c}' at column ${i}, so it joins the prefix.`
						: `strs[${j}][${i}] = '${s[i]}' matches c = '${c}'. Check the next string.`
				});
			}
		}
		finish(first.length, first.length === 0
			? 'strs[0] is empty, so no column to check. Return "".'
			: `Every column of strs[0] is shared, so strs[0] itself is the prefix. Return "${first}".`);
		return out;
	},

	vars: (s) => {
		const c = s.i < s.strs[0].length ? s.strs[0][s.i] : null;
		const other = s.j === null ? null : s.strs[s.j][s.i];
		return [
			{ name: 'i', value: s.i, note: 'column being checked' },
			{ name: 'c', value: c === null || s.done ? '–' : `'${c}'`, note: 'strs[0][i], to match' },
			{ name: 's', value: s.j === null ? '–' : `"${s.strs[s.j]}"`, note: s.j === null ? 'string compared with strs[0]' : `strs[${s.j}], compared with strs[0]` },
			{ name: 's[i]', value: s.j === null ? '–' : other === undefined ? 'none' : `'${other}'`, note: 'its letter at column i' },
			{ name: 'prefix', value: `"${s.strs[0].slice(0, s.i)}"`, note: 'strs[0][:i], shared so far' }
		];
	},

	result: (s) => s.strs[0].slice(0, s.i)
};
