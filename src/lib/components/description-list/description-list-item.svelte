<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		term?: string;
		children: Snippet;
	}

	let { term, children }: Props = $props();
</script>

<div
	class="col-start-1 border-t pt-3.5 text-sm text-muted-foreground @md:py-3 md:flex md:items-center"
>
	{term ?? ''}
</div>
<div class="pb-3.5 pt-1 text-sm @md:border-t @md:py-3">
	{@render children()}
</div>
