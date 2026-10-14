<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0080_remove_duplicates_from_sorted_array_ii.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Kept prefix and unread suffix stand; the gap [k, i) lies flat as free space.
	// When done, the leftovers past k are spent.
	const states = (s: Step): CellState[] =>
		s.a.map((_, x) => (x < s.k || (!s.done && x >= s.i) ? 'up' : s.done ? 'spent' : 'free'));

	const code = `
k = min(2, len(nums))
for i in range(2, len(nums)):
    if nums[i] != nums[k - 2]:
        nums[k] = nums[i]
        k += 1
return k`;
</script>

<ProblemPage number={80} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = (s.a.length + 1) * P}
		<Figure label="nums as a row of tiles with read pointer i, write pointer k, and the comparison slot k − 2"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="nums" lit={s.wrote}
				pointers={{ 'k−2': s.done || s.k < 2 ? null : s.k - 2, i: s.done ? null : s.i, k: s.k }} strong="k" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Sorted means copies of a value sit together. A value may be kept <b>unless the kept value two back already
			equals it</b>: if <code>nums[k - 2] == nums[i]</code>, then <code>nums[k - 2]</code> and <code>nums[k - 1]</code>
			are both that value, so a third copy would be too many.</dd>
		<dt>Invariant</dt>
		<dd><code>nums[0..k)</code> holds <code>nums[0..i)</code> with each value at most twice, in order.
			The gap <code>[k, i)</code> is free space: read already, safe to overwrite. The dashed outlines show it.</dd>
		<dt>Each step</dt>
		<dd>Compare <code>nums[i]</code> with <code>nums[k - 2]</code>. If different, write it to <code>nums[k]</code>
			and step <code>k</code>. Step <code>i</code> either way.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> reaches the end. Return <code>k</code>; the slots from <code>k</code> on are leftovers the
			judge ignores.</dd>
		<dt>Pitfall</dt>
		<dd>Compare with <code>nums[k - 2]</code>, the <b>kept</b> array, not <code>nums[i - 2]</code>: the read side
			may already be overwritten. Remove Duplicates I (26) is the same loop with <code>k - 1</code> and a start of 1;
			"at most m copies" generalises to <code>k - m</code> and a start of m.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
