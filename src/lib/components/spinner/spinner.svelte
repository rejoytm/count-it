<script lang="ts">
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';
	import Middle from '$lib/components/layout/middle.svelte';
	import { cn } from '$lib/utils';

	let { class: className, text }: { class?: string; text?: string } = $props();
</script>

<Middle class={cn('flex-col gap-2.5 text-muted-foreground', className)}>
	<SpinnerIcon class="size-6 animate-spin" weight="bold" />
	{#if text}
		<p class="text-base">{text}</p>
	{/if}
</Middle>
