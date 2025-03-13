<script lang="ts">
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLLiAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		isMobileHidden = false,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> & { isMobileHidden?: boolean } = $props();
</script>

<li
	role="presentation"
	aria-hidden="true"
	class={cn('[&>svg]:size-3.5', isMobileHidden && 'hidden md:inline-flex', className)}
	bind:this={ref}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<ChevronRight />
	{/if}
</li>
