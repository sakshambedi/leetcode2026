<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0274_h_index.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Every paper stands while it may still count; at the end the ones past rank h are spent.
	const states = (s: Step): CellState[] => s.a.map((_, x) => (s.done && x >= s.h ? 'spent' : 'up'));
	// After sorting, the label under rank r is its demand: at least r citations.
	const demands = (s: Step) => (s.sorted ? s.a.map((_, x) => `≥${x + 1}`) : true);

	const code = `
citations.sort(reverse=True)
h = 0
while h < len(citations) and citations[h] > h:
    h += 1
return h`;
</script>

<ProblemPage number={274} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="citations as a row of tiles, sorted high to low, each labelled with the citations its rank needs"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="citations" lit={s.lit}
				indices={demands(s)} pointers={{ h: s.sorted ? s.h : null }} strong="h" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Sorted most-cited first, the top <code>h</code> papers are the best candidates. h works exactly when the
			<b><code>h</code>-th paper has at least <code>h</code> citations</b>; everyone above it has more.</dd>
		<dt>Invariant</dt>
		<dd>The top <code>h</code> papers each have at least <code>h</code> citations. The label under each tile is
			what its rank needs: <code>≥ r</code>.</dd>
		<dt>Each step</dt>
		<dd>If <code>citations[h] &gt; h</code> (that is, ≥ <code>h + 1</code>), the next paper qualifies: <code>h += 1</code>.</dd>
		<dt>Stop when</dt>
		<dd>A paper falls short of its rank, or <code>h == n</code>. Later papers have fewer citations and higher ranks,
			so none can help.</dd>
		<dt>Pitfall</dt>
		<dd>Off by one: index <code>h</code> is rank <code>h + 1</code>, so compare <code>citations[h] &gt; h</code>.
			h is capped by <code>n</code>, not by the largest count. For O(n), bucket counts into
			<code>0..n</code> (clamping bigger counts to <code>n</code>) and sum from the top until the total reaches the bucket index.</dd>
		<dt>Cost</dt>
		<dd>O(n log n) time for the sort, O(1) extra space (or O(n) with the bucket count).</dd>
	{/snippet}
</ProblemPage>
