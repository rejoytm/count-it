<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SidebarTrigger } from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button';
	import GoBackIcon from 'lucide-svelte/icons/arrow-left';
	import { goto } from '$app/navigation';

	interface Props {
		heading: Snippet;
		actions?: Snippet;
		content?: Snippet;
		navigationLink?: 'sidebar' | string | null;
	}

	let {
		heading,
		actions = undefined,
		content = undefined,
		navigationLink = null
	}: Props = $props();
</script>

<header class="flex min-h-16 flex-col justify-center space-y-3.5 px-4 py-3.5">
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center">
			{#if navigationLink === 'sidebar'}
				<SidebarTrigger class="shrink-0 md:hidden" />
			{:else if typeof navigationLink === 'string'}
				<Button
					onclick={() => {
						goto(navigationLink);
					}}
					size="icon"
					variant="ghost"
					class="size-7 shrink-0 md:hidden"
				>
					<GoBackIcon />
				</Button>
			{/if}
			{#if navigationLink !== null}
				<Separator orientation="vertical" class="ml-1.5 mr-2.5 h-6 md:hidden" />
			{/if}
			{@render heading()}
		</div>

		<div class="flex min-h-9 shrink-0 items-center justify-end gap-2">
			{@render actions?.()}
		</div>
	</div>

	{@render content?.()}
</header>
