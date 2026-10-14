<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0058_length_of_last_word.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	// Spaces show as '·'. Skipped trailing spaces lie spent; counted letters stand.
	// At the end, everything left of the word was never needed and lies spent too.
	const chars = (s: Step) => [...s.s].map((c) => (c === ' ' ? '·' : c));
	const states = (s: Step): CellState[] =>
		[...s.s].map((_, x) => {
			if (x <= s.i) return s.done ? 'spent' : 'up';
			return s.end === null || x > s.end ? 'spent' : 'up';
		});

	const code = `
i, length = len(s) - 1, 0
while i >= 0 and s[i] == ' ':
    i -= 1
while i >= 0 and s[i] != ' ':
    length += 1
    i -= 1
return length`;
</script>

<ProblemPage number={58} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.s.length, 1) * P}
		<Figure label="s as a row of character tiles, scanned from the right by pointer i"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, T + 34], [W + 10, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={chars(s)} states={states(s)} name="s" lit={s.lit}
				pointers={{ i: s.done ? null : s.i }} strong="i" />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>The answer lives at the <b>end</b> of the string, so scan from the back. Two phases: skip trailing
			spaces, then count letters.</dd>
		<dt>Invariant</dt>
		<dd>Everything right of <code>i</code> is either a trailing space (flat, dotted) or a counted letter of the last
			word (standing); <code>length</code> equals the number of standing tiles right of <code>i</code>.</dd>
		<dt>Each step</dt>
		<dd>Phase 1: while <code>s[i]</code> is a space, step <code>i</code> left. Phase 2: while <code>s[i]</code> is a
			letter, add one to <code>length</code> and step left.</dd>
		<dt>Stop when</dt>
		<dd>Phase 2 hits a space or <code>i &lt; 0</code>. The rest of the string is never read.</dd>
		<dt>Pitfall</dt>
		<dd>Trailing spaces: <code>"moon  "</code> must give 4, not 0. Guard <code>i &gt;= 0</code> in both loops for a
			word that starts at index 0. <code>len(s.split()[-1])</code> works too but reads the whole string.</dd>
		<dt>Cost</dt>
		<dd>O(n) time in the worst case (only the tail is read), O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
