<script lang="ts">
	import { cn } from '$lib/utils';
	import { type Snippet } from 'svelte';
	import { COMPANY_ADDRESS, COMPANY_CONTACT_EMAIL, COMPANY_CONTACT_NUMBER } from '$lib/company';

	let { onAllImagesLoaded = () => {} }: { onAllImagesLoaded?: () => void } = $props();

	let loadedImages = 0;
	const totalImages = 1;

	function handleImageLoad() {
		loadedImages += 1;
		if (loadedImages === totalImages) {
			onAllImagesLoaded();
		}
	}
</script>

<header class="flex items-center justify-between border-b em:pb-14 em:pt-6">
	<div class="em:w-72 em:px-6">
		{@render logo()}
	</div>

	<div class="flex flex-col items-end text-right em:gap-1 em:px-6">
		{@render detail(locationIcon, COMPANY_ADDRESS)}
		{@render detail(phoneIcon, COMPANY_CONTACT_NUMBER)}
		{@render detail(mailIcon, COMPANY_CONTACT_EMAIL)}
	</div>
</header>

{#snippet logo()}
	<img loading="eager" src="/logo.svg" class="object-contain" alt="" onload={handleImageLoad} />
{/snippet}

{#snippet detail(icon: Snippet, text: string, className?: string)}
	<div class={cn('flex items-center text-muted-foreground em:gap-2.5', className)}>
		<span class="font-medium leading-none em:text-sm">{text}</span>
		{@render icon()}
	</div>
{/snippet}

{#snippet locationIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		class="shrink-0 em:size-3.5"
	>
		<path
			fill-rule="evenodd"
			d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
			clip-rule="evenodd"
		/>
	</svg>
{/snippet}

{#snippet phoneIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		class="shrink-0 em:size-3.5"
	>
		<path
			fill-rule="evenodd"
			d="m3.855 7.286 1.067-.534a1 1 0 0 0 .542-1.046l-.44-2.858A1 1 0 0 0 4.036 2H3a1 1 0 0 0-1 1v2c0 .709.082 1.4.238 2.062a9.012 9.012 0 0 0 6.7 6.7A9.024 9.024 0 0 0 11 14h2a1 1 0 0 0 1-1v-1.036a1 1 0 0 0-.848-.988l-2.858-.44a1 1 0 0 0-1.046.542l-.534 1.067a7.52 7.52 0 0 1-4.86-4.859Z"
			clip-rule="evenodd"
		/>
	</svg>
{/snippet}

{#snippet mailIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		class="shrink-0 em:size-3.5"
	>
		<path
			d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
		/>
		<path
			d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
		/>
	</svg>
{/snippet}
