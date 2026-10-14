<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0068_text_justification.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const LINE = 60; // depth between output lines

	// Letters stand as tiles; every space is free room, a dashed slot.
	const states = (line: string): CellState[] => [...line].map((c) => (c === ' ' ? 'free' : 'up'));

	const code = `
res, i, n = [], 0, len(words)
while i < n:
    j, length = i, 0
    while j < n and length + len(words[j]) + (j - i) <= maxWidth:
        length += len(words[j]); j += 1
    gaps = j - i - 1
    if j == n or gaps == 0:
        line = " ".join(words[i:j]).ljust(maxWidth)
    else:
        q, r = divmod(maxWidth - length, gaps)
        line = ""
        for k in range(gaps):
            line += words[i + k] + " " * (q + (k < r))
        line += words[j - 1]
    res.append(line)
    i = j
return res`;
</script>

<ProblemPage number={68} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = s.maxWidth * P}
		{@const D = (Math.max(s.total, 1) - 1) * LINE + T + 34}
		<Figure label="one row of character tiles per output line; spaces are dashed slots"
			bounds={[[-70, -10, H + 6], [W + 10, -10, H + 6], [-70, D], [W + 10, D]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: D - 26 }}>
			{#each s.lines as line, r}
				{@const current = !s.done && r === s.lines.length - 1}
				<ArrayRow values={[...line]} states={states(line)} name={`res[${r}]`} y={r * LINE}
					indices={current} lit={current ? s.lit : null} />
			{/each}
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Two separate jobs. <b>Pack</b> greedily: a word joins while <code>length + len(word) + (j − i) ≤ maxWidth</code>
			(the <code>j − i</code> is one space per gap). Then <b>spread</b> the <code>maxWidth − length</code> spaces:
			<code>q, r = divmod(spaces, gaps)</code>, and the first <code>r</code> gaps get <code>q + 1</code>.</dd>
		<dt>Invariant</dt>
		<dd>Every finished line in <code>res</code> is exactly <code>maxWidth</code> chars, and <code>words[i..j)</code> is the
			most that fits on the current line with single spaces.</dd>
		<dt>Each step</dt>
		<dd>Grow <code>j</code> while the next word fits. Close the line, build it (justified, or left-justified), append it,
			and set <code>i = j</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>i</code> reaches the end of <code>words</code>.</dd>
		<dt>Pitfall</dt>
		<dd>The <b>last line</b> and any <b>one-word line</b> are left-justified: single spaces, padding on the right
			(one word has no gap, so <code>divmod</code> would divide by zero). Extra spaces go to the <b>left</b> gaps, not the right.</dd>
		<dt>Cost</dt>
		<dd>O(total chars) time: each word is packed once and each line built once. O(1) extra besides the output.</dd>
	{/snippet}
</ProblemPage>
