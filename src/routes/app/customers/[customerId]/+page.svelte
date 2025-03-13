<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import { getError, type Error } from '$lib/types/api.types';
	import type { Customer, Product, SalesTax } from '$lib/types/entity.types.js';
	import Details from './(components)/details.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import EditIcon from 'lucide-svelte/icons/square-pen';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type {
		CustomerProductPricingUpdateSchema,
		CustomerUpdateSchema
	} from '$lib/types/form.types';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import UpdateForm from './(components)/update-form.svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { hasPermission } from '$lib/permissions';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		customer: Customer;
		products: Product[];
		salesTaxes: SalesTax[];
		updateForm: SuperValidated<Infer<CustomerUpdateSchema>>;
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
		const [customerResponse, productsResponse, salesTaxesResponse, updateForm] = await Promise.all([
			data.customer.catch(() => undefined),
			data.products.catch(() => undefined),
			data.salesTaxes.catch(() => undefined),
			data.updateForm.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!customerResponse || !productsResponse || !salesTaxesResponse || !updateForm) {
			const occuredWhile = `awaiting ${!customerResponse ? 'customer details' : !productsResponse ? 'products list' : !salesTaxesResponse ? 'sales taxes list' : !updateForm ? 'customer update form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!customerResponse.error && !productsResponse.error && !salesTaxesResponse.error) {
			bucketError = undefined;
			bucketData = {
				customer: customerResponse.data,
				products: productsResponse.data,
				salesTaxes: salesTaxesResponse.data,
				updateForm: updateForm
			};
		} else {
			bucketError = customerResponse.error ?? productsResponse.error ?? salesTaxesResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	/* Runes */

	let isUpdateFlyoutOpen = $state(false);
</script>

<Panel>
	{#snippet header()}
		{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData}
			{@const customer = bucketData.customer}
			<Header navigationLink="/app/customers">
				{#snippet heading()}
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item isMobileHidden>
								<Breadcrumb.Link href="/app/customers">Customers</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator isMobileHidden />
							<Breadcrumb.Item>
								<Breadcrumb.Page>{customer.name}</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				{/snippet}

				{#snippet actions()}
					{#if hasPermission($page.data.permissions, 'customers:update')}
						<Button onclick={() => (isUpdateFlyoutOpen = true)} size="sm" variant="outline">
							<EditIcon /> Edit
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
					title="Failed to load customer details"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => {
						invalidate('products:all');
						invalidate('sales_taxes:all');
						invalidate('customers:one');
					}}
				/>
			</Middle>
		{:else if bucketData}
			<Details
				customer={bucketData.customer}
				products={bucketData.products}
				salesTaxes={bucketData.salesTaxes}
			/>

			<Flyout bind:isOpen={isUpdateFlyoutOpen} class="min-w-[min(100%,36rem)]">
				<UpdateForm
					products={bucketData.products}
					salesTaxes={bucketData.salesTaxes}
					validatedForm={bucketData.updateForm}
					onSuccess={async () => {
						isUpdateFlyoutOpen = false;
						toast.success('Customer updated successfully!');
						await invalidate('customers:all');
						await invalidate('customers:one');
					}}
					bind:isOpen={isUpdateFlyoutOpen}
				/>
			</Flyout>
		{/if}
	{/snippet}
</Panel>
