<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import { getError, type Error } from '$lib/types/api.types';
	import type { CustomerStatement } from '$lib/types/entity.types.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import { invalidate } from '$app/navigation';
	import StatementDocument from './(components)/statement-document.svelte';
	import NoDataIcon from 'lucide-svelte/icons/file-x-2';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import PrintIcon from 'lucide-svelte/icons/printer';
	import { openNativePrintDialog, ui } from '$lib/ui.svelte';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		statement: CustomerStatement;
	}

	let bucketData: BucketData | undefined = $state();
	let bucketError: Error | undefined = $state();
	let isBucketDelayed: boolean = $state(false);
	let isBucketTimedOut: boolean = $state(false);
	const BUCKET_DELAY_THRESHOLD_IN_MILLISECONDS = 300;
	const BUCKET_TIMEOUT_DURATION_IN_MILLISECONDS = 300;

	$effect(() => {
		bucketWait();
	});

	async function bucketWait(): Promise<void> {
		let bucketDelayTimer = setTimeout(() => {
			isBucketDelayed = true;
			isBucketTimedOut = true;
			setTimeout(() => (isBucketTimedOut = false), BUCKET_TIMEOUT_DURATION_IN_MILLISECONDS);
		}, BUCKET_DELAY_THRESHOLD_IN_MILLISECONDS);

		// Define await logic (2/3)
		const [customersResponse, statementResponse] = await Promise.all([
			data.customers.catch(() => undefined),
			data.statement.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!customersResponse || !statementResponse) {
			const occuredWhile = `awaiting ${!customersResponse ? 'customers list' : !statementResponse ? 'statement details' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!customersResponse.error && !statementResponse.error) {
			bucketError = undefined;
			bucketData = {
				statement: statementResponse.data
			};
		} else {
			bucketError = customersResponse.error ?? statementResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	/* Navigation */

	function getNavigateBackHref(currentUrl: URL): string {
		const url = new URL(currentUrl);
		return `/app/statements${url.search}`;
	}
</script>

{#if !ui.usePrintShell}
	<Panel class="printable">
		{#snippet header()}
			{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData && bucketData.statement.invoices_grouped_by_date.length}
				<Header navigationLink={getNavigateBackHref($page.url)}>
					{#snippet heading()}
						<Breadcrumb.Root>
							<Breadcrumb.List>
								<Breadcrumb.Item isMobileHidden>
									<Breadcrumb.Link href={getNavigateBackHref($page.url)}>Statements</Breadcrumb.Link
									>
								</Breadcrumb.Item>
								<Breadcrumb.Separator isMobileHidden />
								<Breadcrumb.Item>
									<Breadcrumb.Page>{bucketData!.statement.customer.name}</Breadcrumb.Page>
								</Breadcrumb.Item>
							</Breadcrumb.List>
						</Breadcrumb.Root>
					{/snippet}

					{#snippet actions()}
						{#if bucketData}
							<Button size="sm" variant="foreground" onclick={() => openNativePrintDialog()}>
								<PrintIcon />
								Print
							</Button>
						{/if}
					{/snippet}
				</Header>
			{/if}
		{/snippet}

		{#snippet content()}
			{#if isBucketTimedOut || isBucketDelayed}
				<Spinner />
			{:else if bucketError}
				<Middle>
					<AlertPane
						class="m-4"
						title="Failed to load statement details"
						message={JSON.stringify(bucketError)}
						statusCode={bucketError.statusCode}
						onRetry={() => {
							invalidate('customers:all');
							invalidate('customer_statements:one');
						}}
					/>
				</Middle>
			{:else if bucketData}
				{#if !bucketData.statement.invoices_grouped_by_date.length}
					<Middle class="gap-3.5 text-muted-foreground">
						<NoDataIcon class="size-8" />
						<p class="text-sm">No invoices found for this period.</p>
					</Middle>
				{:else}
					<div class="px-4 py-6">
						<StatementDocument statement={bucketData.statement}></StatementDocument>
					</div>
				{/if}
			{/if}
		{/snippet}
	</Panel>
{:else if bucketData}
	<StatementDocument statement={bucketData.statement}></StatementDocument>
{/if}
