<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = undefined }: Props = $props();
</script>

<div class={cn('@md:grid-cols-[min(50%,20rem),1fr] grid', className)}>
	{@render children()}
</div>
