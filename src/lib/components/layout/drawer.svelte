<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import CloseIcon from 'lucide-svelte/icons/x';
	import { cn } from '$lib/utils';

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

<Drawer.Root bind:open={isOpen} direction="top">
	<Drawer.Content
		hideHandle
		class="h-svh w-[calc(100vw-theme(spacing.4))] rounded-none p-0 md:w-[calc(100vw-theme(spacing.4))]"
	>
		{@render children()}
		<Button
			size="icon"
			variant="ghost"
			class={cn(
				'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary',
				'top-[0] data-[state=open]:bg-transparent'
			)}
		>
			<CloseIcon class="size-5" />
			<span class="sr-only">Close</span>
		</Button>
	</Drawer.Content>
</Drawer.Root>
