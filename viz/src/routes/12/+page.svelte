<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0012_integer_to_roman.json';
	import { meta, problem, PAIRS, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the out row

	const symbols = PAIRS.map(([, s]) => s);
	const values = PAIRS.map(([v]) => v);
	const valueOf = Object.fromEntries(PAIRS.map(([v, s]) => [s, v]));
	// Pairs passed over are spent: too big for what is left of num, they never come back.
	const states = (s: Step): CellState[] => PAIRS.map((_, x) => (x < s.k ? 'spent' : 'up'));

	const code = `
out = []
for value, symbol in PAIRS:
    while num >= value:
        out.append(symbol)
        num -= value
return "".join(out)`;
</script>

<ProblemPage number={12} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(PAIRS.length, s.out.length) * P}
		<Figure label="the 13 value/symbol pairs as a row of tiles above the out row of appended symbols"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={symbols} states={states(s)} name="PAIRS" indices={values}
				lit={s.lit?.row === 'pairs' ? s.lit.at : null} pointers={{ k: s.done ? null : s.k }} strong="k" />
			<!-- out grows each append; ArrayRow tweens a fixed-length row, so give each length its own row. -->
			{#key s.out.length}
				<ArrayRow values={s.out} name="out" y={ROW2} indices={s.out.map((x) => valueOf[x])}
					lit={s.lit?.row === 'out' ? s.lit.at : null} />
			{/key}
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>The subtractive forms are just <b>more symbols</b>. With CM, CD, XC, XL, IX and IV in the table beside
			M, D, C, L, X, V and I, the plain greedy "biggest that fits" is always right.</dd>
		<dt>Invariant</dt>
		<dd><code>out</code> spells <code>original − num</code>, and every pair left of <code>k</code> is bigger
			than <code>num</code> (the dotted ones), so it can never be used again.</dd>
		<dt>Each step</dt>
		<dd>While <code>num &gt;= value</code>, append <code>symbol</code> and subtract <code>value</code>.
			Otherwise move to the next smaller pair.</dd>
		<dt>Stop when</dt>
		<dd><code>num</code> reaches 0. I = 1 is the last pair, so it always gets there.</dd>
		<dt>Pitfall</dt>
		<dd>Without the six subtractive pairs you get IIII and VIIII. Keep the table sorted largest first.
			Roman to Integer (13) is the reverse: one scan, subtract a symbol smaller than the next.</dd>
		<dt>Cost</dt>
		<dd>O(1): 13 pairs and at most 15 symbols, since num ≤ 3999.</dd>
	{/snippet}
</ProblemPage>
