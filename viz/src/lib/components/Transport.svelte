<script lang="ts">
	import type { Player } from '../player.svelte.ts';

	let { player }: { player: Player<any> } = $props();
	const SPEEDS = [0.5, 1, 2];
</script>

<div class="transport" role="group" aria-label="Playback">
	<button type="button" class="btn icon-btn" onclick={player.restart} disabled={player.first} aria-label="Restart" title="Restart (Home)">
		<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3v4h4" /><path d="M3.8 7A5 5 0 1 1 3 9.5" /></svg>
	</button>
	<button type="button" class="btn" onclick={player.back} disabled={player.first} title="Previous step (←)">
		<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg><span>Prev</span>
	</button>
	<button type="button" class="btn primary" onclick={player.toggle} aria-pressed={player.playing} title="Play / pause (Space)">
		{#if player.playing}
			<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg><span>Pause</span>
		{:else}
			<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.5 8z" fill="currentColor" /></svg>
			<span>{player.last ? 'Replay' : 'Play'}</span>
		{/if}
	</button>
	<button type="button" class="btn" onclick={player.next} disabled={player.last} title="Next step (→)">
		<span>Next</span><svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
	</button>

	<span class="count" aria-label="Step {player.at} of {player.steps.length - 1}">{player.at} / {player.steps.length - 1}</span>

	<span class="speed" role="radiogroup" aria-label="Speed">
		{#each SPEEDS as s}
			<button type="button" role="radio" aria-checked={player.speed === s} onclick={() => player.setSpeed(s)}>{s}×</button>
		{/each}
	</span>
</div>
<p class="keys"><kbd>←</kbd><kbd>→</kbd> step <kbd>Space</kbd> play <kbd>Home</kbd><kbd>End</kbd> jump</p>

<style>
	.transport { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
	.icon-btn { padding: 0; width: 34px; }
	.icon { width: 14px; height: 14px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
	.primary { min-width: 104px; }
	.count { margin-left: 8px; font: 12px var(--anatomy-mono); color: var(--anatomy-text); font-variant-numeric: tabular-nums; }
	.speed { margin-left: auto; display: inline-flex; border: 1px solid var(--anatomy-faint); border-radius: 6px; overflow: hidden; }
	.speed button {
		min-height: 32px; padding: 0 9px; border: 0; cursor: pointer; background: transparent;
		font: 11px var(--anatomy-mono); color: var(--anatomy-muted);
	}
	.speed button + button { border-left: 1px solid var(--anatomy-faint); }
	.speed button[aria-checked='true'] { background: var(--well); color: var(--anatomy-strong); }
	.keys { margin: 12px 0 0; font: 11px var(--anatomy-mono); color: var(--anatomy-muted); }
	kbd {
		display: inline-block; min-width: 20px; padding: 1px 5px; margin: 0 2px 0 0; text-align: center;
		font: 10.5px var(--anatomy-mono); color: var(--anatomy-text);
		border: 1px solid var(--anatomy-faint); border-bottom-width: 2px; border-radius: 4px;
	}
	kbd + kbd { margin-left: 0; }
	.keys :global(kbd:not(:first-child)) { margin-left: 8px; }
	.keys :global(kbd + kbd) { margin-left: 0; }
</style>
