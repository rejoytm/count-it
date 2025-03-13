<script lang="ts">
	import { cn } from '$lib/utils';
	import WarningIcon from 'phosphor-svelte/lib/WarningOctagon';

	interface Props {
		errors?: string[] | { _errors: string[] | undefined };
		description?: string;
		hideErrorIcon?: boolean;
		class?: string;
	}

	let {
		errors = undefined,
		description = undefined,
		hideErrorIcon = true,
		class: className = undefined
	}: Props = $props();
</script>

{#if errors}
	<div class={cn('mt-0.5 space-y-1 text-pretty text-sm font-medium text-destructive', className)}>
		{#each Array.isArray(errors) ? errors : errors._errors ? errors._errors : { length: 0 } as error}
			{#if error}
				<p class="items-center">
					{#if !hideErrorIcon}
						<WarningIcon class="mb-0.5 mr-1 inline-block size-4 shrink-0" weight="fill" />
					{/if}
					{error}
				</p>
			{/if}
		{/each}
	</div>
{:else if description}
	<div class={cn('mt-0.5 space-y-1 text-pretty text-sm text-muted-foreground', className)}>
		{description}
	</div>
{/if}
