<script lang="ts">
	import { highlight } from '../highlight.ts';

	type Props = {
		code: string;
		lang?: string;
		title?: string;
		/** 1-based line the current step runs; lit up in the block. */
		active?: number;
	};
	let { code, lang = 'python', title = 'Core loop', active }: Props = $props();

	const lines = $derived(highlight(code.trim(), lang));
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(code.trim());
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<figure class="code">
	<figcaption>
		<span class="lang">{lang}</span>
		{#if title}<span class="title">{title}</span>{/if}
		<button type="button" onclick={copy} aria-label="Copy code">{copied ? 'Copied ✓' : 'Copy'}</button>
	</figcaption>
	<!-- tabindex: scrollable regions must be reachable by keyboard -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre tabindex="0" aria-label="{title}, {lang}"><code
			>{#each lines as html, i}<span class="ln" data-line={i + 1} data-active={active === i + 1 || undefined}
					>{@html html}</span
				>{/each}</code
		></pre>
</figure>

<style>
	.code { margin: 28px 0 0; border: 1px solid var(--rule); border-radius: 8px; background: var(--well); overflow: hidden; }
	figcaption {
		display: flex; align-items: center; gap: 12px; min-height: 38px; padding: 0 6px 0 14px;
		border-bottom: 1px solid var(--rule); background: var(--anatomy-card);
		font: 10.5px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--anatomy-muted);
	}
	.lang { color: var(--anatomy-text); }
	.title::before { content: '·'; margin-right: 12px; color: var(--anatomy-lo); }
	button {
		margin-left: auto; min-height: 28px; padding: 0 10px; border-radius: 5px; cursor: pointer;
		font: 10.5px var(--anatomy-mono); letter-spacing: 0.1em; text-transform: uppercase;
		color: var(--anatomy-text); background: transparent; border: 1px solid transparent;
	}
	button:hover { color: var(--anatomy-strong); border-color: var(--anatomy-faint); }
	pre { margin: 0; padding: 12px 0; overflow-x: auto; }
	code { display: block; min-width: max-content; font: 13px/1.75 var(--anatomy-mono); color: var(--anatomy-text); }
	.ln { display: block; padding-right: 20px; transition: background 0.2s; }
	.ln::before {
		content: attr(data-line); display: inline-block; width: 2.4em; margin-right: 1.4em; text-align: right;
		color: var(--anatomy-lo); user-select: none;
	}
	.ln[data-active] { background: color-mix(in srgb, var(--anatomy-strong) 8%, transparent); box-shadow: inset 2px 0 var(--anatomy-strong); }
	.ln[data-active]::before { color: var(--anatomy-strong); }
	pre :global(.tk-kw) { color: var(--anatomy-strong); font-weight: 600; }
	pre :global(.tk-fn) { color: var(--anatomy-strong); }
	pre :global(.tk-num), pre :global(.tk-str) { color: var(--anatomy-blue); }
	pre :global(.tk-op) { color: var(--anatomy-mid); }
	pre :global(.tk-comment) { color: var(--anatomy-muted); font-style: italic; }
</style>
