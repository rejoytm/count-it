<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from 'phosphor-svelte/lib/Plus';
	import Details from './(components)/details.svelte';
	import Flyout from '$lib/components/layout/flyout.svelte';
	import type { Product, ProductInventory } from '$lib/types/entity.types';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type {
		ProductInventoryCreateSchema,
		ProductInventoryDeleteSchema,
		ProductInventoryUpdateSchema
	} from '$lib/types/form.types';
	import { getError, type Error } from '$lib/types/api.types';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import { invalidate } from '$app/navigation';
	import UpdateForm from './(components)/update-form.svelte';
	import { toast } from 'svelte-sonner';
	import CreateForm from './(components)/create-form.svelte';
	import Dialog from '$lib/components/layout/dialog.svelte';
	import DeleteForm from './(components)/delete-form.svelte';
	import { hasPermission } from '$lib/permissions';
	import { page } from '$app/stores';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		products: Product[];
		productInventories: ProductInventory[];
		createForm: SuperValidated<Infer<ProductInventoryCreateSchema>>;
		updateForm: SuperValidated<Infer<ProductInventoryUpdateSchema>>;
		deleteForm: SuperValidated<Infer<ProductInventoryDeleteSchema>>;
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
		const [productsResponse, productInventoriesResponse, createForm, updateForm, deleteForm] =
			await Promise.all([
				data.products.catch(() => undefined),
				data.productInventories.catch(() => undefined),
				data.createForm.catch(() => undefined),
				data.updateForm.catch(() => undefined),
				data.deleteForm.catch(() => undefined)
			]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (
			!productsResponse ||
			!productInventoriesResponse ||
			!createForm ||
			!updateForm ||
			!deleteForm
		) {
			const occuredWhile = `awaiting ${!productsResponse ? 'products list' : !productInventoriesResponse ? 'inventory list' : !createForm ? 'inventory item create form' : !updateForm ? 'inventory item update form' : !deleteForm ? 'inventory item delete form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!productsResponse.error && !productInventoriesResponse.error) {
			bucketError = undefined;
			bucketData = {
				products: productsResponse.data,
				productInventories: productInventoriesResponse.data,
				createForm: createForm,
				updateForm: updateForm,
				deleteForm: deleteForm
			};
		} else {
			bucketError = productsResponse.error ?? productInventoriesResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	let isCreateFlyoutOpen = $state(false);
	let isUpdateFlyoutOpen = $state(false);
	let isDeleteDialogOpen = $state(false);

	function onRequestUpdate(productId: string) {
		if (!bucketData) {
			return;
		}

		const existingData = bucketData.productInventories.find(
			(productInventory) => productInventory.product_id === productId
		);

		if (!existingData) {
			return;
		}

		bucketData.updateForm.data = existingData;
		isUpdateFlyoutOpen = true;
	}

	function onRequestDelete(productId: string) {
		if (!bucketData) {
			return;
		}

		bucketData.deleteForm.data = { product_id: productId };
		isDeleteDialogOpen = true;
	}
</script>

<Panel>
	{#snippet header()}
		{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData}
			<Header navigationLink="sidebar">
				{#snippet heading()}
					<h1 class="font-bold">Inventory</h1>
				{/snippet}

				{#snippet actions()}
					{#if hasPermission($page.data.permissions, 'inventory:create')}
						<Button size="sm" onclick={() => (isCreateFlyoutOpen = true)}>
							<PlusIcon weight="bold" /> Add Item
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
					title="Failed to load inventory list"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => {
						invalidate('products:all');
						invalidate('product_inventories:all');
					}}
				/>
			</Middle>
		{:else if bucketData}
			<Details
				products={bucketData.products}
				productInventories={bucketData.productInventories}
				{onRequestUpdate}
				{onRequestDelete}
			/>

			<Flyout bind:isOpen={isCreateFlyoutOpen}>
				<CreateForm
					products={bucketData.products}
					previouslyAddedProductIds={bucketData.productInventories.map(
						(productInventory) => productInventory.product_id
					)}
					validatedForm={bucketData.createForm}
					onSuccess={async () => {
						isCreateFlyoutOpen = false;
						toast.success('Item added successfully!');
						await invalidate('product_inventories:all');
					}}
				/>
			</Flyout>

			<Flyout bind:isOpen={isUpdateFlyoutOpen}>
				<UpdateForm
					products={bucketData.products}
					validatedForm={bucketData.updateForm}
					onSuccess={async () => {
						isUpdateFlyoutOpen = false;
						toast.success('Item updated successfully!');
						await invalidate('product_inventories:all');
					}}
				/>
			</Flyout>

			<Dialog bind:isOpen={isDeleteDialogOpen}>
				<DeleteForm
					products={bucketData.products}
					validatedForm={bucketData.deleteForm}
					onSuccess={async () => {
						isDeleteDialogOpen = false;
						toast.success('Item deleted successfully!');
						await invalidate('product_inventories:all');
					}}
					bind:isOpen={isDeleteDialogOpen}
				/>
			</Dialog>
		{/if}
	{/snippet}
</Panel>
