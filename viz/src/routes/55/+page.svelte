<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0055_jump_game.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Cells whose jump is used are spent; reachable cells not yet read stand;
	// cells past reach lie flat as dashed slots until some jump can land there.
	const states = (s: Step): CellState[] =>
		s.a.map((_, x) => (x < s.i || (x === s.i && s.used) ? 'spent' : x <= s.reach ? 'up' : 'free'));

	const code = `
reach = 0
for i in range(len(nums)):
    if i > reach:
        return False
    reach = max(reach, i + nums[i])
    if reach >= len(nums) - 1:
        return True`;
</script>

<ProblemPage number={55} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="nums as a row of tiles; reachable cells stand, cells past reach lie flat"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="nums" lit={s.lit}
				pointers={{ i: s.i, reach: Math.min(s.reach, s.a.length - 1) }} strong="reach" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>You never need to pick a path. Every index up to the <b>farthest reach so far</b> is reachable, so one
			number, <code>reach</code>, says everything about where you can be.</dd>
		<dt>Invariant</dt>
		<dd>Before reading <code>i</code>, every index in <code>[0, reach]</code> is reachable and none past it is.
			Standing tiles are reachable and unread; dotted ones are read; dashed ones are past reach.</dd>
		<dt>Each step</dt>
		<dd>If <code>i &gt; reach</code>, you are stuck. Otherwise stretch
			<code>reach = max(reach, i + nums[i])</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>reach &gt;= n - 1</code> (true), or <code>i</code> passes <code>reach</code> (false): no standing
			tile is left to read.</dd>
		<dt>Pitfall</dt>
		<dd>A zero only traps you if nothing before it jumps over it, so check <code>i &gt; reach</code> rather than
			<code>nums[i] == 0</code>. For the <b>fewest</b> jumps, see Jump Game II (45), which counts BFS levels of the same reach.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
