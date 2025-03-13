<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<main
	bind:this={ref}
	class={cn(
		'relative flex h-svh flex-1 flex-col bg-background',
		'overflow-hidden peer-data-[variant=inset]:h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
		'peer-data-[variant=inset]:md:ring-1 peer-data-[variant=inset]:md:ring-foreground/[0.075]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</main>
