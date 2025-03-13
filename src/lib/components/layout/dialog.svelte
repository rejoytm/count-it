<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		isOpen = $bindable(false),
		children,
		onOpenChange
	}: {
		class?: string;
		isOpen: boolean;
		children: Snippet;
		onOpenChange?: (isOpen: boolean) => void;
	} = $props();

	$effect(() => onOpenChange?.(isOpen));
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class={cn('p-0', className)}>
		{@render children()}
	</Dialog.Content>
</Dialog.Root>
