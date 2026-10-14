<script lang="ts">
	import type { Player } from '../player.svelte.ts';
	import { slidingPill } from '../transitions.ts';
	import MorphText from './MorphText.svelte';
	import SoftText from './SoftText.svelte';

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
		<span class="t-icon-swap" data-state={player.playing ? 'b' : 'a'} aria-hidden="true">
			<svg class="icon t-icon" data-icon="a" viewBox="0 0 16 16"><path d="M5 3.2v9.6L12.5 8z" fill="currentColor" /></svg>
			<svg class="icon t-icon" data-icon="b" viewBox="0 0 16 16"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
		</span>
		<MorphText text={player.playing ? 'Pause' : player.last ? 'Replay' : 'Play'} />
	</button>
	<button type="button" class="btn" onclick={player.next} disabled={player.last} title="Next step (→)">
		<span>Next</span><svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
	</button>

	<span class="count" aria-label="Step {player.at} of {player.steps.length - 1}"
		><SoftText text="{player.at} / {player.steps.length - 1}" /></span
	>

	<span class="speed t-tabs" role="radiogroup" aria-label="Speed" {@attach slidingPill(SPEEDS.indexOf(player.speed))}>
		<span class="t-tabs-pill" aria-hidden="true"></span>
		{#each SPEEDS as s}
			<button type="button" class="t-tab" role="radio" aria-checked={player.speed === s} onclick={() => player.setSpeed(s)}>{s}×</button>
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
	.speed {
		margin-left: auto; display: inline-flex; border: 1px solid var(--anatomy-faint); border-radius: 6px; overflow: hidden;
		--tabs-pill-radius: 0;
	}
	.speed button {
		min-height: 32px; padding: 0 9px; border: 0; cursor: pointer; background: transparent;
		font: 11px var(--anatomy-mono); color: var(--anatomy-muted);
	}
	.speed button + button { border-left: 1px solid var(--anatomy-faint); }
	.speed button[aria-checked='true'] { background: var(--well); color: var(--anatomy-strong); }
	/* Once the pill is in place it carries the background, sliding between speeds. */
	.speed:has(:global(.t-tabs-pill[data-placed])) button[aria-checked='true'] { background: transparent; }
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
