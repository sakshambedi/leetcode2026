<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow from '#lib/components/figure/ArrayRow.svelte';
	import Bars from '#lib/components/figure/Bars.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0135_candy.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the ratings row, in front of the candy columns
	const U = 16; // world height of one candy

	const code = `
n = len(ratings)
candies = [1] * n
for i in range(1, n):
    if ratings[i] > ratings[i - 1]:
        candies[i] = candies[i - 1] + 1
for i in range(n - 2, -1, -1):
    if ratings[i] > ratings[i + 1]:
        candies[i] = max(candies[i], candies[i + 1] + 1)
return sum(candies)`;
</script>

<ProblemPage number={135} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.r.length, 1) * P}
		{@const Z = s.top * U}
		<Figure label="candies as columns of stacked blocks behind a row of rating tiles"
			bounds={[[-70, -10, Z + 6], [W + 10, -10, Z + 6], [-70, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<Bars values={s.c} name="candies" unit={U} lit={s.lit} indices={false} />
			<ArrayRow values={s.r} name="ratings" y={ROW2} pointers={{ i: s.i }} strong="i" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>The two neighbor rules are independent. <b>Fix the left rule going right, then the right rule going left</b>,
			taking the max so the second pass never undoes the first.</dd>
		<dt>Invariant</dt>
		<dd>After pass 1, each child beats a lower-rated left neighbor. During pass 2, every child right of
			<code>i</code> satisfies both rules, with the fewest candies possible.</dd>
		<dt>Each step</dt>
		<dd>Pass 1: if <code>ratings[i] &gt; ratings[i - 1]</code>, <code>candies[i] = candies[i - 1] + 1</code>.
			Pass 2: if <code>ratings[i] &gt; ratings[i + 1]</code>, raise <code>candies[i]</code> to at least
			<code>candies[i + 1] + 1</code>.</dd>
		<dt>Stop when</dt>
		<dd>Pass 2 reaches child 0. Return the sum.</dd>
		<dt>Pitfall</dt>
		<dd>Equal ratings impose nothing: a child next to an equal one can drop back to 1. In pass 2, overwrite
			with <code>max</code>, not <code>candies[i + 1] + 1</code>, or a peak loses its left-slope count.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(n) extra space.</dd>
	{/snippet}
</ProblemPage>
