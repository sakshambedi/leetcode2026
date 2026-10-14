<script lang="ts" generics="Step extends BaseStep">
	// The whole page for one problem. A route supplies the algorithm (problem.ts),
	// the cases, a figure snippet and the recall notes; everything else lives here.
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import problems from '../generated/problems.json';
	import { Player } from '../player.svelte.ts';
	import { defaultFits, fmt, sameJSON, type BaseStep, type Case, type Meta, type Problem, type ProblemInfo } from '../types.ts';
	import CasePicker from './CasePicker.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import SwapText from './SwapText.svelte';
	import ThemeSwitch from './ThemeSwitch.svelte';
	import Transport from './Transport.svelte';
	import VarsTable from './VarsTable.svelte';

	type Props = {
		number: number;
		meta: Meta;
		problem: Problem<any, Step, any>;
		cases: Case[];
		/** The core loop, shown in the code block; step.line points into it. */
		code: string;
		figure: Snippet<[Step]>;
		recall: Snippet;
	};
	let { number, meta, problem, cases, code, figure, recall }: Props = $props();

	const info = $derived((problems as ProblemInfo[]).find((p) => p.number === number));
	const title = $derived(info?.title ?? `Problem ${number}`);

	const player = new Player<Step>();
	let selected = $state<number | 'custom'>(0);
	let args = $state<any[]>();
	let expected = $state<unknown>();

	function load(a: any[], exp: unknown) {
		args = a;
		expected = exp;
		player.load(problem.trace(structuredClone($state.snapshot(a))));
	}

	// Start on the first case that fits on screen. Runs once: each route mounts its own page.
	function start() {
		const fits = problem.fits ?? defaultFits;
		const first = cases.findIndex((c) => fits(c.args as any[]));
		if (first < 0) return (selected = 'custom');
		selected = first;
		load(cases[first].args as any[], cases[first].expected);
	}
	start();

	const output = $derived(player.last && player.step ? problem.result(player.step) : undefined);
	const ok = $derived(
		expected === undefined || output === undefined ? true : (problem.check ?? sameJSON)(output, expected)
	);

	function onkeydown(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		const t = e.target as HTMLElement;
		if (t.matches('input, textarea, select, [role=radio]')) return;
		if (t.matches('button') && (e.key === ' ' || e.key === 'Enter')) return; // native click
		const keys: Record<string, () => void> = {
			ArrowRight: player.next,
			ArrowLeft: player.back,
			Home: player.restart,
			End: player.end,
			' ': player.toggle
		};
		if (keys[e.key]) {
			e.preventDefault();
			keys[e.key]();
		}
	}
</script>

<svelte:window {onkeydown} />
<svelte:head><title>{number}. {title}</title></svelte:head>

<main>
	<header>
		<nav class="bar">
			<a href={resolve('/')}>← All<span class="wide"> problems</span></a>
			<ThemeSwitch />
		</nav>
		<div class="meta">
			<span>Nº {number}</span>
			{#if info}
				<span class="caps">{info.difficulty}</span>
				{@const [family, ...detail] = info.pattern.split(' · ')}
				<span><span class="family">{family}</span>{detail.length ? ` · ${detail.join(' · ')}` : ''}</span>
				<a href={info.url}>leetcode ↗</a>
			{/if}
		</div>
		<h1>{title}</h1>
		<p class="lede">{meta.lede}</p>
	</header>

	<CasePicker {cases} {problem} bind:selected current={args} onpick={load} />

	{#if args}
		<dl class="io">
			<div>
				<dt>Input</dt>
				<dd>
					{#each problem.fields as f, n}<span>{f.name} = {fmt(f.from(args))}</span>{n < problem.fields.length - 1 ? ', ' : ''}{/each}
				</dd>
			</div>
			<div><dt>Expected</dt><dd>{expected === undefined ? '–' : fmt(expected)}</dd></div>
			<div>
				<dt>Output</dt>
				<dd aria-live="polite">
					<SwapText value={output === undefined ? undefined : { output, ok }}>
						{#snippet children(v)}
							{#if v === undefined}
								<span class="muted">shown at the last step</span>
							{:else}
								<span class="verdict" data-ok={v.ok}>{v.ok ? '✓ matches' : '✗ differs'}</span> {fmt(v.output)}
							{/if}
						{/snippet}
					</SwapText>
				</dd>
			</div>
		</dl>
	{/if}

	{#if player.step}
		<figure class="plate">
			{#key player.run}{@render figure(player.step)}{/key}
			<VarsTable vars={problem.vars(player.step)} prev={player.prev && problem.vars(player.prev)} step={player.at} />
		</figure>

		<div class="player">
			<p class="msg" aria-live="polite"><SwapText value={player.step.msg} /></p>
			<Transport {player} />
		</div>
	{/if}

	<h2>Recall</h2>
	<dl class="recall">{@render recall()}</dl>
	<CodeBlock {code} active={player.step?.line} />
</main>

<style>
	main { max-width: 760px; margin: 0 auto; padding: 56px 20px 96px; }
	header { margin-bottom: 28px; }
	.bar, .meta {
		display: flex; gap: 6px 18px; flex-wrap: wrap; align-items: baseline;
		font: 11px var(--anatomy-mono); letter-spacing: 0.04em; color: var(--anatomy-muted);
	}
	.bar { margin-bottom: 32px; }
	/* Keeps the back link and the theme switch on one line on a phone. */
	@media (max-width: 420px) { .wide { display: none; } }
	.meta a { color: var(--anatomy-muted); }
	.family { color: var(--anatomy-text); }
	.caps { text-transform: uppercase; letter-spacing: 0.1em; }
	h1 { font: 400 40px/1.1 var(--font-serif); color: var(--anatomy-strong); margin: 10px 0 6px; letter-spacing: -0.01em; }
	.lede { font: italic 19px/1.45 var(--font-serif); margin: 0; max-width: 34em; }
	h2 {
		font: 11px var(--anatomy-mono); text-transform: uppercase; letter-spacing: 0.1em;
		color: var(--anatomy-muted); margin: 56px 0 16px; padding-top: 14px; border-top: 1px solid var(--rule);
	}

	.io {
		display: flex; flex-wrap: wrap; gap: 8px 32px;
		margin: 0 0 20px; padding: 10px 0 0; border-top: 1px dashed var(--rule);
	}
	.io dt { font: 10.5px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted); }
	.io > div { flex: 0 1 auto; min-width: 0; max-width: 100%; }
	/* pre-wrap: string answers keep their runs of spaces (Text Justification, Reverse Words). */
	.io dd { margin: 2px 0 0; font: 12.5px var(--anatomy-mono); color: var(--anatomy-strong); white-space: pre-wrap; overflow-wrap: anywhere; }
	.verdict { font-weight: 600; }
	.verdict[data-ok='true'] { color: var(--anatomy-green); }
	.verdict[data-ok='false'] { color: var(--anatomy-red); }

	/* The plate holds only the figure and the variables table. */
	.plate {
		background: var(--anatomy-card); padding: 28px 24px 24px; margin: 0 -20px;
		border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
	}

	.player { margin-top: 20px; }
	.msg { font: 17px/1.5 var(--font-serif); color: var(--anatomy-strong); margin: 0 0 14px; min-height: 3em; }

	.recall { display: grid; grid-template-columns: 168px 1fr; gap: 14px 24px; margin: 0; }
	.recall :global(dt) { font: 11px/1.9 var(--anatomy-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--anatomy-muted); }
	.recall :global(dd) { margin: 0; }
	.recall :global(b) { color: var(--anatomy-strong); font-weight: 600; }

	@media (max-width: 640px) {
		.io { grid-template-columns: 1fr; }
		.recall { grid-template-columns: 1fr; gap: 2px; }
		.recall :global(dd) { margin-bottom: 12px; }
	}
</style>
