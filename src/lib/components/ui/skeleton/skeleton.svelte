<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		'animate-pulse rounded-md bg-muted',
		'skeleton rounded-md bg-gradient-to-r from-slate-200/70 from-40% via-slate-100 via-50% to-slate-200/70 to-60% dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
		className
	)}
	{...restProps}
></div>

<style>
	.skeleton {
		background-size: 600%;
		background-position-x: 100%;
		animation: shimmer 2s infinite linear;
	}

	@keyframes shimmer {
		to {
			background-position-x: 0%;
		}
	}
</style>
