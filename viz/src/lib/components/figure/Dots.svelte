<svelte:options namespace="svg" />

<script lang="ts">
	import { fmt } from '../../iso.ts';
	import { getCamera } from './context.ts';

	let { x0, y0, x1, y1, step = 11 }: { x0: number; y0: number; x1: number; y1: number; step?: number } = $props();
	const cam = getCamera();

	const points = $derived.by(() => {
		const out: [number, number][] = [];
		for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) out.push(cam.p([x, y, 0]));
		return out;
	});
</script>

<g class="dots" aria-hidden="true">
	{#each points as [cx, cy]}<circle cx={fmt(cx)} cy={fmt(cy)} r="0.9" />{/each}
</g>

<style>
	circle { fill: var(--anatomy-dot); stroke: none; }
</style>
