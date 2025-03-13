<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Section {
		heading: string;
		content: Snippet;
	}

	let { heading, sections }: { heading: string; sections: Section[] } = $props();
</script>

<div class="grid grid-cols-3 em:mt-14 em:gap-8 em:px-6">
	<h1 class="w-full uppercase !leading-tight tracking-tight em:-translate-y-0.5 em:text-3xl">
		{heading}
	</h1>

	{#each sections as section}
		<div class="text-pretty">
			<h1 class="font-medium uppercase text-neutral-500 em:mb-2 em:text-sm">{section.heading}</h1>
			{@render section.content()}
		</div>
	{/each}
</div>
