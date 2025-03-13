<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';

	interface Props {
		header?: Snippet;
		content?: Snippet;
		footer?: Snippet;
		class?: string;
		contentClass?: string;
		maxWidthClass?: string;
	}

	let {
		header,
		content,
		footer,
		class: className,
		contentClass,
		maxWidthClass = 'max-w-5xl'
	}: Props = $props();
</script>

<div class={cn('flex size-full flex-col', className)}>
	{#if header}
		<div class={cn('mx-auto -mt-px w-full', maxWidthClass)}>
			{@render header()}
		</div>
		<Separator />
	{/if}

	<ScrollArea class={cn('h-0 grow', contentClass)}>
		{#if content}
			<div class={cn('mx-auto size-full', maxWidthClass)}>
				{@render content()}
			</div>
		{/if}
	</ScrollArea>

	{#if footer}
		<Separator />
		<div class={cn('mx-auto -mb-px w-full', maxWidthClass)}>
			{@render footer()}
		</div>
	{/if}
</div>
