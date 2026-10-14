<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0026_remove_duplicates_from_sorted_array.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Kept prefix and unread suffix stand; the gap [k, i) lies flat as free space.
	// When done, the leftovers past k are spent.
	const states = (s: Step): CellState[] =>
		s.a.map((_, x) => (x < s.k || (!s.done && x >= s.i) ? 'up' : s.done ? 'spent' : 'free'));

	const code = `
k = 1
for i in range(1, len(nums)):
    if nums[i] != nums[k - 1]:
        nums[k] = nums[i]
        k += 1
return k`;
</script>

<ProblemPage number={26} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = (s.a.length + 1) * P}
		<Figure label="nums as a row of tiles with read pointer i and write pointer k"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="nums" lit={s.wrote}
				pointers={{ i: s.done ? null : s.i, k: s.k }} strong="k" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>The array is sorted, so duplicates sit next to each other. A value is <b>new exactly when it differs from
			the last value kept</b>, <code>nums[k - 1]</code>. Copy new values to the write head <code>k</code>.</dd>
		<dt>Invariant</dt>
		<dd><code>nums[0..k)</code> holds each distinct value of <code>nums[0..i)</code> once, in order.
			The gap <code>[k, i)</code> is free space: read already, safe to overwrite. The dashed outlines show it.</dd>
		<dt>Each step</dt>
		<dd>Compare <code>nums[i]</code> with <code>nums[k - 1]</code>. If different, write it to <code>nums[k]</code>
			and step <code>k</code>. Step <code>i</code> either way.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> reaches the end. Return <code>k</code>; the slots from <code>k</code> on are leftovers the
			judge ignores.</dd>
		<dt>Pitfall</dt>
		<dd>Start <code>k</code> at 1: the first value is always kept. Unlike Remove Element, the judge checks the
			<b>order</b> of the first <code>k</code> values, so never swap values in from the back.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
