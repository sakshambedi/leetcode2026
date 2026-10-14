<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0169_majority_element.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the votes row

	// nums: values already read are spent; the one just read and the unread ones stand.
	const states = (s: Step): CellState[] => s.a.map((_, x) => (x < s.i || (s.done && x <= s.i) ? 'spent' : 'up'));
	// votes: the candidate's uncancelled votes stand as tiles engraved with it; the rest is empty space.
	const votes = (s: Step) => s.a.map(() => s.cand ?? '');
	const voteStates = (s: Step): CellState[] => s.a.map((_, x) => (x < s.count ? 'up' : 'free'));

	const code = `
count, cand = 0, None
for x in nums:
    if count == 0:
        cand = x
    count += 1 if x == cand else -1
return cand`;
</script>

<ProblemPage number={169} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.a.length + 1, 2) * P}
		<Figure label="nums as a row of tiles read left to right, and a votes row holding the candidate's uncancelled votes"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={s.a} states={states(s)} name="nums" lit={s.done || s.i < 0 ? null : s.i}
				pointers={{ x: s.done || s.i < 0 ? null : s.i }} />
			<ArrayRow values={votes(s)} states={voteStates(s)} name="votes" y={ROW2} indices={false}
				pointers={{ count: s.count }} strong="count" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Pair off votes: every value that differs from the candidate <b>cancels one vote</b> for it. The majority
			has more than half of all votes, so even if every other value spends itself cancelling it, some survive.</dd>
		<dt>Invariant</dt>
		<dd>After reading a prefix, it splits into cancelled pairs of different values plus <code>count</code> unpaired
			copies of <code>cand</code>. The standing tiles in the votes row are those copies.</dd>
		<dt>Each step</dt>
		<dd>If <code>count == 0</code>, adopt <code>x</code> as the candidate. Then <code>count += 1</code> if
			<code>x == cand</code>, else <code>count -= 1</code>.</dd>
		<dt>Stop when</dt>
		<dd>Every value is read. Return <code>cand</code>; the problem guarantees a majority, so no second pass
			is needed to confirm it.</dd>
		<dt>Pitfall</dt>
		<dd>The candidate can change many times along the way (<code>[1, 2, 3, 4, 4, 4, 4]</code>); only the final one
			is guaranteed. Without the guarantee, count <code>cand</code> in a second pass.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space. A hash map count or sorting (<code>nums[n // 2]</code>) also work but cost
			O(n) space or O(n log n) time.</dd>
	{/snippet}
</ProblemPage>
