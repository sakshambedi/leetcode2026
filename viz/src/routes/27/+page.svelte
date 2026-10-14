<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0027_remove_element.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Kept prefix and unread suffix stand; the gap [k, i) lies flat as free space.
	// When done, the leftovers past k are spent.
	const states = (s: Step): CellState[] =>
		s.a.map((_, x) => (x < s.k || (!s.done && x >= s.i) ? 'up' : s.done ? 'spent' : 'free'));

	const code = `
k = 0
for i in range(len(nums)):
    if nums[i] != val:
        nums[k] = nums[i]
        k += 1
return k`;
</script>

<ProblemPage number={27} {meta} {problem} {cases} {code}>
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
		<dd>You don't delete anything. Keep a <b>write head <code>k</code></b> and copy every value that isn't
			<code>val</code> to it. <code>k</code> never passes <code>i</code>, so a write only lands on a slot
			that was already read.</dd>
		<dt>Invariant</dt>
		<dd><code>nums[0..k)</code> holds exactly the values ≠ <code>val</code> from <code>nums[0..i)</code>, in order.
			The gap <code>[k, i)</code> is free space: read already, safe to overwrite. The dashed outlines show it.</dd>
		<dt>Each step</dt>
		<dd>Read <code>nums[i]</code>. If it isn't <code>val</code>, write it to <code>nums[k]</code> and step
			<code>k</code>. Step <code>i</code> either way.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> reaches the end. Return <code>k</code>; the slots from <code>k</code> on are leftovers
			the judge ignores.</dd>
		<dt>Pitfall</dt>
		<dd>Return <code>k</code>, not the list. Don't <code>nums.remove()</code> inside a loop over <code>nums</code>:
			it shifts indices under you and costs O(n²).</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
