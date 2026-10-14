<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import problems from '#lib/generated/problems.json';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
	import type { Meta, ProblemInfo } from '#lib/types.ts';

	// Every route folder with a problem.ts is a visualization; main.py lists every Python problem.
	const modules = import.meta.glob<{ meta: Meta }>('./*/problem.ts', { eager: true });
	const metaFor = (n: number) => modules[`./${n}/problem.ts`]?.meta;

	const rows = (problems as ProblemInfo[]).map((p) => ({ ...p, meta: metaFor(p.number) }));
</script>

<svelte:head><title>LeetCode practice</title></svelte:head>

<main>
	<header>
		<div class="meta"><span>{rows.length} problems</span><ThemeSwitch /></div>
		<h1>LeetCode practice</h1>
		<p class="lede">Open a problem to step through how it is solved.</p>
	</header>

	<table>
		<thead>
			<tr><th scope="col">Nº</th><th scope="col">Problem</th><th scope="col">Difficulty</th><th scope="col">Pattern</th></tr>
		</thead>
		<tbody>
			{#each rows as p (p.number)}
				<tr>
					<td class="num">{p.number}</td>
					<td>
						{#if p.meta}<a href={resolve(`/${p.number}` as RouteId)}>{p.title}</a>
						{:else}{p.title} <span class="none">no visualization yet</span>{/if}
					</td>
					<td class="caps">{p.meta?.difficulty ?? ''}</td>
					<td class="pattern">{p.meta?.pattern ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>

<style>
	main { max-width: 760px; margin: 0 auto; padding: 56px 20px 96px; }
	.meta { display: flex; font: 11px var(--anatomy-mono); color: var(--anatomy-muted); }
	h1 { font: 400 40px/1.1 var(--font-serif); color: var(--anatomy-strong); margin: 10px 0 6px; }
	.lede { font: italic 19px/1.45 var(--font-serif); margin: 0 0 36px; }
	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 0 12px 8px 0; border-bottom: 1px solid var(--rule);
		font: 11px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted);
	}
	td { padding: 12px 12px 12px 0; border-bottom: 1px solid var(--rule); vertical-align: baseline; }
	td a { color: var(--anatomy-strong); font: 18px var(--font-serif); }
	.num { font: 12px var(--anatomy-mono); color: var(--anatomy-muted); width: 4em; }
	.caps, .pattern { font: 11px var(--anatomy-mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--anatomy-muted); }
	.none { font: 11px var(--anatomy-mono); color: var(--anatomy-lo); margin-left: 8px; }
</style>
