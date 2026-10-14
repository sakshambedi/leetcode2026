<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0088_merge_sorted_array.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the nums2 row

	// nums1: unread values and filled slots stand; slots between i and k are free space.
	const states1 = (s: Step): CellState[] => s.a.map((_, x) => (s.done || x <= s.i || x > s.k ? 'up' : 'free'));
	// nums2: unread values stand; moved ones are spent.
	const states2 = (s: Step): CellState[] => s.b.map((_, x) => (x <= s.j ? 'up' : 'spent'));

	const code = `
i, j, k = m - 1, n - 1, m + n - 1
while j >= 0:
    if i >= 0 and nums1[i] > nums2[j]:
        nums1[k] = nums1[i]; i -= 1
    else:
        nums1[k] = nums2[j]; j -= 1
    k -= 1`;
</script>

<ProblemPage number={88} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="nums1 and nums2 as rows of tiles"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={s.a} states={states1(s)} name="nums1" lit={s.wrote}
				pointers={{ i: s.i, k: s.done ? null : s.k }} strong="k" />
			<ArrayRow values={s.b} states={states2(s)} name="nums2" y={ROW2} pointers={{ j: s.j }} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>The tail of nums1 is empty space. Write the <b>largest remaining value into the last
			free slot</b>. Writing from the back never overwrites a nums1 value you have not read.</dd>
		<dt>Invariant</dt>
		<dd>The free slots between <code>i</code> and <code>k</code> always number <code>j + 1</code>, exactly
			enough room for what is left of nums2. The dashed outlines in the figure show them.</dd>
		<dt>Each step</dt>
		<dd>Compare <code>nums1[i]</code> with <code>nums2[j]</code>. Move the bigger one to <code>k</code>, then step
			that pointer and <code>k</code> left.</dd>
		<dt>Stop when</dt>
		<dd><code>j &lt; 0</code>. Whatever is left of nums1 is already sorted and in place.</dd>
		<dt>Pitfall</dt>
		<dd>Check <code>i &gt;= 0</code> before reading <code>nums1[i]</code>. If nums1 runs out first, copy the rest of nums2.</dd>
		<dt>Cost</dt>
		<dd>O(m + n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
