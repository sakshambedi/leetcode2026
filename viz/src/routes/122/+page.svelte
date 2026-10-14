<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0122_best_time_to_buy_and_sell_stock_ii.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the rise row

	// The rise row sits half a column right, each slot between the two days it compares.
	// Unread rises are free space; a positive rise stands (collected), a flat or falling one is spent.
	const riseStates = (s: Step): CellState[] =>
		s.rise.map((d, x) => (s.i != null && x < s.i) || s.done ? (d > 0 ? 'up' : 'spent') : 'free');

	const code = `
profit = 0
for i in range(1, len(prices)):
    if prices[i] > prices[i - 1]:
        profit += prices[i] - prices[i - 1]
return profit`;
</script>

<ProblemPage number={122} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="prices as a row of tiles, and below it the rise between each pair of days; collected rises stand"
			bounds={[[-60, -10, H + 6], [W + 10, -10, H + 6], [-60, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={s.a} name="prices" pointers={{ i: s.i }} strong="i" />
			<ArrayRow values={s.rise} states={riseStates(s)} name="rise" y={ROW2} offset={0.5} indices={false}
				lit={s.lit} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>A climb from day a to day b earns <code>prices[b] − prices[a]</code>, which is exactly the <b>sum of its daily
			rises</b>. So with unlimited trades, take every positive day-to-day rise and nothing else.</dd>
		<dt>Invariant</dt>
		<dd><code>profit</code> is the sum of the positive rises among days <code>0..i</code>, the best total for
			trading on those days. Standing tiles in the rise row are exactly what was added.</dd>
		<dt>Each step</dt>
		<dd>Compare <code>prices[i]</code> with <code>prices[i - 1]</code>. If it went up, add the difference; if flat
			or down, skip it.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> passes the last day. Return <code>profit</code>.</dd>
		<dt>Pitfall</dt>
		<dd>No need to find valleys and peaks or track holdings: the daily sum equals peak − valley. Contrast Stock I
			(one trade only), which keeps the cheapest day so far and the single best gap.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
