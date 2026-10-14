<script lang="ts">
	import { onMount } from 'svelte';

	const THEMES = ['paper', 'light', 'dark', 'blueprint', 'sepia'] as const;
	let current = $state<string>('paper');

	// app.html applies the saved theme before first paint; this just syncs the buttons.
	onMount(() => (current = document.documentElement.dataset.theme ?? 'paper'));

	function set(theme: string) {
		current = theme;
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('viz-theme', theme);
	}
</script>

<span class="themes" role="group" aria-label="Theme">
	{#each THEMES as theme}
		<button type="button" aria-pressed={current === theme} onclick={() => set(theme)}>{theme}</button>
	{/each}
</span>

<style>
	.themes { margin-left: auto; display: flex; gap: 10px; }
	button {
		all: unset; cursor: pointer; font: 11px var(--anatomy-mono); color: var(--anatomy-muted);
		padding: 4px 0;
	}
	button:hover { color: var(--anatomy-text); }
	button[aria-pressed='true'] { color: var(--anatomy-strong); text-decoration: underline; text-underline-offset: 3px; }
	button:focus-visible { outline: 2px solid var(--anatomy-blue); outline-offset: 2px; }
</style>
