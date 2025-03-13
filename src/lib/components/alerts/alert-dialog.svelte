<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Warning } from 'phosphor-svelte';
	import { alertStore } from '$lib/components/alerts/alerter.svelte';

	$inspect(alertStore);
</script>

<AlertDialog.Root open={alertStore.isShown}>
	<AlertDialog.Content class="space-y-0 p-0">
		{#if alertStore.alert}
			<div class="p-4 sm:p-6">
				<div class="sm:flex sm:items-start">
					<div
						class="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 max-sm:mx-auto sm:size-10"
					>
						<Warning class="size-6 text-destructive" weight="bold" />
					</div>
					<div class="mt-3 w-full text-pretty text-center sm:ml-4 sm:mt-0 sm:text-left">
						<h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
							{alertStore.alert.title}
						</h3>
						<div class="mt-1 max-sm:mx-auto max-sm:max-w-sm">
							<p class="text-sm text-gray-500">
								{alertStore.alert.description}
								{alertStore.alert.resolution}
							</p>
						</div>
						{#if alertStore.alert.errorCode}
							<div class="mt-3 max-sm:mx-auto max-sm:max-w-sm">
								<div
									class="flex items-center gap-1.5 text-sm text-muted-foreground max-sm:justify-center"
								>
									Error Code: <div class="rounded bg-muted px-2 py-0.5 font-mono text-xs">
										{alertStore.alert.errorCode}
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="gap-3 bg-muted px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
				<button
					onclick={() => (alertStore.isShown = false)}
					type="button"
					class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none sm:w-auto"
				>
					Close
				</button>
			</div>
		{/if}
	</AlertDialog.Content>
</AlertDialog.Root>
