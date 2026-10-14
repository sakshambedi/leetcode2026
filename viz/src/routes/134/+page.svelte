<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0134_gas_station.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the cost row

	// Stations before start are ruled out as starts: they lie spent in both rows.
	// When no start works (total < 0), every station ends spent.
	const states = (s: Step): CellState[] =>
		s.gas.map((_, x) => (x < s.start || (s.done && s.total < 0) ? 'spent' : 'up'));

	const code = `
start = tank = total = 0
for i in range(len(gas)):
    tank += gas[i] - cost[i]
    total += gas[i] - cost[i]
    if tank < 0:
        start, tank = i + 1, 0
return start if total >= 0 else -1`;
</script>

<ProblemPage number={134} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.gas.length, 1) * P}
		<Figure label="gas and cost as rows of tiles, one column per station, with the candidate start and the station i"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={s.gas} states={states(s)} name="gas" lit={s.lit}
				pointers={{ start: s.done && s.total < 0 ? null : s.start, i: s.i }} strong="start" />
			<ArrayRow values={s.cost} states={states(s)} name="cost" y={ROW2} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>If you start at <code>start</code> and the tank first goes negative after station <code>i</code>, then
			<b>no station in start..i can be the start</b>: each of them is reached with tank ≥ 0, so starting there
			fresh only has less gas. Jump <code>start</code> to <code>i + 1</code>.</dd>
		<dt>Invariant</dt>
		<dd>Every station before <code>start</code> is ruled out (spent in the figure), and <code>tank</code> is the gas
			left driving from <code>start</code> up to <code>i</code>, never negative after a step.</dd>
		<dt>Each step</dt>
		<dd>Add <code>gas[i] − cost[i]</code> to both <code>tank</code> and <code>total</code>. If <code>tank &lt; 0</code>,
			reset: <code>start = i + 1</code>, <code>tank = 0</code>.</dd>
		<dt>Stop when</dt>
		<dd>The loop ends. If <code>total ≥ 0</code> return <code>start</code>; it reaches the end without running dry,
			and the surplus overall covers the stations before it. Otherwise return -1.</dd>
		<dt>Pitfall</dt>
		<dd>The reset alone is not enough: without the <code>total ≥ 0</code> check you return a start even when the loop
			is short of gas (Example 2). Don't simulate from every station either; that is O(n²).</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
