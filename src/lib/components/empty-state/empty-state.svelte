<script lang="ts">
	import Middle from '$lib/components/layout/middle.svelte';
	import type { Snippet } from 'svelte';

	let {
		image,
		heading,
		description,
		action
	}: { image: Snippet; heading: string; description: string; action: Snippet } = $props();
</script>

<Middle class="flex flex-col text-pretty p-4 text-center text-sm">
	{@render image()}
	<p class="mt-6 font-medium">{heading}</p>
	<p class="mt-1 text-muted-foreground">{description}</p>
	<div class="mt-6">
		{@render action()}
	</div>
</Middle>
