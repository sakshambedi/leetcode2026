// 42. Trapping Rain Water: two pointers; the side with the lower max is settled by that max.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Hard',
	pattern: 'Two pointers · running max from each end',
	lede: 'Water over a bar is the lower of the two tallest walls around it, minus the bar; always move the lower side, because its max is already the limit.'
};

type Args = [height: number[]];
export type Step = BaseStep & {
	h: number[];
	/** Water settled over each column so far; 0 for columns not reached yet. */
	w: number[];
	l: number;
	r: number;
	lm: number;
	rm: number;
	water: number;
	/** Column just settled, and whether it held water or raised a max. */
	lit: number | null;
	part: 'bar' | 'fill';
	done?: boolean;
};

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 'height', kind: 'list', from: ([height]) => height, placeholder: '0, 1, 0, 2, 1, 0, 1, 3' }],
	toArgs({ height }) {
		if (height.length === 0) throw new Error('height needs at least one bar.');
		if (height.some((v: number) => v < 0)) throw new Error('Heights must be 0 or more.');
		return [height];
	},
	fits: ([height]) => height.length <= 14 && Math.max(...height) <= 8,

	trace([height]) {
		const h = [...height];
		const w = h.map(() => 0);
		let l = 0, r = h.length - 1, lm = 0, rm = 0, water = 0;
		const snap = (s: Partial<Step> & { msg: string; line: number }): Step =>
			({ h, w: [...w], l, r, lm, rm, water, lit: null, part: 'bar', ...s });
		const out: Step[] = [snap({
			line: 2,
			msg: r > 0
				? 'l and r start at the two ends, with no wall seen yet: left_max = right_max = 0.'
				: 'A single bar has no walls around it, so it holds nothing.'
		})];
		while (l < r) {
			if (h[l] < h[r]) {
				const i = l, grew = h[i] > lm;
				lm = Math.max(lm, h[i]);
				const add = lm - h[i];
				w[i] = add; water += add; l++;
				out.push(snap({
					lit: i, part: add > 0 ? 'fill' : 'bar', line: add > 0 ? 6 : 5,
					msg: grew
						? `height[l] = ${h[i]} < height[r] = ${h[r]}, so the left side moves. ${h[i]} is a new left_max: it becomes a wall and holds nothing.`
						: `height[l] = ${h[i]} < height[r] = ${h[r]}: a wall at least that tall waits on the right, so left_max = ${lm} sets the level. Column ${i} holds ${lm} − ${h[i]} = ${add}.`
				}));
			} else {
				const i = r, grew = h[i] > rm;
				rm = Math.max(rm, h[i]);
				const add = rm - h[i];
				w[i] = add; water += add; r--;
				out.push(snap({
					lit: i, part: add > 0 ? 'fill' : 'bar', line: add > 0 ? 10 : 9,
					msg: grew
						? `height[r] = ${h[i]} ≤ height[l] = ${h[l]}, so the right side moves. ${h[i]} is a new right_max: it becomes a wall and holds nothing.`
						: `height[r] = ${h[i]} ≤ height[l] = ${h[l]}: a wall at least that tall waits on the left, so right_max = ${rm} sets the level. Column ${i} holds ${rm} − ${h[i]} = ${add}.`
				}));
			}
		}
		out.push(snap({
			done: true, line: 12,
			msg: h.length > 1
				? `l and r met at column ${l}, the tallest bar, which holds nothing. Return water = ${water}.`
				: `Return water = ${water}.`
		}));
		return out;
	},

	vars: (s) => [
		{ name: 'l', value: s.l, note: 'next column from the left' },
		{ name: 'r', value: s.r, note: 'next column from the right' },
		{ name: 'height[l]', value: s.h[s.l], note: 'lower side moves next' },
		{ name: 'height[r]', value: s.h[s.r], note: 'lower side moves next' },
		{ name: 'left_max', value: s.lm, note: 'tallest wall seen from the left' },
		{ name: 'right_max', value: s.rm, note: 'tallest wall seen from the right' },
		{ name: 'water', value: s.water, note: 'units trapped so far' }
	],

	result: (s) => s.water
};
