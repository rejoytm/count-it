<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import { getError, type Error } from '$lib/types/api.types';
	import type { Customer, Invoice, Product, SalesTax } from '$lib/types/entity.types.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import EditIcon from 'lucide-svelte/icons/square-pen';
	import PrintIcon from 'lucide-svelte/icons/printer';
	import Panel from '$lib/components/layout/panel.svelte';
	import { page } from '$app/stores';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { InvoiceUpdateSchema } from '$lib/types/form.types';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import { Button } from '$lib/components/ui/button';
	import UpdateForm from './(components)/update-form.svelte';
	import { toast } from 'svelte-sonner';
	import InvoiceDocument from './(components)/invoice-document.svelte';
	import { openNativePrintDialog, ui } from '$lib/ui.svelte';
	import { hasPermission, type Permission } from '$lib/permissions';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		invoice: Invoice;
		products: Product[];
		salesTaxes: SalesTax[];
		customers: Customer[];
		updateForm: SuperValidated<Infer<InvoiceUpdateSchema>>;
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
		const [invoiceResponse, productsResponse, salesTaxesResponse, customersResponse, updateForm] =
			await Promise.all([
				data.invoice.catch(() => undefined),
				data.products.catch(() => undefined),
				data.salesTaxes.catch(() => undefined),
				data.customers.catch(() => undefined),
				data.updateForm.catch(() => undefined)
			]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (
			!invoiceResponse ||
			!productsResponse ||
			!salesTaxesResponse ||
			!customersResponse ||
			!updateForm
		) {
			const occuredWhile = `awaiting ${!invoiceResponse ? 'invoice details' : !productsResponse ? 'products list' : !salesTaxesResponse ? 'sales taxes list' : !customersResponse ? 'customers list' : 'invoice update form'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (
			!invoiceResponse.error &&
			!productsResponse.error &&
			!salesTaxesResponse.error &&
			!customersResponse.error
		) {
			bucketError = undefined;
			bucketData = {
				invoice: invoiceResponse.data,
				products: productsResponse.data,
				salesTaxes: salesTaxesResponse.data,
				customers: customersResponse.data,
				updateForm: updateForm
			};
		} else {
			bucketError =
				invoiceResponse.error ??
				productsResponse.error ??
				salesTaxesResponse.error ??
				customersResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	/* Navigation */

	function getNavigateBackHref(currentUrl: URL): string {
		const url = new URL(currentUrl);
		return `/app/invoices${url.search}`;
	}

	/* Runes */

	let isUpdateFlyoutOpen = $state(false);

	function hasUpdateOrUpdateConditionalPermission(
		permissions: Permission[],
		invoice: Invoice
	): boolean {
		if (hasPermission(permissions, 'invoices:update')) {
			return true;
		}

		const hasUpdateConditionalPermission = hasPermission(
			permissions,
			'invoices:update_conditional'
		);
		const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const invoiceDate = new Date(invoice.invoice_date);

		if (hasUpdateConditionalPermission && invoiceDate.getTime() >= oneWeekAgo.getTime()) {
			return true;
		}

		return false;
	}
</script>

{#if !ui.usePrintShell}
	<Panel>
		{#snippet header()}
			{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData}
				{@const invoice = bucketData.invoice}
				<Header navigationLink={getNavigateBackHref($page.url)}>
					{#snippet heading()}
						<Breadcrumb.Root>
							<Breadcrumb.List>
								<Breadcrumb.Item isMobileHidden>
									<Breadcrumb.Link href={getNavigateBackHref($page.url)}>Invoices</Breadcrumb.Link>
								</Breadcrumb.Item>
								<Breadcrumb.Separator isMobileHidden />
								<Breadcrumb.Item>
									<Breadcrumb.Page>Invoice {invoice.invoice_number}</Breadcrumb.Page>
								</Breadcrumb.Item>
							</Breadcrumb.List>
						</Breadcrumb.Root>
					{/snippet}

					{#snippet actions()}
						{#if hasUpdateOrUpdateConditionalPermission($page.data.permissions, invoice)}
							<Button onclick={() => (isUpdateFlyoutOpen = true)} size="sm" variant="outline">
								<EditIcon />
								Edit
							</Button>
						{/if}

						<Button size="sm" variant="foreground" onclick={() => openNativePrintDialog()}>
							<PrintIcon />
							Print
						</Button>
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
						title="Failed to load invoice details"
						message={JSON.stringify(bucketError)}
						statusCode={bucketError.statusCode}
						onRetry={() => {
							invalidate('products:all');
							invalidate('sales_taxes:all');
							invalidate('invoices:one');
						}}
					/>
				</Middle>
			{:else if bucketData}
				<div class="@container px-4 py-6">
					<InvoiceDocument invoice={bucketData.invoice} />
				</div>

				<Flyout side="bottom" bind:isOpen={isUpdateFlyoutOpen}>
					<UpdateForm
						products={bucketData.products}
						salesTaxes={bucketData.salesTaxes}
						customers={bucketData.customers}
						validatedForm={bucketData.updateForm}
						onSuccess={async () => {
							isUpdateFlyoutOpen = false;
							toast.success('Invoice updated successfully!');
							await invalidate('invoices:all');
							await invalidate('invoices:one');
						}}
						bind:isOpen={isUpdateFlyoutOpen}
					/>
				</Flyout>
			{/if}
		{/snippet}
	</Panel>
{:else if bucketData}
	<InvoiceDocument invoice={bucketData.invoice} />
{/if}
