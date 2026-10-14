// 28. Find the Index of the First Occurrence in a String: slide needle under haystack, compare letter by letter.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	lede: 'Lay the needle under the haystack at each start in turn and compare letter by letter: a full match returns the start, a mismatch slides it one to the right.'
};

type Args = [haystack: string, needle: string];
export type Step = BaseStep & {
	haystack: string;
	needle: string;
	start: number;
	/** Letters of needle matched at this start. */
	k: number;
	/** Haystack index just compared, the one lit tile. */
	lit: number | null;
	found: number | null;
	done?: boolean;
};

const lower = (w: string) => /^[a-z]+$/.test(w);

export const problem: Problem<Args, Step, number> = {
	fields: [
		{ name: 'haystack', kind: 'string', from: ([h]) => h, placeholder: 'sadbutsad' },
		{ name: 'needle', kind: 'string', from: ([, n]) => n, placeholder: 'sad' }
	],
	toArgs({ haystack, needle }) {
		if (!lower(haystack) || !lower(needle)) throw new Error('haystack and needle need 1+ lowercase letters each.');
		return [haystack, needle];
	},

	trace([haystack, needle]) {
		const n = haystack.length, m = needle.length;
		const base = { haystack, needle, found: null };
		const out: Step[] = [{
			...base, start: 0, k: 0, lit: null, line: 1,
			msg: n < m
				? `needle (${m}) is longer than haystack (${n}), so no window fits.`
				: `A match must start somewhere in 0..${n - m}, the last start where needle still fits. Try each in turn.`
		}];
		for (let start = 0; start <= n - m; start++) {
			let k = 0;
			while (k < m && haystack[start + k] === needle[k]) {
				k++;
				out.push({
					...base, start, k, lit: start + k - 1, line: 5,
					msg: `haystack[${start + k - 1}] = '${haystack[start + k - 1]}' matches needle[${k - 1}]. ${k === m ? 'That was the last letter.' : 'Compare the next pair.'}`
				});
			}
			if (k === m) {
				out.push({ ...base, start, k, lit: null, found: start, done: true, line: 7, msg: `All ${m} letters match at start = ${start}. It is the first such start, so return ${start}.` });
				return out;
			}
			out.push({
				...base, start, k, lit: start + k, line: 4,
				msg: `haystack[${start + k}] = '${haystack[start + k]}' ≠ needle[${k}] = '${needle[k]}'. No match at start ${start}${k ? ` after ${k} matched` : ''}; slide one right.`
			});
		}
		out.push({
			...base, start: Math.max(0, n - m + 1), k: 0, lit: null, done: true, line: 8,
			msg: n < m ? 'No start to try. Return -1.' : `Every start from 0 to ${n - m} had a mismatch. Return -1.`
		});
		return out;
	},

	vars: (s) => [
		{ name: 'start', value: s.done && s.found === null ? '–' : s.start, note: 'where the window begins' },
		{ name: 'k', value: s.k, note: 'needle letters matched here' },
		{ name: 'start + k', value: s.done ? '–' : s.start + s.k, note: 'haystack letter to compare' },
		{ name: 'n', value: s.haystack.length, note: 'haystack length' },
		{ name: 'm', value: s.needle.length, note: 'needle length' }
	],

	result: (s) => s.found ?? -1
};
