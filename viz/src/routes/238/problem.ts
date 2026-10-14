// 238. Product of Array Except Self: prefix products going right, then a running suffix going left.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	difficulty: 'Medium',
	pattern: 'Prefix and suffix products · two passes',
	lede: 'answer[i] is everything to the left times everything to the right: write the left products going right, then multiply in a running right product coming back.'
};

type Args = [nums: number[]];
export type Step = BaseStep & {
	a: number[];
	/** null where answer has not been written yet. */
	ans: (number | null)[];
	i: number | null;
	pass: 1 | 2;
	prefix: number;
	suffix: number;
	lit: number | null;
	done?: boolean;
};

// JS multiplies 0 by a negative into -0; keep answers plain.
const mul = (x: number, y: number) => x * y + 0;

export const problem: Problem<Args, Step, number[]> = {
	fields: [{ name: 'nums', kind: 'list', from: ([nums]) => nums, placeholder: '1, 2, 3, 4' }],
	toArgs({ nums }) {
		if (nums.length < 2) throw new Error('nums needs at least two values.');
		if (nums.some((v: number) => v < -30 || v > 30)) throw new Error('Values must be between -30 and 30.');
		return [nums];
	},
	// Draw only when every value written into answer fits on a tile.
	fits([nums]) {
		if (nums.length > 10) return false;
		let p = 1;
		const left = nums.map((v) => { const x = p; p *= v; return x; });
		let s = 1;
		for (let i = nums.length - 1; i >= 0; i--) {
			if (Math.abs(left[i] * s) >= 1000 || Math.abs(left[i]) >= 1000) return false;
			s *= nums[i];
		}
		return true;
	},

	trace([nums]) {
		const a = [...nums], n = a.length;
		const ans: (number | null)[] = a.map(() => null);
		let prefix = 1, suffix = 1;
		const snap = (s: Partial<Step> & { msg: string; line: number }): Step =>
			({ a, ans: [...ans], i: null, pass: 1, prefix, suffix, lit: null, ...s });
		const out: Step[] = [snap({
			line: 2,
			msg: 'No division allowed. First pass: walk right, writing into each slot the product of everything to its left, carried in prefix.'
		})];
		for (let i = 0; i < n; i++) {
			const p = prefix;
			ans[i] = p;
			prefix = mul(prefix, a[i]);
			out.push(snap({
				i, lit: i, line: 4,
				msg: (i === 0
					? 'Nothing lies left of slot 0, so answer[0] = prefix = 1.'
					: `answer[${i}] = prefix = ${p}, the product of nums[0..${i - 1}].`) +
					` prefix takes in nums[${i}] = ${a[i]} and becomes ${prefix}.`
			}));
		}
		out.push(snap({
			pass: 2, line: 6,
			msg: 'Every slot holds its left product. Second pass: walk back from the right, multiplying in suffix, the product of everything to the right.'
		}));
		for (let i = n - 1; i >= 0; i--) {
			const before = ans[i]!, s = suffix;
			ans[i] = mul(before, s);
			suffix = mul(suffix, a[i]);
			out.push(snap({
				i, pass: 2, lit: i, line: 8,
				msg: (i === n - 1
					? `Nothing lies right of slot ${i}, so suffix = 1 and answer[${i}] stays ${ans[i]}.`
					: `answer[${i}] = left ${before} × right ${s} = ${ans[i]}.`) +
					` suffix takes in nums[${i}] = ${a[i]} and becomes ${suffix}.`
			}));
		}
		out.push(snap({
			pass: 2, done: true, line: 10,
			msg: `Each slot is its left product times its right product, nums[i] itself left out. Return [${ans.join(', ')}].`
		}));
		return out;
	},

	vars: (s) => [
		{ name: 'i', value: s.i ?? '–', note: s.pass === 1 ? 'walking right' : 'walking left' },
		{ name: 'nums[i]', value: s.i === null ? '–' : s.a[s.i], note: 'just folded in' },
		{ name: 'answer[i]', value: s.i === null ? '–' : (s.ans[s.i] ?? '–'), note: s.pass === 1 ? 'left product' : 'left × right product' },
		{ name: 'prefix', value: s.prefix, note: 'product of the flat nums, pass 1' },
		{ name: 'suffix', value: s.suffix, note: 'product of the flat nums, pass 2' }
	],

	result: (s) => s.ans.map((v) => v ?? 1)
};
