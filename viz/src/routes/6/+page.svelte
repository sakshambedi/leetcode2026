<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0006_zigzag_conversion.json';
	import { meta, problem, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;
	const ROW2 = 110; // gap between s, the zigzag grid, and the answer
	const GRID = 52; // depth between zigzag rows, tight so the grid reads as one shape

	// s: unplaced chars stand; placed ones are spent.
	const sStates = (s: Step): CellState[] => [...s.s].map((_, x) => (x < s.placed ? 'spent' : 'up'));

	// Zigzag row r: a cell per column. Placed chars stand; empty cells are free.
	// Once a row has been read into the answer, its chars are spent.
	function gridRow(s: Step, r: number) {
		const values: string[] = Array(s.cols).fill('');
		const states: CellState[] = Array(s.cols).fill('free');
		for (let i = 0; i < s.placed; i++) {
			const [pr, pc] = s.pos[i];
			if (pr !== r) continue;
			values[pc] = s.s[i];
			states[pc] = r < s.read ? 'spent' : 'up';
		}
		return { values, states };
	}

	const outStates = (s: Step): CellState[] => [...s.s].map((_, x) => (x < s.out.length ? 'up' : 'free'));
	const outValues = (s: Step) => [...s.s].map((_, x) => s.out[x] ?? '');

	const code = `
if numRows == 1:
    return s
rows = [""] * numRows
row, step = 0, 1
for c in s:
    rows[row] += c
    if row == 0:
        step = 1
    elif row == numRows - 1:
        step = -1
    row += step
return "".join(rows)`;
</script>

<ProblemPage number={6} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.s.length, s.cols, 1) * P}
		{@const yOut = ROW2 + (s.numRows - 1) * GRID + ROW2}
		<Figure label="s as a row of tiles, the zigzag grid one row per bucket, and the answer read row by row"
			bounds={[[-70, -10, H + 6], [W + 10, -10, H + 6], [-70, yOut + T + 34], [W + 10, yOut + T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: yOut + T + 8 }}>
			<ArrayRow values={[...s.s]} states={sStates(s)} name="s"
				pointers={{ c: s.placed < s.s.length ? s.placed : null }} strong="c" />
			{#each Array(s.numRows) as _, r}
				{@const g = gridRow(s, r)}
				<ArrayRow values={g.values} states={g.states} name={`rows[${r}]`} y={ROW2 + r * GRID} indices={false}
					lit={s.litCell && s.litCell[0] === r ? s.litCell[1] : null} />
			{/each}
			<ArrayRow values={outValues(s)} states={outStates(s)} name="answer" y={yOut} lit={s.litOut} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>You never need the 2-D grid. Each row is a <b>bucket</b>: walk <code>s</code> once and append each char to
			<code>rows[row]</code>. Only the row index matters, and it <b>bounces</b> between 0 and <code>numRows − 1</code>.</dd>
		<dt>Invariant</dt>
		<dd>After placing <code>s[0..i)</code>, <code>rows[r]</code> holds, in order, exactly the chars of that prefix that
			the zigzag puts in row <code>r</code>; <code>row</code> is where <code>s[i]</code> goes.</dd>
		<dt>Each step</dt>
		<dd>Append <code>c</code> to <code>rows[row]</code>. At the top set <code>step = +1</code>, at the bottom
			<code>step = −1</code>. Then <code>row += step</code>.</dd>
		<dt>Stop when</dt>
		<dd>Every char is placed. Return the rows joined top to bottom.</dd>
		<dt>Pitfall</dt>
		<dd><code>numRows == 1</code>: row 0 is both top and bottom, so <code>step</code> would flip to −1 and
			<code>row</code> would go negative. Return <code>s</code> first. More rows than chars is fine: the extra rows stay empty.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(n) extra space for the rows.</dd>
	{/snippet}
</ProblemPage>
