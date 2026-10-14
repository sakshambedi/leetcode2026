<script lang="ts">
	import type { Snippet } from 'svelte';
	import { camera, viewBox, type Point } from '../../iso.ts';
	import { setCamera, setScale } from './context.ts';
	import Dots from './Dots.svelte';

	type Props = {
		/** World points the figure must fit, e.g. the corners of every row plus room for labels. */
		bounds: Point[];
		/** Ground area covered by the dot grid. */
		dots?: { x0: number; y0: number; x1: number; y1: number };
		label: string;
		children: Snippet;
	};
	let { bounds, dots, label, children }: Props = $props();

	const cam = camera();
	setCamera(cam);

	const box = $derived(viewBox(cam, bounds));
	let width = $state(0);
	setScale({
		get px() {
			return width ? Number(box.split(' ')[2]) / width : 1;
		}
	});
</script>

<svg class="figure" viewBox={box} role="img" aria-label={label} bind:clientWidth={width}>
	{#if dots}<Dots {...dots} />{/if}
	{@render children()}
</svg>

<style>
	.figure { display: block; width: 100%; height: auto; overflow: visible; }
</style>
