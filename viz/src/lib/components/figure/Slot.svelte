<svelte:options namespace="svg" />

<script lang="ts">
	import { ground, type Box } from '../../iso.ts';
	import { getCamera } from './context.ts';

	type Props = {
		box: Box;
		/** dashed: free space to write into. dotted: an item already used up. */
		kind: 'dashed' | 'dotted';
		label?: string | number;
	};
	let { box, kind, label }: Props = $props();
	const cam = getCamera();
	const engrave = $derived(cam.plane([box.x + box.w / 2, box.y + box.d / 2, 0]));
</script>

<path class="slot {kind}" d={ground(cam, box)} />
{#if label !== undefined}
	<text transform={engrave} font-size={Math.min(box.w, box.d) * 0.4} text-anchor="middle" dominant-baseline="central">{label}</text>
{/if}

<style>
	.slot { fill: none; stroke-width: var(--anatomy-weight); stroke-linejoin: round; }
	.dashed { stroke: var(--anatomy-mid); stroke-dasharray: 3 3; }
	.dotted { stroke: var(--anatomy-lo); stroke-dasharray: 0.01 3.5; stroke-width: 1; stroke-linecap: round; }
	text { fill: var(--anatomy-faint); font-family: var(--anatomy-mono); }
</style>
