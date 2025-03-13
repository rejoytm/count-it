<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button';
	import EditIcon from 'lucide-svelte/icons/square-pen';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import { invalidate } from '$app/navigation';
	import Middle from '$lib/components/layout/middle.svelte';
	import { getError, type Error } from '$lib/types/api.types.js';
	import type { Product, ProductCategory, SalesTax } from '$lib/types/entity.types';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { ProductUpdateSchema } from '$lib/types/form.types';
	import Details from './(components)/details.svelte';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import { toast } from 'svelte-sonner';
	import UpdateForm from './(components)/update-form.svelte';
	import { hasPermission } from '$lib/permissions';
	import { page } from '$app/stores';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		product: Product;
		salesTaxes: SalesTax[];
		categories: ProductCategory[];
		updateForm: SuperValidated<Infer<ProductUpdateSchema>>;
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
		const [productResponse, salesTaxesResponse, categoriesResponse, updateForm] = await Promise.all(
			[
				data.product.catch(() => undefined),
				data.salesTaxes.catch(() => undefined),
				data.categories.catch(() => undefined),
				data.updateForm.catch(() => undefined)
			]
		);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!productResponse || !salesTaxesResponse || !categoriesResponse || !updateForm) {
			const occuredWhile = `awaiting ${!productResponse ? 'product details' : !salesTaxesResponse ? 'sales taxes list' : !categoriesResponse ? 'product categories list' : !updateForm ? 'product update form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!productResponse.error && !salesTaxesResponse.error && !categoriesResponse.error) {
			bucketError = undefined;
			bucketData = {
				product: productResponse.data,
				salesTaxes: salesTaxesResponse.data,
				categories: categoriesResponse.data,
				updateForm: updateForm
			};
		} else {
			bucketError = productResponse.error ?? salesTaxesResponse.error ?? categoriesResponse.error;
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
			{@const product = bucketData.product}
			<Header navigationLink="/app/products">
				{#snippet heading()}
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item isMobileHidden>
								<Breadcrumb.Link href="/app/products">Products</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator isMobileHidden />
							<Breadcrumb.Item>
								<Breadcrumb.Page>{product.name}</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				{/snippet}

				{#snippet actions()}
					{#if hasPermission($page.data.permissions, 'products:update')}
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
					title="Failed to load product details"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => {
						invalidate('sales_taxes:all');
						invalidate('products:one');
						invalidate('product_categories:all');
					}}
				/>
			</Middle>
		{:else if bucketData}
			<Details product={bucketData.product} />

			<Flyout bind:isOpen={isUpdateFlyoutOpen}>
				<UpdateForm
					categories={bucketData.categories}
					salesTaxes={bucketData.salesTaxes}
					validatedForm={bucketData.updateForm}
					onSuccess={async () => {
						isUpdateFlyoutOpen = false;
						toast.success('Product updated successfully!');
						await invalidate('products:all');
						await invalidate('products:one');
					}}
					bind:isOpen={isUpdateFlyoutOpen}
				/>
			</Flyout>
		{/if}
	{/snippet}
</Panel>
