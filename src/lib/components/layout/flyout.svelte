<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		isOpen = $bindable(false),
		side = 'right',
		children,
		onOpenChange
	}: {
		class?: string;
		isOpen: boolean;
		side?: 'right' | 'top' | 'bottom' | 'left';
		children: Snippet;
		onOpenChange?: (isOpen: boolean) => void;
	} = $props();

	$effect(() => onOpenChange?.(isOpen));
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Content
		{side}
		hideCloseButton
		escapeKeydownBehavior="ignore"
		class={cn(
			'min-w-[min(100%,22rem)] p-0',
			side === 'bottom' && 'h-[calc(100svh-theme(spacing.4))]',
			className
		)}
	>
		{@render children()}
	</Sheet.Content>
</Sheet.Root>
