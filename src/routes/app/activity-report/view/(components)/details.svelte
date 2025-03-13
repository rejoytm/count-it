<script lang="ts">
	import { formatCurrency, getNameInitials } from '$lib/accounting';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import DescriptionList from '$lib/components/description-list/description-list.svelte';
	import DescriptionListItem from '$lib/components/description-list/description-list-item.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type {
		ActivityReport,
		ActivityReportCustomerInsight,
		ActivityReportProductInsight
	} from '$lib/types/entity.types';

	let { activityReport }: { activityReport: ActivityReport } = $props();
</script>

<div class="@container grid gap-4 px-4 py-6 md:gap-6">
	<div class="@xl:grid-cols-2 grid gap-4 md:mt-3.5 md:gap-6">
		{@render card(
			'Total Income',
			formatCurrency(activityReport.subtotal + activityReport.sales_tax_amount),
			`incl. of sales tax ${formatCurrency(activityReport.sales_tax_amount)}`
		)}
		{@render card(
			'Total Expenses',
			formatCurrency(activityReport.expense),
			'based on recorded expenses'
		)}
	</div>

	<div class="grid gap-4">
		<div class="ring-foreground/5 rounded-xl p-6 shadow ring-1">
			<h2 class="font-semibold">Product Insights</h2>
			<p class="text-muted-foreground mt-1 text-sm">Income breakdown by product</p>
			<div class="mt-3">
				{#each activityReport.product_insights as productInsight}
					{@render productInsightTile(productInsight)}
				{/each}
			</div>
		</div>
	</div>

	<div class="ring-foreground/5 rounded-xl p-6 shadow ring-1">
		<h2 class="font-semibold">Customer Insights</h2>
		<p class="text-muted-foreground mt-1 text-sm">Summary of orders from customers</p>
		<div class="mt-9 grid gap-3">
			{#each activityReport.customer_insights as customerInsight}
				{@render customerInsightTile(customerInsight)}
			{/each}
		</div>
	</div>
</div>

{#snippet card(heading: string, detail: string, description?: string)}
	<div class="ring-foreground/5 rounded-xl p-6 shadow ring-1">
		<p class="text-sm font-medium">{heading}</p>
		<p class="mt-6 text-xl font-bold">{detail}</p>
		<p class="text-muted-foreground mt-0.5 text-sm">{description}</p>
	</div>
{/snippet}

{#snippet customerInsightTile(insight: ActivityReportCustomerInsight)}
	<div class="grid items-start gap-3.5">
		<Avatar.Root>
			<Avatar.Image src={insight.customer_image_url} />
			<Avatar.Fallback>
				{getNameInitials(insight.customer_name)}
			</Avatar.Fallback>
		</Avatar.Root>

		<div class="@container">
			<p class="text-sm font-medium">{insight.customer_name}</p>
			<DescriptionList class="mt-3">
				{#each insight.products_ordered as productOrdered}
					<DescriptionListItem term={productOrdered.product_name}>
						{productOrdered.quantity} pcs
					</DescriptionListItem>
				{/each}
				<DescriptionListItem>
					<div class="text-right">
						<p class="text-base font-semibold">
							{formatCurrency(insight.subtotal + insight.sales_tax_amount)}
						</p>
						<p class="text-muted-foreground mt-0.5 text-sm">
							incl. of sales tax {formatCurrency(insight.sales_tax_amount)}
						</p>
					</div>
				</DescriptionListItem>
			</DescriptionList>
		</div>
	</div>
{/snippet}

{#snippet productInsightTile(insight: ActivityReportProductInsight)}
	<div class="grid gap-1 border-b py-3.5 last:border-0">
		<div class="flex items-baseline justify-between gap-2">
			<p class="line-clamp-1 text-sm font-medium">
				{insight.product_name}
			</p>
			<Badge class="min-w-16 justify-center" variant="blue">{insight.quantity} sold</Badge>
		</div>
		<p class="text-muted-foreground line-clamp-1 text-sm">
			{formatCurrency(insight.subtotal + insight.sales_tax_amount)}
		</p>
	</div>
{/snippet}
