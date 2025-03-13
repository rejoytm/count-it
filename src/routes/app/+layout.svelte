<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import Shell from '$lib/components/layout/shell.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ui } from '$lib/ui.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	function beforePrint() {
		ui.usePrintShell = true;
	}

	function afterPrint() {
		ui.usePrintShell = false;
	}

	onMount(() => {
		window.addEventListener('beforeprint', beforePrint);
		window.addEventListener('afterprint', afterPrint);

		return () => {
			window.removeEventListener('beforeprint', beforePrint);
			window.removeEventListener('afterprint', afterPrint);
		};
	});
</script>

<Toaster position="bottom-right" />

<Sidebar.Provider>
	{#if ui.usePrintShell}
		{@render children()}
	{:else}
		<Shell>
			{@render children()}
		</Shell>
	{/if}
</Sidebar.Provider>
