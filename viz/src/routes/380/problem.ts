// 380. Insert Delete GetRandom O(1): values packed in an array + a map value -> slot; remove swaps the last value into the hole.
import type { BaseStep, Meta, Problem } from '#lib/types.ts';

export const meta: Meta = {
	lede: 'Keep the values packed in an array for a uniform random pick, a map from value to slot for O(1) lookup, and remove by moving the last value into the hole.'
};

type Out = boolean | number | null;
/** expected: null for the constructor, a bool for insert/remove, every valid value (sorted) for getRandom. */
type Expected = (boolean | number[] | null)[];
type Args = [operations: string[], values: number[][]];
export type Step = BaseStep & {
	nums: number[];
	pos: [number, number][];
	call: string;
	val: number | null;
	out: Out[];
	/** The one part that just changed: a slot of nums. */
	lit: number | null;
	/** pos keys whose slot was just looked up or rewritten. */
	looked: number[];
	idx: number | null;
	last: number | null;
	ret: string;
	pointers: Record<string, number | null>;
	/** Most values nums ever holds in this run; the row keeps that many slots. */
	cap: number;
	done?: boolean;
};

const INT_MIN = -(2 ** 31), INT_MAX = 2 ** 31 - 1;

// Small seeded PRNG (mulberry32) so a replay picks the same "random" slots every time.
function rng(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const show = (v: Out) => (v === null ? 'null' : String(v));

export const problem: Problem<Args, Step, Out[]> = {
	fields: [{
		name: 'calls', kind: 'strings', placeholder: 'insert 1, remove 2, insert 2, getRandom',
		from: ([ops, vals]) => ops.flatMap((op, i) =>
			op === 'RandomizedSet' ? [] : op === 'getRandom' ? ['getRandom'] : [`${op} ${vals[i][0]}`])
	}],
	toArgs({ calls }) {
		const ops = ['RandomizedSet'], vals: number[][] = [[]];
		const set = new Set<number>();
		for (const call of calls as string[]) {
			const m = call.trim().match(/^(insert|remove)\s+(-?\d+)$|^(getRandom)(\(\))?$/);
			if (!m) throw new Error(`"${call}" is not a call: use insert N, remove N or getRandom.`);
			if (m[3]) {
				if (set.size === 0) throw new Error('getRandom needs at least one value in the set.');
				ops.push('getRandom'); vals.push([]);
				continue;
			}
			const v = Number(m[2]);
			if (v < INT_MIN || v > INT_MAX) throw new Error(`${v} is outside the 32-bit int range.`);
			if (m[1] === 'insert') set.add(v); else set.delete(v);
			ops.push(m[1]); vals.push([v]);
		}
		if (ops.length < 2) throw new Error('Enter at least one call.');
		if (ops.length > 31) throw new Error('Keep it to 30 calls or fewer.');
		return [ops, vals];
	},
	// Draw up to 14 calls with small values; bigger runs stay in the tests.
	fits: ([ops, vals]) => ops.length <= 15 && vals.flat().every((v) => Math.abs(v) < 1000),

	trace([ops, vals]) {
		const rand = rng(380);
		const nums: number[] = [];
		const pos = new Map<number, number>();
		const out: Out[] = [];
		const steps: Omit<Step, 'cap'>[] = [];
		let current: number | null = null; // argument of the call being run
		const snap = (s: Partial<Step> & { call: string; msg: string }) =>
			steps.push({
				nums: [...nums], pos: [...pos], out: [...out], lit: null, looked: [], idx: null, last: null,
				val: current, ret: '–', pointers: {}, ...s
			});

		ops.forEach((op, t) => {
			const val = vals[t]?.[0];
			current = val ?? null;
			if (op === 'RandomizedSet') {
				out.push(null);
				snap({ call: 'RandomizedSet()', ret: 'null',
					msg: 'RandomizedSet(): nums keeps the values packed side by side; pos maps each value to its slot in nums. Both start empty.' });
			} else if (op === 'insert') {
				const call = `insert ${val}`;
				if (pos.has(val)) {
					out.push(false);
					snap({ call, ret: 'false', idx: pos.get(val)!, looked: [val], line: 2,
						msg: `pos already has ${val} (slot ${pos.get(val)}), so it is in the set: insert returns false and nothing changes.` });
				} else {
					pos.set(val, nums.length);
					nums.push(val);
					out.push(true);
					snap({ call, ret: 'true', idx: nums.length - 1, lit: nums.length - 1, looked: [val], line: 3,
						pointers: { idx: nums.length - 1 },
						msg: `${val} is new: append it at the end of nums, slot ${nums.length - 1}, and record pos[${val}] = ${nums.length - 1}. Returns true.` });
				}
			} else if (op === 'remove') {
				const call = `remove ${val}`;
				if (!pos.has(val)) {
					out.push(false);
					snap({ call, ret: 'false', line: 7,
						msg: `pos has no ${val}, so it is not in the set: remove returns false and nothing changes.` });
					return;
				}
				const idx = pos.get(val)!, end = nums.length - 1, last = nums[end];
				if (idx !== end) {
					nums[idx] = last;
					pos.set(last, idx);
					snap({ call, idx, last, lit: idx, looked: [val, last], line: 9, pointers: { idx, end },
						msg: `pos[${val}] = ${idx}. Fill that hole with the last value: nums[${idx}] = ${last}, and pos[${last}] = ${idx}. Slot ${end} is now a spare copy.` });
				}
				nums.pop();
				pos.delete(val);
				out.push(true);
				snap({ call, idx, last, ret: 'true', line: 10, pointers: idx !== end ? { idx } : {},
					msg: idx !== end
						? `Pop the spare copy off the end and delete pos[${val}]. Nothing shifted, so remove is O(1). Returns true.`
						: `${val} is already the last value (slot ${idx}), so there is no hole to fill: pop it and delete pos[${val}]. Returns true.` });
			} else {
				const r = Math.floor(rand() * nums.length);
				out.push(nums[r]);
				snap({ call: 'getRandom()', idx: r, ret: String(nums[r]), lit: r, line: 14, pointers: { r },
					msg: `Pick a random slot from 0 to ${nums.length - 1} (seeded here, so replays repeat): slot ${r} holds ${nums[r]}. Packed slots make every value equally likely.` });
			}
		});
		const last = steps.at(-1)!;
		steps.push({ ...last, lit: null, looked: [], pointers: {}, idx: null, last: null, val: null, ret: '–', call: '–', done: true,
			line: undefined, msg: `All ${ops.length} calls ran. The output is [${out.map(show).join(', ')}].` });
		const cap = Math.max(0, ...steps.map((s) => s.nums.length));
		return steps.map((s) => ({ ...s, cap }));
	},

	vars: (s) => [
		{ name: 'call', value: s.call, note: 'the call being run' },
		{ name: 'val', value: s.val ?? '–', note: 'its argument' },
		{ name: 'idx', value: s.idx ?? '–', note: s.call.startsWith('get') ? 'random slot' : 'pos[val], slot of val' },
		{ name: 'last', value: s.last ?? '–', note: 'nums[-1], fills the hole' },
		{ name: 'len(nums)', value: s.nums.length, note: 'values in the set' },
		{ name: 'return', value: s.ret, note: "this call's output" }
	],

	result: (s) => s.out,
	// Mirrors Solution.check: a getRandom entry lists every value that was in the set.
	check: (result, expected) => {
		const exp = expected as unknown as Expected;
		return result.length === exp.length && result.every((r, i) => {
			const e = exp[i];
			return Array.isArray(e) ? typeof r === 'number' && e.includes(r) : r === e;
		});
	}
};
