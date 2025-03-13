<script lang="ts">
	import {
		findProductById,
		findSalesTaxById,
		formatCurrency,
		getNameInitials,
		getSalesTaxLabel
	} from '$lib/accounting';
	import DescriptionListItem from '$lib/components/description-list/description-list-item.svelte';
	import DescriptionListNullItem from '$lib/components/description-list/description-list-null-item.svelte';
	import DescriptionList from '$lib/components/description-list/description-list.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import type { Customer, Product, SalesTax } from '$lib/types/entity.types';
	import { cn } from '$lib/utils';
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	let {
		products,
		salesTaxes,
		customer
	}: {
		products: Product[];
		salesTaxes: SalesTax[];
		customer: Customer;
	} = $props();
</script>

<div class="mb-6 px-4 @container">
	<h2 class="mt-6 text-sm font-semibold">Details</h2>
	<DescriptionList class="mt-3">
		<DescriptionListItem term="Name">{customer.name}</DescriptionListItem>

		<DescriptionListItem term="Tax Registration Number">
			{#if customer.tax_registration_number}
				{customer.tax_registration_number}
			{:else}
				<DescriptionListNullItem />
			{/if}
		</DescriptionListItem>

		<DescriptionListItem term="Email Address">
			{#if customer.email}
				{customer.email}
			{:else}
				<DescriptionListNullItem />
			{/if}
		</DescriptionListItem>

		<DescriptionListItem term="Profile Picture">
			{#if customer.image_url}
				<Avatar.Root class="mt-1 @md:mt-0 @md:size-6">
					<Avatar.Image src={customer.image_url} alt="" />
					<Avatar.Fallback>
						<span class="text-center text-xs">{getNameInitials(customer.name)}</span>
					</Avatar.Fallback>
				</Avatar.Root>
			{:else}
				<DescriptionListNullItem />
			{/if}
		</DescriptionListItem>

		<DescriptionListItem term="Status">
			<Badge variant={customer.is_archived ? 'muted' : 'blue'} class="mt-1 @md:mt-0">
				{customer.is_archived ? 'Inactive' : 'Active'}
			</Badge>
		</DescriptionListItem>
	</DescriptionList>

	<h2 class="mt-6 text-sm font-semibold">Special Pricing</h2>
	<DescriptionList class="mt-3">
		{#each customer.product_pricing as customer_product_pricing}
			{@const product = findProductById(products, customer_product_pricing.product_id)}
			{#if product}
				<DescriptionListItem term={product.name}>
					<div class="flex items-baseline gap-1">
						{formatCurrency(customer_product_pricing.unit_price, { omitCurrencyCode: true })}

						{#if customer_product_pricing.sales_tax_id}
							<span class="">
								+ {getSalesTaxLabel(
									findSalesTaxById(salesTaxes, customer_product_pricing.sales_tax_id),
									'abbreviation'
								)}
							</span>
						{/if}

						{#if product.unit_price}
							{@const difference = customer_product_pricing.unit_price - product.unit_price}
							{#if difference}
								<span
									class={cn(
										'ml-auto font-medium text-muted-foreground',
										difference < 0 && 'text-destructive',
										difference > 0 && 'text-green-600 dark:text-green-600'
									)}
								>
									{(difference > 0 ? '+' : '-') +
										formatCurrency(Math.abs(difference), { omitCurrencyCode: true })}
								</span>
							{/if}
						{/if}
					</div>
				</DescriptionListItem>
			{/if}
		{/each}

		{#if !customer.product_pricing.length}
			<DescriptionListItem term="No special prices added.">{''}</DescriptionListItem>
		{/if}
	</DescriptionList>
</div>
