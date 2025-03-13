<script lang="ts">
	import { ui } from '$lib/ui.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		children,
		maxWidthInPixels = 1024,
		class: className,
		hideShadow = false
	}: {
		children: Snippet;
		maxWidthInPixels?: number;
		class?: string;
		hideShadow?: boolean;
	} = $props();

	const rootFontSizeInPixels: number = 16;
	const containerFontSizeInCqw: number = (rootFontSizeInPixels / maxWidthInPixels) * 100;
</script>

<svelte:head>
	<style>
		@media print {
			@page {
				size: A4 portrait;
				margin: 0;
			}
			html,
			body {
				font-size: 16px;
				background: #fff;
				overflow: visible;
			}
		}
	</style>
</svelte:head>

<div class="w-full font-helvetica @container">
	<div
		class={cn(
			'w-full bg-white font-helvetica text-black [print:exact]',
			!hideShadow &&
				'rounded-lg shadow ring-1 ring-black/[0.04] print:rounded-none print:shadow-none print:ring-0',
			ui.usePrintShell && 'hidden print:block',
			className
		)}
		style="
		font-size: calc({containerFontSizeInCqw} * 1cqw); 
		--background: 0 0% 100%;
		--foreground: 222.2 84% 4.9%;
		--card: 0 0% 100%;
		--card-foreground: 222.2 84% 4.9%;
		--popover: 0 0% 100%;
		--popover-foreground: 222.2 84% 4.9%;
		--primary: 221.2 83.2% 53.3%;
		--primary-foreground: 210 40% 98%;
		--secondary: 210 40% 96.1%;
		--secondary-foreground: 222.2 47.4% 11.2%;
		--muted: 210 40% 96.1%;
		--muted-foreground: 215.4 16.3% 46.9%;
		--accent: 210 40% 96.1%;
		--accent-foreground: 222.2 47.4% 11.2%;
		--destructive: 0 84.2% 50.59%;
		--destructive-foreground: 210 40% 98%;
		--border: 214.3 31.8% 91.4%;
		--input: 214.3 31.8% 91.4%;
		--ring: 221.2 83.2% 53.3%;
		--radius: 0.5rem;"
	>
		{@render children()}
	</div>
</div>
