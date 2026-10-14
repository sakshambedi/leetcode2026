<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import HashMap from '#lib/components/figure/HashMap.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0380_insert_delete_getrandom_o_1.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the pos row

	// nums keeps `cap` slots for the whole run: live values stand, slots past the end lie flat as free space.
	const values = (s: Step) => Array.from({ length: s.cap }, (_, x) => (x < s.nums.length ? s.nums[x] : ''));
	const states = (s: Step): CellState[] => Array.from({ length: s.cap }, (_, x) => (x < s.nums.length ? 'up' : 'free'));

	const code = `
def insert(val):
    if val in pos: return False
    pos[val] = len(nums); nums.append(val)
    return True

def remove(val):
    if val not in pos: return False
    idx, last = pos[val], nums[-1]
    nums[idx] = last; pos[last] = idx
    nums.pop(); del pos[val]
    return True

def getRandom():
    return nums[randrange(len(nums))]`;
</script>

<ProblemPage number={380} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.cap, 1) * P}
		<Figure label="nums as a row of tiles, and pos as a row of key tiles with the slot each one maps to"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={values(s)} states={states(s)} name="nums" lit={s.lit} pointers={s.pointers} strong="idx" />
			<HashMap entries={s.pos} name="pos" y={ROW2} strong={s.looked} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>An array gives a <b>uniform random pick</b> only while it has no holes; a hash map gives O(1) lookup but
			no random access. Use both: <code>nums</code> holds the values, <code>pos[v]</code> is the slot of <code>v</code>.</dd>
		<dt>Invariant</dt>
		<dd><code>nums</code> is packed (no gaps), and <code>nums[pos[v]] == v</code> for every value. The number under
			each pos tile is the slot of that value in nums.</dd>
		<dt>Each step</dt>
		<dd>Insert appends and records the slot. Remove looks up <code>idx = pos[val]</code>, moves the last value into
			<code>idx</code>, updates its <code>pos</code>, then pops the end and deletes <code>pos[val]</code>.</dd>
		<dt>Stop when</dt>
		<dd>Each call is O(1) on its own; there is no loop. getRandom returns <code>nums[r]</code> for a random
			<code>r</code> in <code>[0, len)</code>.</dd>
		<dt>Pitfall</dt>
		<dd>Update <code>pos[last]</code> before deleting <code>pos[val]</code>: when <code>val</code> is itself the last
			value, the other order brings it back. Never <code>list.remove(val)</code>; it shifts everything, O(n).</dd>
		<dt>Cost</dt>
		<dd>O(1) average per call, O(n) space for n values.</dd>
	{/snippet}
</ProblemPage>
