<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0028_find_the_index_of_the_first_occurrence_in_a_string.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // depth of the needle row

	// haystack: starts already ruled out lie spent; the rest stand. Once found, only the match stands;
	// with no match, every start is ruled out.
	const hayStates = (s: Step): CellState[] =>
		[...s.haystack].map((_, x) => {
			if (s.found !== null) return x >= s.found && x < s.found + s.needle.length ? 'up' : 'spent';
			return s.done || x < s.start ? 'spent' : 'up';
		});

	const code = `
n, m = len(haystack), len(needle)
for start in range(n - m + 1):
    k = 0
    while k < m and haystack[start + k] == needle[k]:
        k += 1
    if k == m:
        return start
return -1`;
</script>

<ProblemPage number={28} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.haystack.length, s.start + s.needle.length, 1) * P}
		<Figure label="haystack as a row of letter tiles, with needle slid under it at the current start"
			bounds={[[-70, -10, H + 6], [W + 10, -10, H + 6], [-70, ROW2 + T + 34], [W + 10, ROW2 + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: ROW2 + T + 8 }}>
			<ArrayRow values={[...s.haystack]} states={hayStates(s)} name="haystack" lit={s.lit}
				pointers={{ start: s.done && s.found === null ? null : s.start }} strong="start" />
			<ArrayRow values={[...s.needle]} name="needle" y={ROW2} offset={s.start}
				pointers={{ k: s.done ? null : s.k }} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Slide the needle under the haystack <b>one start at a time</b>, and compare it letter by letter from its
			left end. The first start where every letter matches is the answer.</dd>
		<dt>Invariant</dt>
		<dd>Every start left of <code>start</code> has been ruled out (the flat dotted tiles), and at the current start
			<code>needle[0..k)</code> equals <code>haystack[start..start + k)</code>.</dd>
		<dt>Each step</dt>
		<dd>Compare <code>haystack[start + k]</code> with <code>needle[k]</code>. Equal: step <code>k</code>. Different:
			reset <code>k = 0</code> and step <code>start</code>.</dd>
		<dt>Stop when</dt>
		<dd><code>k == m</code>: return <code>start</code>. Or <code>start</code> passes <code>n − m</code>, the last
			start where the needle still fits: return −1.</dd>
		<dt>Pitfall</dt>
		<dd>Loop to <code>n − m</code> inclusive, not <code>n</code>, or you read past the end. Each mismatch throws away
			the <code>k</code> letters already matched, which is why "mississippi" / "issip" backs up; KMP keeps them
			with a prefix table.</dd>
		<dt>Cost</dt>
		<dd>O((n − m + 1) · m) time worst case, O(1) extra space. KMP (or Z / Rabin–Karp) brings it to O(n + m).</dd>
	{/snippet}
</ProblemPage>
