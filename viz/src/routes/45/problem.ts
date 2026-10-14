// 45. Jump Game II: BFS by levels with no queue. Scan the window reachable in `jumps` jumps,
// tracking `far`; when i reaches `end`, take one more jump and the next window ends at far.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Greedy · BFS by levels',
	lede: 'Cells reachable in k jumps form one window; scan it for the farthest next landing, and each time i hits the window’s end, count a jump and move end to far.'
};

type Args = [nums: number[]];
export type Step = BaseStep & {
	a: number[];
	/** The cell just scanned; -1 before the loop. */
	i: number;
	end: number;
	far: number;
	jumps: number;
	lit: number | null;
	done?: boolean;
};

const reachable = (xs: number[]) => {
	let reach = 0;
	for (let i = 0; i < xs.length && i <= reach; i++) reach = Math.max(reach, i + xs[i]);
	return reach >= xs.length - 1;
};

export const problem: Problem<Args, Step, number> = {
	fields: [{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '2, 3, 1, 1, 4' }],
	toArgs({ nums }) {
		if (nums.length === 0) throw new Error('nums needs at least one value.');
		if (nums.some((v: number) => v < 0)) throw new Error('Jump lengths must be 0 or more.');
		if (!reachable(nums)) throw new Error('The last index must be reachable; the problem guarantees it.');
		return [nums];
	},
	// Jump lengths up to 1000 still fit on a tile.
	fits: ([nums]) => nums.length <= 12 && nums.every((v) => v <= 1000),

	trace([nums]) {
		const a = [...nums], last = a.length - 1;
		let jumps = 0, end = 0, far = 0;
		const out: Step[] = [{
			a, i: -1, end, far, jumps, lit: null, line: 1,
			msg: last === 0
				? 'You start on the last index, so no jump is needed.'
				: 'With 0 jumps only index 0 is reachable: that window ends at end = 0. Cells past far lie flat until some jump can land there.'
		}];
		for (let i = 0; i < last; i++) {
			const to = i + a[i], before = far;
			far = Math.max(far, to);
			out.push({
				a, i, end, far, jumps, line: 3,
				lit: far > before ? Math.min(far, last) : null,
				msg: far > before
					? `From ${i}, one more jump lands as far as ${to}, past ${before}, so far = ${far}.`
					: `From ${i}, one more jump lands at most at ${to} ≤ ${far}, so far stays ${far}.`
			});
			if (i === end) {
				jumps++;
				end = far;
				out.push({
					a, i, end, far, jumps, line: 5, lit: Math.min(end, last),
					msg: `i hit end: every cell reachable in ${jumps - 1} jump${jumps - 1 === 1 ? '' : 's'} is scanned. Take jump ${jumps}; it can land anywhere up to ${far}, the new end.`
				});
			}
		}
		if (last > 0) {
			out.push({
				...out.at(-1)!, lit: null, done: true, line: 7,
				msg: `end = ${end} covers the last index ${last}, so ${jumps} jump${jumps === 1 ? '' : 's'} suffice${jumps === 1 ? 's' : ''}; no window before it got there. Return ${jumps}.`
			});
		} else out[0].done = true;
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i < 0 ? '–' : s.i, note: 'cell being scanned' },
		{ name: 'nums[i]', value: s.i < 0 ? '–' : s.a[s.i], note: 'longest jump from i' },
		{ name: 'i + nums[i]', value: s.i < 0 ? '–' : s.i + s.a[s.i], note: 'farthest landing from i' },
		{ name: 'far', value: s.far, note: 'farthest next landing' },
		{ name: 'end', value: s.end, note: `edge of ${s.jumps}-jump window` },
		{ name: 'jumps', value: s.jumps, note: 'jumps taken so far' }
	],

	result: (s) => s.jumps
};
