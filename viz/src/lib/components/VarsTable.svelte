<script lang="ts">
	import type { Var } from '../types.ts';

	type Props = { vars: Var[]; prev?: Var[]; step: number };
	let { vars, prev, step }: Props = $props();

	const changed = (v: Var) =>
		!!prev && String(prev.find((p) => p.name === v.name)?.value) !== String(v.value);
</script>

<!-- One column per variable; values that changed this step stand out.
     Columns wrap onto a second line when there are more than fit across the plate. -->
<div class="vars">
	<dl aria-label="Variables at step {step}">
		{#each vars as v}
			<div class="col">
				<dt>{v.name}</dt>
				<dd class="value" data-changed={changed(v) || undefined}>{v.value}</dd>
				<dd class="note">{v.note ?? ''}</dd>
			</div>
		{/each}
	</dl>
</div>

<style>
	/* Every column has a left rule; the -1px shift clips the rule of whichever column starts a line. */
	.vars { width: fit-content; max-width: 100%; margin: 18px auto 0; overflow: hidden; font-variant-numeric: tabular-nums; }
	dl { display: flex; flex-wrap: wrap; row-gap: 14px; margin: 0 0 0 -1px; }
	.col {
		flex: 0 1 auto; min-width: 7em; max-width: 13em; padding: 0 18px;
		border-left: 1px solid var(--rule); text-align: center;
	}
	dt { font: 600 12px var(--anatomy-mono); color: var(--anatomy-muted); padding-bottom: 4px; }
	dd { margin: 0; }
	.value { font: 22px/1.3 var(--anatomy-mono); color: var(--anatomy-text); transition: color 0.2s; overflow-wrap: anywhere; }
	.value[data-changed] { color: var(--anatomy-strong); font-weight: 600; }
	.note { padding-top: 4px; font: 11px/1.35 var(--font-sans); color: var(--anatomy-muted); }
	@media (max-width: 640px) { .col { padding: 0 8px; min-width: 0; } }
</style>
