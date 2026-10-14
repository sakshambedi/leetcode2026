<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0151_reverse_words_in_a_string.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 150; // depth of the out row: wide strings shrink the figure, so leave room for the pointer labels

	const glyph = (c: string) => (c === ' ' ? '·' : c);

	// s: unread characters and the word being read stand; everything already consumed is spent.
	const sStates = (s: Step): CellState[] =>
		[...s.s].map((_, x) => (x <= s.i || (s.j !== null && x <= s.j) ? 'up' : 'spent'));

	// out has a fixed number of slots, the length of the answer: written ones stand, the rest are free.
	const outLength = (s: Step) => s.s.trim().split(/ +/).join(' ').length;
	const outValues = (s: Step) => {
		const built = s.out.join(' ');
		return Array.from({ length: outLength(s) }, (_, x) => (x < built.length ? glyph(built[x]) : ''));
	};
	const outStates = (s: Step): CellState[] => {
		const n = s.out.join(' ').length;
		return Array.from({ length: outLength(s) }, (_, x) => (x < n ? 'up' : 'free'));
	};

	const code = `
out, i = [], len(s) - 1
while i >= 0:
    if s[i] == ' ':
        i -= 1; continue
    j = i
    while i >= 0 and s[i] != ' ':
        i -= 1
    out.append(s[i + 1:j + 1])
return ' '.join(out)`;
</script>

<ProblemPage number={151} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.s.length, 1) * P}
		<Figure label="s as a row of character tiles read right to left, and the out row filling left to right"
			bounds={[[-50, -10, H + 6], [W + 10, -10, H + 6], [-50, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={[...s.s].map(glyph)} states={sStates(s)} name="s"
				lit={s.lit?.row === 's' ? s.lit.at : null}
				pointers={{ i: s.done ? null : s.i, j: s.j }} strong="j" />
			<ArrayRow values={outValues(s)} states={outStates(s)} name="out" y={ROW2}
				lit={s.lit?.row === 'out' ? s.lit.at : null} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Read s <b>from the right</b>: words then come out last-first, which is the order you want. Each word is
			still read the right way round because you slice it, <code>s[i + 1 : j + 1]</code>.</dd>
		<dt>Invariant</dt>
		<dd>Between words, <code>out</code> holds every word right of <code>i</code>, last word first, and nothing
			right of <code>i</code> is read again. The flat dotted tiles in s are those consumed characters.</dd>
		<dt>Each step</dt>
		<dd>Space: step <code>i</code> left. Letter: set <code>j = i</code>, walk <code>i</code> left past the letters,
			append <code>s[i + 1 : j + 1]</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>i &lt; 0</code>. Return <code>' '.join(out)</code>: one space between words, none at the ends.</dd>
		<dt>Pitfall</dt>
		<dd>Runs of spaces and spaces at either end must vanish, so never copy spaces from s. In Python
			<code>' '.join(reversed(s.split()))</code> does it all; <code>s.split(' ')</code> (with an argument)
			keeps empty strings and breaks it. The in-place follow-up: reverse the whole string, then each word.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(n) extra space for the output.</dd>
	{/snippet}
</ProblemPage>
