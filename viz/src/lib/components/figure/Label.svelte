<svelte:options namespace="svg" />

<script lang="ts">
	import { fmt, type Point } from '../../iso.ts';
	import { getCamera, getScale } from './context.ts';

	type Props = {
		at: Point;
		text: string | number;
		tone?: 'faint' | 'muted' | 'text' | 'strong';
		anchor?: 'start' | 'middle' | 'end';
		/** Offset below the projected point in screen pixels, so labels stay upright and aligned. */
		dy?: number;
	};
	let { at, text, tone = 'muted', anchor = 'middle', dy = 0 }: Props = $props();
	const cam = getCamera();
	const scale = getScale();
	const xy = $derived(cam.p(at));
	const px = $derived(scale.px); // keeps labels 11px on screen however wide the figure is
</script>

<text class={tone} x={fmt(xy[0])} y={fmt(xy[1] + dy * px)} font-size={fmt(11 * px)} text-anchor={anchor} dominant-baseline="central">{text}</text>

<style>
	text { font-family: var(--anatomy-mono); letter-spacing: 0.04em; }
	.faint { fill: var(--anatomy-faint); }
	.muted { fill: var(--anatomy-muted); }
	.text { fill: var(--anatomy-text); }
	.strong { fill: var(--anatomy-strong); font-weight: 600; }
</style>
