<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0189_rotate_array.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	const code = `
k %= len(nums)
for l, r in [(0, n - 1), (0, k - 1), (k, n - 1)]:
    while l < r:
        nums[l], nums[r] = nums[r], nums[l]
        l, r = l + 1, r - 1`;
</script>

<ProblemPage number={189} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="nums as a row of tiles with the two ends l and r of the current reversal, and the split point k"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} name="nums" lit={s.lit}
				pointers={{ k: s.k > 0 ? s.k : null, l: s.l, r: s.r }} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Rotating right by k is "last k values, then the first n − k". <b>Reversing the whole array</b> puts the two
			parts in that order but each one backwards; <b>reverse each part again</b> to fix them.</dd>
		<dt>Invariant</dt>
		<dd>During a reversal, everything outside <code>[l, r]</code> in that part is already swapped into place;
			<code>[l, r]</code> is still in its old order.</dd>
		<dt>Each step</dt>
		<dd>Swap <code>nums[l]</code> and <code>nums[r]</code>, then step both inward. Three passes: <code>[0, n−1]</code>,
			<code>[0, k−1]</code>, <code>[k, n−1]</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>l &gt;= r</code> in the third pass. Nothing is returned: nums itself is the answer.</dd>
		<dt>Pitfall</dt>
		<dd>Take <code>k %= n</code> first: k may be larger than n, and <code>[0, k−1]</code> would run off the end.
			Python's <code>nums[:] = nums[-k:] + nums[:-k]</code> also works but uses O(n) extra space, and
			<code>nums = ...</code> without <code>[:]</code> rebinds the name instead of changing the list.</dd>
		<dt>Cost</dt>
		<dd>O(n) time (each value is swapped twice), O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
