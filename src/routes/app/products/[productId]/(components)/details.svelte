<script lang="ts">
	import { formatCurrency, getSalesTaxLabel } from '$lib/accounting';
	import DescriptionListItem from '$lib/components/description-list/description-list-item.svelte';
	import DescriptionListNullItem from '$lib/components/description-list/description-list-null-item.svelte';
	import DescriptionList from '$lib/components/description-list/description-list.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { Product } from '$lib/types/entity.types';

	let { product }: { product: Product } = $props();
</script>

<div class="@container px-4">
	<h2 class="mt-6 text-sm font-semibold">Details</h2>
	<DescriptionList class="mt-3">
		<DescriptionListItem term="Name">{product.name}</DescriptionListItem>
		<DescriptionListItem term="Category">
			{#if product.category}
				{product.category.name}
			{:else}
				<DescriptionListNullItem />
			{/if}
		</DescriptionListItem>
		<DescriptionListItem term="Selling Price">
			{#if product.unit_price}
				{formatCurrency(product.unit_price)}
			{:else}
				<DescriptionListNullItem />
			{/if}
		</DescriptionListItem>
		<DescriptionListItem term="Sales Tax">
			{#if product.sales_tax}
				{getSalesTaxLabel(product.sales_tax)}
			{:else}
				<DescriptionListNullItem />
			{/if}
		</DescriptionListItem>
		<DescriptionListItem term="Status">
			<Badge variant={product.is_archived ? 'muted' : 'blue'} class="@md:mt-0 mt-1">
				{product.is_archived ? 'Inactive' : 'Active'}
			</Badge>
		</DescriptionListItem>
	</DescriptionList>
</div>
