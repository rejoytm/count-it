<script>
	import Middle from '$lib/components/layout/middle.svelte';
	import ErrorIcon from 'lucide-svelte/icons/cloud-alert';
</script>

<div class="flex min-h-svh w-full items-center justify-center bg-sidebar">
	<Middle class="gap-3.5 text-pretty text-center text-muted-foreground">
		<ErrorIcon class="size-8" />
		<p class="max-w-sm text-sm">An authentication error occurred. <br /> Please try again later.</p>
	</Middle>
</div>
