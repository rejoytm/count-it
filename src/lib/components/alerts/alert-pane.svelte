<script lang="ts">
	import { onMount } from 'svelte';
	import { getErrorByStatusCode, type Error } from '$lib/types/api.types';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import ArrowClockwise from 'lucide-svelte/icons/rotate-cw';
	import WarningIcon from 'phosphor-svelte/lib/Warning';

	export let title: string;
	export let statusCode: number | undefined;
	export let message: string | undefined;
	export let onRetry: (() => void) | undefined;

	let apiError: Error | undefined;

	let className: string | undefined = undefined;
	export { className as class };

	onMount(tryParsingMessage);

	function tryParsingMessage() {
		if (!message) {
			return;
		}

		try {
			const parsedMessage = JSON.parse(message);
			if (isApiError(parsedMessage)) {
				apiError = parsedMessage;
			} else if (statusCode) {
				apiError = getErrorByStatusCode(statusCode);
			}
		} catch (_) {}
	}

	function isApiError(obj: any): obj is Error {
		return (
			obj &&
			typeof obj === 'object' &&
			typeof obj.errorCode === 'string' &&
			typeof obj.description === 'string' &&
			typeof obj.statusCode === 'number' &&
			typeof obj.resolution === 'string'
		);
	}
</script>

<div
	class={cn(
		'flex flex-col items-center justify-center rounded-lg border bg-background p-5 text-center animate-in fade-in slide-in-from-top-2',
		className
	)}
>
	<div
		class="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/75 dark:text-orange-500"
	>
		<WarningIcon class="size-6" weight="bold" />
	</div>

	<h3 class="mt-5 font-semibold">{title}</h3>

	<div class="mt-3 max-w-sm text-pretty text-sm text-muted-foreground">
		{#if apiError}
			<p>{apiError.description} {apiError.resolution}</p>
			<div class="mt-3">
				<div class="flex flex-wrap items-center justify-center gap-1.5">
					Error Code: <div class="rounded bg-muted px-2 py-0.5 font-mono text-xs">
						{apiError.errorCode}
					</div>
				</div>
			</div>
		{:else}
			<p>{message}</p>
		{/if}
	</div>

	{#if onRetry}
		<Button class="mt-3" variant="link" onclick={onRetry}>
			<ArrowClockwise class="mr-0.5 size-4" />
			Try Again
		</Button>
	{/if}
</div>
