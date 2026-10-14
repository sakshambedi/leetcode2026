<script lang="ts">
	import ProblemPage from '#lib/components/ProblemPage.svelte';
	import Figure from '#lib/components/figure/Figure.svelte';
	import ArrayRow, { type CellState } from '#lib/components/figure/ArrayRow.svelte';
	import { TILE } from '#lib/components/figure/context.ts';
	import cases from '#lib/generated/cases/p0013_roman_to_integer.json';
	import { meta, problem, VALUE, type Step } from './problem.ts';

	const { size: T, pitch: P, height: H } = TILE;

	const reading = (s: Step) => !s.done && s.line !== 1;
	// Symbols stand while unread or added. A subtracted symbol lies flat (spent), so pairs like CM read at a glance.
	// The symbol being read stays up and lit for its own step; a subtracted one falls on the next.
	const states = (s: Step): CellState[] =>
		s.s.map((_, x) => ((s.signed[x] ?? 0) < 0 && !(reading(s) && x === s.i) ? 'spent' : 'up'));
	// Under each symbol: its value, signed once it has been counted.
	const values = (s: Step) =>
		s.s.map((c, x) => {
			const v = s.signed[x];
			return v === null ? VALUE[c] : v < 0 ? `−${-v}` : `+${v}`;
		});
	const pointers = (s: Step) =>
		reading(s) ? { i: s.i, 'i+1': s.i + 1 < s.s.length ? s.i + 1 : null } : { i: s.done ? null : 0 };

	const code = `
total = 0
for i in range(len(s)):
    v = VALUE[s[i]]
    if i + 1 < len(s) and v < VALUE[s[i + 1]]:
        total -= v
    else:
        total += v
return total`;
</script>

<ProblemPage number={13} {meta} {problem} {cases} {code}>
	{#snippet figure(s: Step)}
		{@const W = Math.max(s.s.length, 1) * P}
		<Figure label="s as a row of symbol tiles, each with its signed value underneath"
			bounds={[[-40, -10, H + 6], [W + 20, -10, H + 6], [-40, T + 34], [W + 20, T + 34]]}
			dots={{ x0: -8, y0: -8, x1: W, y1: T + 8 }}>
			<ArrayRow values={s.s} states={states(s)} name="s" lit={reading(s) ? s.i : null}
				pointers={pointers(s)} strong="i" indices={values(s)} />
		</Figure>
	{/snippet}

	{#snippet recall()}
		<dt>Key insight</dt>
		<dd>Roman numerals run largest to smallest. A symbol <b>smaller than the one after it</b> is the only
			exception, and it means "subtract me": the I in IV, the X in XC, the C in CM.</dd>
		<dt>Invariant</dt>
		<dd><code>total</code> is the sum of the signed values of <code>s[0..i]</code>, shown under each symbol read
			so far. A subtracted symbol lies flat; an added one keeps standing.</dd>
		<dt>Each step</dt>
		<dd>Look up <code>v = VALUE[s[i]]</code>. If the next symbol is bigger, <code>total -= v</code>;
			otherwise <code>total += v</code>.</dd>
		<dt>Stop when</dt>
		<dd>Every symbol is read. The last symbol is always added: nothing follows it.</dd>
		<dt>Pitfall</dt>
		<dd>Guard <code>i + 1 &lt; len(s)</code> before peeking. Compare with the next symbol only, never the
			previous one: equal neighbours (XX, MMM) both add. Integer to Roman (12) is the reverse: greedy over
			13 value/symbol pairs.</dd>
		<dt>Cost</dt>
		<dd>O(n) time, O(1) extra space.</dd>
	{/snippet}
</ProblemPage>
