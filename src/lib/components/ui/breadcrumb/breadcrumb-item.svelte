<script lang="ts">
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
	bind:this={ref}
	class={cn(
		'inline-flex items-center gap-1.5',
		isMobileHidden && 'hidden md:inline-flex',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</li>
