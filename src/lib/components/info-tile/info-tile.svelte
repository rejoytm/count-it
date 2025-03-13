<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		heading: string;
		description?: string;
		avatar?: Snippet;
		badge?: Snippet;
	}

	let {
		avatar = undefined,
		heading,
		description = undefined,
		badge = undefined,
		href = '#'
	}: Props = $props();

	let isActive = $derived($page.url.toString().includes(href));
</script>

<a
	{href}
	class={cn(
		'group grid grid-cols-[auto,1fr] items-center border-b px-4 py-3.5 transition focus-visible:outline-none',
		isActive && 'bg-muted'
	)}
>
	<div class={cn(avatar && 'mr-2.5')}>
		{@render avatar?.()}
	</div>

	<div class="ml-0.5">
		<div class="flex min-h-[22px] items-baseline justify-between">
			<p
				class="line-clamp-1 text-sm font-medium leading-6 group-hover:underline group-focus-visible:underline"
			>
				{heading}
			</p>
			{@render badge?.()}
		</div>

		{#if description}
			<p class="line-clamp-1 text-sm text-muted-foreground">{description}</p>
		{/if}
	</div>
</a>
