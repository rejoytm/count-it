<script lang="ts">
	import type { Alert } from '$lib/types/api.types';
	import { cn } from '$lib/utils';
	import WarningIcon from 'phosphor-svelte/lib/WarningDiamond';

	let { alert, class: className }: { alert: Alert; class?: string } = $props();

	$effect(() => {
		alert;
		alertElementRef.scrollIntoView({ block: 'center', behavior: 'smooth' });
	});

	let alertElementRef: HTMLElement;
</script>

<div
	bind:this={alertElementRef}
	class={cn(
		'flex gap-3.5 rounded-md border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700/40 dark:bg-red-950/75 dark:text-red-400',
		className
	)}
>
	<WarningIcon class="size-5 shrink-0 " weight="regular" />

	<div class="text-sm">
		<p class="font-medium">{alert.title}</p>
		<p class="mt-1 text-foreground/75">{alert.description}</p>
	</div>
</div>
