<svelte:options namespace="svg" />

<script lang="ts">
	import { solid, type Box } from '../../iso.ts';
	import { getCamera } from './context.ts';

	type Props = {
		box: Box;
		h: number;
		label?: string | number;
		/** The one part per frame that just changed. */
		lit?: boolean;
	};
	let { box, h, label, lit = false }: Props = $props();
	const cam = getCamera();

	const shape = $derived(solid(cam, box, h));
	const engrave = $derived(cam.plane([box.x + box.w / 2, box.y + box.d / 2, h]));
</script>

<g class="tile" data-lit={lit || undefined}>
	<path class="fill" d={shape.outline} />
	{#each shape.sides as side}<path class="shade" data-shade={side.shade} d={side.d} />{/each}
	<path class="top" d={shape.top} />
	<path class="edge" d={shape.outline} />
	<path class="edge" d={shape.top} />
	{#if label !== undefined}
		<text transform={engrave} font-size={Math.min(box.w, box.d) * 0.4} text-anchor="middle" dominant-baseline="central">{label}</text>
	{/if}
</g>

<style>
	.fill { fill: var(--anatomy-paper); }
	.top { fill: var(--anatomy-top); }
	.shade[data-shade='0'] { fill: var(--anatomy-shade-0); }
	.shade[data-shade='1'] { fill: var(--anatomy-shade-1); }
	.shade[data-shade='2'] { fill: var(--anatomy-shade-2); }
	.shade[data-shade='3'] { fill: var(--anatomy-shade-3); }
	.edge { fill: none; stroke: var(--anatomy-lo); stroke-width: var(--anatomy-weight); stroke-linejoin: round; }
	text { fill: var(--anatomy-hi); font-family: var(--anatomy-mono); letter-spacing: 0.04em; }
	[data-lit] .top { fill: var(--anatomy-lit-top); }
	[data-lit] .shade { fill: var(--anatomy-lit-shade); }
	[data-lit] .edge { stroke: var(--anatomy-lit); stroke-width: 1px; }
	[data-lit] text { fill: var(--anatomy-lit); font-weight: 600; }
</style>
