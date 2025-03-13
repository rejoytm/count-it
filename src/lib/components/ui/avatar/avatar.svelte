<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarPrimitive.RootProps = $props();
</script>

<AvatarPrimitive.Root
	bind:ref
	class={cn(
		'relative flex size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-border/80 ring-offset-0',
		className
	)}
	{...restProps}
/>
