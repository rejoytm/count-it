<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import { getError, type Error } from '$lib/types/api.types';
	import type { CustomerCreateSchema, InvoiceCreateSchema } from '$lib/types/form.types';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import CreateForm from './(components)/create-form.svelte';
	import CreateCustomerForm from '../../customers/new/(components)/create-form.svelte';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import AddFilesSvg from '$lib/components/svg/add-files-svg.svelte';
	import EmptyState from '$lib/components/empty-state/empty-state.svelte';
	import type { Customer, Product, SalesTax } from '$lib/types/entity.types';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		products: Product[];
		salesTaxes: SalesTax[];
		customers: Customer[];
		createForm: SuperValidated<Infer<InvoiceCreateSchema>>;
		createCustomerForm: SuperValidated<Infer<CustomerCreateSchema>>;
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
		const [
			productsResponse,
			salesTaxesResponse,
			customersResponse,
			createForm,
			createCustomerForm
		] = await Promise.all([
			data.products.catch(() => undefined),
			data.salesTaxes.catch(() => undefined),
			data.customers.catch(() => undefined),
			data.createForm.catch(() => undefined),
			data.createCustomerForm.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (
			!productsResponse ||
			!salesTaxesResponse ||
			!customersResponse ||
			!createForm ||
			!createCustomerForm
		) {
			const occuredWhile = `awaiting ${!productsResponse ? 'products list' : !salesTaxesResponse ? 'sales taxes list' : !customersResponse ? 'customers list' : !createForm ? 'invoice create form' : !createCustomerForm ? 'customer create form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!productsResponse.error && !salesTaxesResponse.error && !customersResponse.error) {
			bucketError = undefined;
			bucketData = {
				products: productsResponse.data,
				salesTaxes: salesTaxesResponse.data,
				customers: customersResponse.data,
				createForm: createForm,
				createCustomerForm: createCustomerForm
			};
		} else {
			bucketError = productsResponse.error ?? salesTaxesResponse.error ?? customersResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)
		if (createForm) {
			createForm.data.invoice_date = today(getLocalTimeZone()).toString();
			createForm.data.line_items = [
				{
					product_id: '',
					description: null,
					quantity: 1,
					unit_price: 0,
					sales_tax_id: null,
					delivery_note_number: null
				}
			];
		}

		isBucketDelayed = false;
	}

	/* Runes */

	let isCreateFlyoutOpen = $state(true);
	let isCreateCustomerFlyoutOpen = $state(false);
</script>

<Panel>
	{#snippet header()}
		{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData}
			<Header navigationLink="/app/invoices">
				{#snippet heading()}
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item isMobileHidden>
								<Breadcrumb.Link href="/app/invoices">Invoices</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator isMobileHidden />
							<Breadcrumb.Item>
								<Breadcrumb.Page>New Invoice</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
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
					title="Failed to load invoice create form"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => {
						invalidate('products:all');
						invalidate('sales_taxes:all');
					}}
				/>
			</Middle>
		{:else if bucketData}
			<EmptyState
				heading="Create a new invoice"
				description="Fill out the form to create a new invoice."
			>
				{#snippet image()}
					<AddFilesSvg class="size-36" />
				{/snippet}

				{#snippet action()}
					<Button onclick={() => (isCreateFlyoutOpen = true)} size="sm">Open Form</Button>
				{/snippet}
			</EmptyState>

			<Flyout side="bottom" bind:isOpen={isCreateFlyoutOpen}>
				<CreateForm
					validatedForm={bucketData.createForm}
					onRequestCreateCustomer={() => (isCreateCustomerFlyoutOpen = true)}
					onSuccess={async (invoice_id: string) => {
						isCreateFlyoutOpen = false;
						toast.success('Invoice created successfully!');
						await goto(`/app/invoices/${invoice_id}`);
						await invalidate('invoices:all');
					}}
					products={bucketData.products}
					salesTaxes={bucketData.salesTaxes}
					customers={bucketData.customers}
					bind:isOpen={isCreateFlyoutOpen}
				/>
			</Flyout>

			<Flyout bind:isOpen={isCreateCustomerFlyoutOpen} class="min-w-[min(100%,36rem)]">
				<CreateCustomerForm
					validatedForm={bucketData.createCustomerForm}
					onSuccess={async (customer_id: string) => {
						isCreateCustomerFlyoutOpen = false;
						await goto(`/app/invoices/new?customer_id=${customer_id}`);
					}}
					products={bucketData.products}
					salesTaxes={bucketData.salesTaxes}
					bind:isOpen={isCreateCustomerFlyoutOpen}
				/>
			</Flyout>
		{/if}
	{/snippet}
</Panel>
