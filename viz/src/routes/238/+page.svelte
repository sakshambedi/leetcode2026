<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0238_product_of_array_except_self.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the answer row

	// nums: a value lies flat (spent) once it is folded into the running product of this pass.
	// Pass 1 folds from the left into prefix, pass 2 from the right into suffix.
	const statesNums = (s: Step): CellState[] =>
		s.a.map((_, x) => {
			if (s.done) return 'spent';
			if (s.i === null) return 'up';
			return (s.pass === 1 ? x <= s.i : x >= s.i) ? 'spent' : 'up';
		});
	// answer: unwritten slots are free space.
	const statesAns = (s: Step): CellState[] => s.ans.map((v) => (v === null ? 'free' : 'up'));

	const code = `
answer = [1] * len(nums)
prefix = 1
for i in range(len(nums)):
    answer[i] = prefix
    prefix *= nums[i]
suffix = 1
for i in reversed(range(len(nums))):
    answer[i] *= suffix
    suffix *= nums[i]
return answer`;
</script>

<ProblemPage number={238} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length, 1) * P}
		<Figure label="nums and answer as rows of tiles; values already folded into the running product lie flat"
			bounds={[[-60, -10, H + 6], [W + 10, -10, H + 6], [-60, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={s.a} states={statesNums(s)} name="nums" pointers={{ i: s.i }} />
			<ArrayRow values={s.ans.map((v) => v ?? '')} states={statesAns(s)} name="answer" y={ROW2}
				lit={s.lit} pointers={{ i: s.i }} strong="i" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd><code>answer[i]</code> = <b>(product of everything left of i) × (product of everything right of i)</b>.
			Both sides are running products, so two sweeps build them without dividing.</dd>
		<dt>Invariant</dt>
		<dd>Pass 1: <code>prefix</code> is the product of the flat nums tiles, <code>nums[0..i]</code>.
			Pass 2: <code>suffix</code> is the product of <code>nums[i..n)</code>, and every slot right of
			<code>i</code> is final.</dd>
		<dt>Each step</dt>
		<dd>Write (pass 1) or multiply (pass 2) the running product into <code>answer[i]</code> first, <b>then</b>
			fold <code>nums[i]</code> into it.</dd>
		<dt>Stop when</dt>
		<dd>The second sweep passes slot 0. Return <code>answer</code>.</dd>
		<dt>Pitfall</dt>
		<dd>Folding in <code>nums[i]</code> before writing would include nums[i] itself. Dividing the total
			product breaks on zeros, and the problem forbids it anyway.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space besides the output.</dd>
	{/snippet}
</ProblemPage>
