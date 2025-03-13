<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}
	let { children, class: className = undefined }: Props = $props();
</script>

<div class={cn('flex size-full grow flex-col items-center justify-center', className)}>
	{@render children()}
</div>
