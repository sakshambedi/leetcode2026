<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0045_jump_game_ii.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Scanned cells are spent; cells up to far stand (reachable, not yet scanned);
	// cells past far lie flat as dashed slots until some jump can land there.
	const states = (s: Step): CellState[] => s.a.map((_, x) => (x <= s.i ? 'spent' : x <= s.far ? 'up' : 'free'));
	const clamp = (s: Step, x: number) => Math.min(x, s.a.length - 1);

	const code = `
jumps = end = far = 0
for i in range(len(nums) - 1):
    far = max(far, i + nums[i])
    if i == end:
        jumps += 1
        end = far
return jumps`;
</script>

<ProblemPage number={45} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="nums as a row of tiles; scanned cells are spent, cells up to far stand, the rest lie flat"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="nums" lit={s.lit}
				pointers={{ i: s.i < 0 || s.done ? null : s.i, end: clamp(s, s.end), far: clamp(s, s.far) }} strong="end" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>It is a BFS over indices, but each level is a <b>contiguous window</b>, so no queue is needed: the cells
			reachable in <code>jumps</code> jumps end at <code>end</code>, and the next window ends at <code>far</code>.</dd>
		<dt>Invariant</dt>
		<dd><code>far</code> is the farthest landing from any cell scanned so far; every cell up to <code>end</code>
			is reachable in <code>jumps</code> jumps. Spent tiles are scanned, standing tiles are reachable, dashed ones not yet.</dd>
		<dt>Each step</dt>
		<dd>Stretch <code>far = max(far, i + nums[i])</code>. When <code>i == end</code>, the window is used up:
			<code>jumps += 1</code> and <code>end = far</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> has scanned up to <code>n - 2</code>. You never jump <i>from</i> the last index.</dd>
		<dt>Pitfall</dt>
		<dd>Loop over <code>range(n - 1)</code>: at <code>i = n - 1</code>, <code>i == end</code> would count a phantom jump.
			Don’t just jump to the farthest cell; jump to the window and pick from it (see the “trap” case).
			Jump Game (55) is the same sweep with only <code>reach</code> and a yes/no answer.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
