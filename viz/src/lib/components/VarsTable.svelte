<script lang="ts">
	import type { Var } from '../types.ts';
	import SoftText from './SoftText.svelte';

	type Props = { vars: Var[]; prev?: Var[]; step: number };
	let { vars, prev, step }: Props = $props();

	// Equal columns, spread evenly over as few rows as fit: 5 variables lay out 5, or 3 + 2, never 4 + 1.
	let width = $state(0);
	// px: room for a short note on two lines; phones accept three, to keep columns side by side.
	const minCol = $derived(width < 480 ? 104 : 136);
	const perRow = $derived.by(() => {
		const n = Math.max(vars.length, 1);
		const fit = Math.min(width ? Math.max(1, Math.floor(width / minCol)) : n, n);
		// Spread evenly over as few rows as fit (6 in rows of 5 -> 3 + 3); if that still leaves
		// a last row under half full (10 in rows of 3 -> 3 + 3 + 3 + 1), try narrower rows.
		const even = Math.ceil(n / Math.ceil(n / fit));
		for (let p = even; p >= Math.max(2, Math.ceil(even / 2)); p--) if (n % p === 0 || (p > 2 && n % p >= p / 2)) return p;
		return even;
	});

	const changed = (v: Var) =>
		!!prev && String(prev.find((p) => p.name === v.name)?.value) !== String(v.value);
</script>

<!-- One column per variable; values that changed this step stand out. -->
<div class="vars" bind:clientWidth={width}>
	<dl aria-label="Variables at step {step}" style:--per-row={perRow}>
		{#each vars as v, i}
			<div class="col" class:first={i % perRow === 0}>
				<dt>{v.name}</dt>
				<dd class="value" data-changed={changed(v) || undefined}><SoftText text={v.value} align="center" /></dd>
				<dd class="note">{v.note ?? ''}</dd>
			</div>
		{/each}
	</dl>
</div>

<style>
	.vars { margin: 18px 0 0; font-variant-numeric: tabular-nums; }
	dl {
		display: grid; grid-template-columns: repeat(var(--per-row), minmax(0, 12rem));
		justify-content: center; row-gap: 18px; margin: 0;
	}
	/* A rule between columns, none before the first column of each row. */
	.col { min-width: 0; padding: 0 16px; border-left: 1px solid var(--rule); text-align: center; }
	.col.first { border-left-color: transparent; }
	dt { font: 600 12px var(--anatomy-mono); color: var(--anatomy-muted); padding-bottom: 4px; }
	dd { margin: 0; }
	.value {
		font: 22px/1.3 var(--anatomy-mono); color: var(--anatomy-text); overflow-wrap: anywhere;
		transition: color var(--text-soft-dur) var(--text-soft-ease);
	}
	/* Long values (arrays) wrap inside the column, during a swap too. */
	.value :global(.t-text-soft) { max-width: 100%; }
	.value :global(.t-text-soft > span) { white-space: pre-wrap; }
	.value[data-changed] { color: var(--anatomy-strong); font-weight: 600; }
	.note { padding-top: 4px; font: 11px/1.35 var(--font-sans); color: var(--anatomy-muted); }
	@media (max-width: 640px) { .col { padding: 0 8px; } }
</style>
