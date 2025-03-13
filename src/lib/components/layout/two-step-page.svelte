<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { cn } from '$lib/utils';
	import { ui } from '$lib/ui.svelte';

	interface Props {
		stepOne: Snippet;
		stepTwo: Snippet;
		stepTwoRoutes: string[];
		class?: string;
	}

	let { stepOne, stepTwo, stepTwoRoutes = [], class: className }: Props = $props();

	const isMobile = new IsMobile();

	function isStepTwoRoute(): boolean {
		const routeId = $page.route.id;
		return routeId ? stepTwoRoutes.some((route) => routeId.includes(route)) : false;
	}
</script>

{#if ui.usePrintShell}
	<div class={cn('size-full', className)}>
		{@render stepTwo()}
	</div>
{:else}
	<div class={cn('size-full md:grid md:grid-cols-[22rem,minmax(22rem,1fr)]', className)}>
		{#if !isMobile.current || !isStepTwoRoute()}
			{@render stepOne()}
		{/if}

		{#if !isMobile.current || isStepTwoRoute()}
			{@render stepTwo()}
		{/if}
	</div>
{/if}
