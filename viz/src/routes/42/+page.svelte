<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import Bars from '#lib/components/figure/Bars.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0042_trapping_rain_water.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P } = TILE;
	const U = 22; // world height of one unit

	// Bars stand for heights; water settles on a column as a translucent block once a pointer passes it.
	// The pointer on the lower side moves next, so it is drawn strong.
	const next = (s: Step) => (s.done ? undefined : s.h[s.l] < s.h[s.r] ? 'l' : 'r');

	const code = `
l, r = 0, len(height) - 1
left_max = right_max = water = 0
while l < r:
    if height[l] < height[r]:
        left_max = max(left_max, height[l])
        water += left_max - height[l]
        l += 1
    else:
        right_max = max(right_max, height[r])
        water += right_max - height[r]
        r -= 1
return water`;
</script>

<ProblemPage number={42} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.h.length, 1) * P}
		{@const Z = Math.max(1, ...s.h) * U}
		<Figure label="height as columns of stacked blocks, with trapped water resting on them"
			bounds={[[-60, -10, Z + 6], [W + 10, -10, Z + 6], [-60, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<Bars values={s.h} fill={s.w} name="height" unit={U} lit={s.lit} litPart={s.part}
				pointers={s.done ? { 'l r': s.l } : { l: s.l, r: s.r }} strong={next(s)} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Water over column <code>i</code> is <code>min(tallest left, tallest right) − height[i]</code>. If
			<code>height[l] &lt; height[r]</code>, the right side already has a wall taller than anything that
			matters for <code>l</code>, so <b>left_max alone sets the level at l</b>.</dd>
		<dt>Invariant</dt>
		<dd>Every column outside <code>[l, r]</code> is settled: its water is final and counted. <code>left_max</code>
			and <code>right_max</code> are the tallest bars already passed on each side.</dd>
		<dt>Each step</dt>
		<dd>Move the side with the lower bar. Raise its max, add <code>max − height</code> to water, step inward.</dd>
		<dt>Stop when</dt>
		<dd><code>l == r</code>: they meet on a tallest bar, which holds nothing.</dd>
		<dt>Pitfall</dt>
		<dd>Update the max <b>before</b> subtracting, so a new wall adds 0 instead of going negative. Unlike Container
			With Most Water, the bars between the walls matter: water sits per column.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
