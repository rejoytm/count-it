<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import PlusIcon from 'phosphor-svelte/lib/Plus';
	import SearchIcon from 'lucide-svelte/icons/search';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Invoice } from '$lib/types/entity.types';
	import { getError, type Error, type Response } from '$lib/types/api.types';
	import InfoTile from '$lib/components/info-tile/info-tile.svelte';
	import InfoTileSkeleton from '$lib/components/info-tile/info-tile-skeleton.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import { invalidate } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';
	import { getBadgeVariantForInvoicePaymentStatus } from '$lib/accounting';
	import { capitalize } from '$lib/utils';
	import { hasPermission } from '$lib/permissions';

	let {
		invoices
	}: {
		invoices: Promise<
			Response<{
				results: Omit<Invoice, 'line_items' | 'notes' | 'created_at'>[];
				totalResultsCount: number;
			}>
		>;
	} = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		invoices: Omit<Invoice, 'line_items' | 'notes' | 'created_at'>[];
		totalResultsCount: number;
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
		const [invoicesResponse] = await Promise.all([invoices.catch(() => undefined)]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!invoicesResponse) {
			const occuredWhile = `awaiting ${!invoicesResponse ? 'invoices list' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!invoicesResponse.error) {
			bucketError = undefined;
			bucketData = {
				invoices: invoicesResponse.data.results,
				totalResultsCount: invoicesResponse.data.totalResultsCount
			};
		} else {
			bucketError = invoicesResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	/* Search */

	let search: string | undefined = $state();
	let searchDebounceTimeout: number | undefined = $state();

	onMount(() => () => clearTimeout(searchDebounceTimeout));

	function handleSearchInput(event: Event): void {
		clearTimeout(searchDebounceTimeout);
		const form = (event.currentTarget as HTMLInputElement).form;
		if (form) {
			searchDebounceTimeout = setTimeout(function () {
				form.requestSubmit();
			}, 500) as unknown as number;
		}
	}

	/* Pagination */

	let resultsPerPage = 25;
	let currentPage = $state(0);
	let totalPages = $derived(
		bucketData ? Math.ceil(bucketData.totalResultsCount / resultsPerPage) : 0
	);

	function getNthPageHref(currentUrl: URL, n: number): string {
		const url = new URL(currentUrl);
		url.searchParams.set('page', String(n));
		return url.pathname + url.search;
	}

	/* Params */

	$effect(() => {
		search = $page.url.searchParams.get('query') ?? undefined;
		let currentPageUnsafe = Number($page.url.searchParams.get('page')) ?? 1;
		currentPage = Math.max(currentPageUnsafe, 1);
	});

	/* Navigation */

	function getInvoiceHref(currentUrl: URL, invoice_id: string): string {
		const url = new URL(currentUrl);
		return `/app/invoices/${invoice_id}${url.search}`;
	}
</script>

<Panel class="md:border-r">
	{#snippet header()}
		<Header navigationLink="sidebar">
			{#snippet heading()}
				<h1 class="text-base font-bold leading-none">Invoices</h1>
			{/snippet}

			{#snippet actions()}
				{#if hasPermission($page.data.permissions, 'invoices:create')}
					<Button size="sm" href="/app/invoices/new">
						<PlusIcon weight="bold" /> New
					</Button>
				{/if}
			{/snippet}

			{#snippet content()}
				<form data-sveltekit-keepfocus>
					<div class="relative flex items-center">
						{#key currentPage}
							<Input
								name="query"
								value={search}
								oninput={handleSearchInput}
								placeholder="Type to search..."
								class="pl-9"
								autocapitalize="none"
								autocomplete="off"
								autocorrect="off"
							/>
						{/key}
						<SearchIcon class="text-muted-foreground absolute left-3 size-4" />
					</div>
				</form>
			{/snippet}
		</Header>
	{/snippet}

	{#snippet content()}
		{#snippet invoiceInfoTile(invoice: Omit<Invoice, 'line_items' | 'notes' | 'created_at'>)}
			<InfoTile
				href={getInvoiceHref($page.url, invoice.invoice_id)}
				heading={invoice.invoice_number}
				description={invoice.customer.name}
			>
				{#snippet badge()}
					<Badge variant={getBadgeVariantForInvoicePaymentStatus(invoice.payment_status)}>
						{capitalize(invoice.payment_status)}
					</Badge>
				{/snippet}
			</InfoTile>
		{/snippet}

		{#snippet noTiles()}
			<p class="text-muted-foreground p-4 text-center text-sm">No results found.</p>
		{/snippet}

		{#if isBucketTimedOut || isBucketDelayed}
			<div class="animate-in fade-in mb-6 duration-100">
				{#each { length: 25 } as _}
					<InfoTileSkeleton description badge />
				{/each}
			</div>
		{:else if bucketError}
			<div class="p-4">
				<AlertPane
					title="Failed to load invoice list"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => invalidate('invoices:all')}
				/>
			</div>
		{:else if bucketData}
			<div class="animate-in fade-in mb-6 duration-100">
				{#each bucketData.invoices as invoice}
					{@render invoiceInfoTile(invoice)}
				{/each}
				{#if !bucketData.invoices.length}
					{@render noTiles()}
				{/if}
			</div>
		{/if}
	{/snippet}

	{#snippet footer()}
		{#if bucketData}
			{@const previousPageExists = currentPage > 1}
			{@const nextPageExists = currentPage < totalPages}

			<div class="flex items-center justify-between px-4 py-3.5">
				<Button
					href={previousPageExists ? getNthPageHref($page.url, currentPage - 1) : undefined}
					size="xs"
					variant="outline"
					disabled={!previousPageExists}
					class="w-40"
				>
					Previous
				</Button>

				<p class="text-muted-foreground w-full text-center text-xs">
					Page <span class="font-medium">{currentPage}</span> of
					<span class="font-medium">{totalPages}</span>
				</p>

				<Button
					href={nextPageExists ? getNthPageHref($page.url, currentPage + 1) : undefined}
					size="xs"
					variant="outline"
					disabled={!nextPageExists}
					class="w-40"
				>
					Next
				</Button>
			</div>
		{/if}
	{/snippet}
</Panel>
