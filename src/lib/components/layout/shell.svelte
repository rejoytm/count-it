<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<AppSidebar />
<Sidebar.Inset>
	{@render children?.()}
</Sidebar.Inset>
