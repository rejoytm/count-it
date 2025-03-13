<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import { getError, type Error } from '$lib/types/api.types';
	import type { CustomerCreateSchema } from '$lib/types/form.types';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import CreateForm from './(components)/create-form.svelte';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import AddFilesSvg from '$lib/components/svg/add-files-svg.svelte';
	import EmptyState from '$lib/components/empty-state/empty-state.svelte';
	import type { Product, SalesTax } from '$lib/types/entity.types';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		products: Product[];
		salesTaxes: SalesTax[];
		createForm: SuperValidated<Infer<CustomerCreateSchema>>;
	}

	let bucketData: BucketData | undefined = $state();
	let bucketError: Error | undefined = $state();
	let isBucketDelayed: boolean = $state(false);
	let isBucketTimedOut: boolean = $state(false);
	const BUCKET_DELAY_THRESHOLD_IN_MILLISECONDS = 300;
	const BUCKET_TIMEOUT_DURATION_IN_MILLISECONDS = 300;

	$effect(() => {
		bucketWait();
		isCreateFlyoutOpen = true;
	});

	async function bucketWait(): Promise<void> {
		let bucketDelayTimer = setTimeout(() => {
			isBucketDelayed = true;
			isBucketTimedOut = true;
			setTimeout(() => (isBucketTimedOut = false), BUCKET_TIMEOUT_DURATION_IN_MILLISECONDS);
		}, BUCKET_DELAY_THRESHOLD_IN_MILLISECONDS);

		// Define await logic (2/3)
		const [productsResponse, salesTaxesResponse, createForm] = await Promise.all([
			data.products.catch(() => undefined),
			data.salesTaxes.catch(() => undefined),
			data.createForm.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!productsResponse || !salesTaxesResponse || !createForm) {
			const occuredWhile = `awaiting ${!productsResponse ? 'products list' : !salesTaxesResponse ? 'sales taxes list' : !createForm ? 'customer create form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!productsResponse.error && !salesTaxesResponse.error) {
			bucketError = undefined;
			bucketData = {
				products: productsResponse.data,
				salesTaxes: salesTaxesResponse.data,
				createForm: createForm
			};
		} else {
			bucketError = productsResponse.error ?? salesTaxesResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	/* Runes */

	let isCreateFlyoutOpen = $state(true);
</script>

<Panel>
	{#snippet header()}
		{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData}
			<Header navigationLink="/app/customers">
				{#snippet heading()}
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item isMobileHidden>
								<Breadcrumb.Link href="/app/customers">Customers</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator isMobileHidden />
							<Breadcrumb.Item>
								<Breadcrumb.Page>New Customer</Breadcrumb.Page>
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
					title="Failed to load customer create form"
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
				heading="Create a new customer"
				description="Fill out the form to create a new customer."
			>
				{#snippet image()}
					<AddFilesSvg class="size-36" />
				{/snippet}

				{#snippet action()}
					<Button onclick={() => (isCreateFlyoutOpen = true)} size="sm">Open Form</Button>
				{/snippet}
			</EmptyState>

			<Flyout bind:isOpen={isCreateFlyoutOpen} class="min-w-[min(100%,36rem)]">
				<CreateForm
					products={bucketData.products}
					salesTaxes={bucketData.salesTaxes}
					validatedForm={bucketData.createForm}
					onSuccess={async (customer_id: string) => {
						isCreateFlyoutOpen = false;
						toast.success('Customer created successfully!');
						await goto(`/app/customers/${customer_id}`);
						await invalidate('customers:all');
					}}
					bind:isOpen={isCreateFlyoutOpen}
				/>
			</Flyout>
		{/if}
	{/snippet}
</Panel>
