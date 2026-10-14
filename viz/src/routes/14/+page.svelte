<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0014_longest_common_prefix.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 140; // depth between string rows, with room for the pointer labels on long strings

	// Every letter stands while the scan runs. When it stops at column i, the shared
	// prefix strs[..][:i] keeps standing and everything past it is spent.
	const states = (s: Step, w: string): CellState[] => [...w].map((_, x) => (s.done && x >= s.i ? 'spent' : 'up'));
	const lit = (s: Step, row: number) => (s.lit && s.lit[0] === row ? s.lit[1] : null);
	// Column i is marked on strs[0] (the letter c) and on the string being compared.
	const pointers = (s: Step, row: number) => ({ i: !s.done && (row === 0 || row === s.j) ? s.i : null });

	const code = `
for i in range(len(strs[0])):
    c = strs[0][i]
    for s in strs[1:]:
        if i == len(s) or s[i] != c:
            return strs[0][:i]
return strs[0]`;
</script>

<ProblemPage number={14} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(1, ...s.strs.map((w) => w.length)) * P}
		{@const D = (s.strs.length - 1) * ROW2}
		<Figure label="each string as a row of letter tiles, stacked, with column pointer i"
			bounds={[[-80, -10, H + 6], [W + 10, -10, H + 6], [-80, D + T + 34], [W + 10, D + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: D + T + 8 }}>
			{#each s.strs as w, row}
				<ArrayRow values={[...w]} states={states(s, w)} name="strs[{row}]" y={row * ROW2}
					lit={lit(s, row)} pointers={pointers(s, row)} strong={row === s.j ? 'i' : undefined} />
			{/each}
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Line the strings up and read <b>down a column</b>, not along a row. Column <code>i</code> belongs to the
			prefix exactly when every string has the letter <code>strs[0][i]</code> there.</dd>
		<dt>Invariant</dt>
		<dd>Columns <code>0..i)</code> are shared by every string, so <code>strs[0][:i]</code> is a common prefix.</dd>
		<dt>Each step</dt>
		<dd>Take <code>c = strs[0][i]</code>, then check each other string at column <code>i</code>. All match: step
			<code>i</code> right.</dd>
		<dt>Stop when</dt>
		<dd>A string has run out (<code>i == len(s)</code>) or differs (<code>s[i] != c</code>): return
			<code>strs[0][:i]</code>. If strs[0] runs out first, it is the prefix.</dd>
		<dt>Pitfall</dt>
		<dd>Check <code>i == len(s)</code> <b>before</b> reading <code>s[i]</code>, or a shorter string throws. Empty
			strings and a single string are valid input.</dd>
		<dt>Cost</dt>
		<dd>O(S) time, S the total number of letters, and it stops at the first mismatch; O(1) extra space.
			Sorting and comparing only the first and last string also works, but costs more.</dd>
	{/snippet}
</ProblemPage>
