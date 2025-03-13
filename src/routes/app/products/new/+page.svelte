<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import { getError, type Error } from '$lib/types/api.types';
	import type { ProductCreateSchema } from '$lib/types/form.types';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import { toast } from 'svelte-sonner';
	import { goto, invalidate } from '$app/navigation';
	import AddFilesSvg from '$lib/components/svg/add-files-svg.svelte';
	import EmptyState from '$lib/components/empty-state/empty-state.svelte';
	import type { ProductCategory, SalesTax } from '$lib/types/entity.types';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import CreateForm from './(components)/create-form.svelte';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		salesTaxes: SalesTax[];
		categories: ProductCategory[];
		createForm: SuperValidated<Infer<ProductCreateSchema>>;
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
		const [salesTaxesResponse, categoriesResponse, createForm] = await Promise.all([
			data.salesTaxes.catch(() => undefined),
			data.categories.catch(() => undefined),
			data.createForm.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!salesTaxesResponse || !categoriesResponse || !createForm) {
			const occuredWhile = `awaiting ${!salesTaxesResponse ? 'sales taxes list' : !categoriesResponse ? 'product categories list' : !createForm ? 'product create form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!salesTaxesResponse.error && !categoriesResponse.error) {
			bucketError = undefined;
			bucketData = {
				salesTaxes: salesTaxesResponse.data,
				categories: categoriesResponse.data,
				createForm: createForm
			};
		} else {
			bucketError = salesTaxesResponse.error ?? categoriesResponse.error;
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
			<Header navigationLink="/app/products">
				{#snippet heading()}
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item isMobileHidden>
								<Breadcrumb.Link href="/app/products">Products</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator isMobileHidden />
							<Breadcrumb.Item>
								<Breadcrumb.Page>New Product</Breadcrumb.Page>
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
					title="Failed to load product create form"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => {
						invalidate('sales_taxes:all');
						invalidate('product_categories:all');
					}}
				/>
			</Middle>
		{:else if bucketData}
			<EmptyState
				heading="Create a new product"
				description="Fill out the form to create a new product."
			>
				{#snippet image()}
					<AddFilesSvg class="size-36" />
				{/snippet}

				{#snippet action()}
					<Button onclick={() => (isCreateFlyoutOpen = true)} size="sm">Open Form</Button>
				{/snippet}
			</EmptyState>

			<Flyout bind:isOpen={isCreateFlyoutOpen}>
				<CreateForm
					salesTaxes={bucketData.salesTaxes}
					categories={bucketData.categories}
					validatedForm={bucketData.createForm}
					onSuccess={async (product_id: string) => {
						isCreateFlyoutOpen = false;
						toast.success('Product created successfully!');
						await goto(`/app/products/${product_id}`);
						await invalidate('products:all');
					}}
					bind:isOpen={isCreateFlyoutOpen}
				/>
			</Flyout>
		{/if}
	{/snippet}
</Panel>
