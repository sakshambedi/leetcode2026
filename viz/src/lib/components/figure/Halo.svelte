<svelte:options namespace="svg" />

<script lang="ts">
	import { ground, type Box } from '../../iso.ts';
	import { getCamera } from './context.ts';

	let { box }: { box: Box } = $props();
	const cam = getCamera();
</script>

<!-- Soft shadow under a solid. Draw every halo in a row before its tiles. -->
<path class="halo" d={ground(cam, box)} />

<style>
	.halo {
		fill: var(--anatomy-halo); stroke: none; filter: blur(9px);
		opacity: var(--anatomy-halo-opacity); transform: translateY(3px);
	}
</style>
