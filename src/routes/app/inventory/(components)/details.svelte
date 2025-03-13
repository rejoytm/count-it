<script lang="ts">
	import { findProductById } from '$lib/accounting';
	import Middle from '$lib/components/layout/middle.svelte';
	import { sampleProduct } from '$lib/database';
	import type { Product, ProductInventory } from '$lib/types/entity.types';
	import List from './list.svelte';

	let {
		products,
		productInventories,
		onRequestUpdate,
		onRequestDelete
	}: {
		products: Product[];
		productInventories: ProductInventory[];
		onRequestUpdate: (product_id: string) => void;
		onRequestDelete: (product_id: string) => void;
	} = $props();

	let listItems = $derived(
		productInventories
			.map((productInventory) => ({
				product: findProductById(products, productInventory.product_id) ?? sampleProduct,
				stock: productInventory.stock,
				low_stock_threshold: productInventory.low_stock_threshold
			}))
			.filter((productInventory) => !productInventory.product.is_archived)
			.sort((a, b) => {
				if (a.product.name < b.product.name) return -1;
				if (a.product.name > b.product.name) return 1;
				return 0;
			})
	);
</script>

{#if !products.length || !productInventories.length}
	<Middle>
		<p class="text-muted-foreground text-sm">No items added.</p>
	</Middle>
{:else}
	<div class="flex flex-col gap-14 px-4 py-8">
		<List
			heading="No Stock"
			items={listItems.filter((item) => item.stock <= 0)}
			variant="red"
			{onRequestUpdate}
			{onRequestDelete}
		/>
		<List
			heading="Low Stock"
			items={listItems.filter((item) => item.stock > 0 && item.stock <= item.low_stock_threshold)}
			variant="yellow"
			{onRequestUpdate}
			{onRequestDelete}
		/>
		<List
			heading="In Stock"
			items={listItems.filter((item) => item.stock > item.low_stock_threshold)}
			variant="green"
			{onRequestUpdate}
			{onRequestDelete}
		/>
	</div>
{/if}
