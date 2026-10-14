<script lang="ts">
	import '../app.css';
	import '#lib/transitions.css';
	import favicon from '#lib/assets/orb.svg';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { animateFavicon } from '#lib/favicon.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// The static orb in <head> is the first paint; from here the tab icon moves.
	let icon: HTMLLinkElement;
	onMount(() => animateFavicon(icon));

	// Page side-by-side between the index and a problem, as a view transition: the index exits
	// left when a problem opens, and the problem exits right on the way back.
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion.current) return;
		if (!navigation.to || navigation.from?.url.pathname === navigation.to.url.pathname) return;
		document.documentElement.dataset.pageDir = navigation.to.route.id === '/' ? 'back' : 'forward';
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} bind:this={icon} />
</svelte:head>

{@render children()}
