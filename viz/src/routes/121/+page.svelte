<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0121_best_time_to_buy_and_sell_stock.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// The cheapest day so far and the unread days stand; days already read that are not the
	// cheapest can never be the buy again, so they lie spent. At the end only the best trade stands.
	const states = (s: Step): CellState[] =>
		s.a.map((_, x) => {
			if (s.done) return (s.trade ? s.trade.includes(x) : x === s.buy) ? 'up' : 'spent';
			return x === s.buy || x >= (s.i ?? 0) ? 'up' : 'spent';
		});
	const pointers = (s: Step) =>
		s.done ? (s.trade ? { buy: s.trade[0], sell: s.trade[1] } : { buy: s.buy }) : { buy: s.buy, i: s.i };

	const code = `
buy, best = 0, 0
for i in range(1, len(prices)):
    if prices[i] < prices[buy]:
        buy = i
    else:
        best = max(best, prices[i] - prices[buy])
return best`;
</script>

<ProblemPage number={121} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="prices as a row of tiles with the cheapest day so far, buy, and the day being read, i"
			bounds={[[-60, -10, H + 6], [W + 10, -10, H + 6], [-60, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="prices" lit={s.lit} pointers={pointers(s)} strong="buy" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Fix the sell day <code>i</code>: the best buy is simply the <b>cheapest day before it</b>. So one pass
			that remembers the lowest price so far tries every sell day against its best buy.</dd>
		<dt>Invariant</dt>
		<dd><code>buy</code> is the cheapest day in <code>prices[0..i)</code>, and <code>best</code> is the top profit of
			any trade that sells before <code>i</code>. Read days that are not <code>buy</code> lie spent: they can
			never be the buy again.</dd>
		<dt>Each step</dt>
		<dd>If <code>prices[i]</code> is a new low, move <code>buy</code> to <code>i</code>. Otherwise try selling:
			<code>best = max(best, prices[i] − prices[buy])</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> passes the last day. Return <code>best</code>, which stays 0 if prices only fall.</dd>
		<dt>Pitfall</dt>
		<dd>Don't pair the global min with the global max: the max may come <b>before</b> the min. A new low only
			helps later days; earlier profits stay in <code>best</code>. Stock II allows many trades and sums every rise instead.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
