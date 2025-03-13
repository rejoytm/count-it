<script lang="ts">
	import { cn } from '$lib/utils';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	interface Props {
		avatar?: boolean;
		description?: boolean;
		badge?: boolean;
	}

	let { avatar = false, description = false, badge = false }: Props = $props();
</script>

<div
	class={cn(
		'group grid grid-cols-[auto,1fr] items-end border-b px-4 py-3.5 transition focus-visible:outline-none'
	)}
>
	<div class={cn(avatar && 'mr-2.5 bg-red-500')}>
		{#if avatar}
			<Skeleton class="size-10 rounded-full" />
		{/if}
	</div>
	<div class="ml-0.5">
		<div class="flex min-h-[22px] items-center justify-between">
			<Skeleton class="h-4 w-28 rounded-full" />
			{#if badge}
				<Skeleton class="h-4 w-14 rounded-full" />
			{/if}
		</div>
		{#if description}
			<Skeleton class="mt-1.5 h-4 w-44 rounded-full" />
		{/if}
	</div>
</div>
