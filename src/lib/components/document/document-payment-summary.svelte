<script lang="ts">
	import { formatCurrency } from '$lib/accounting';
	import { COMPANY_NAME, COMPANY_TRN } from '$lib/company';
	import { cn } from '$lib/utils';

	let {
		subtotal,
		salesTaxAmount,
		paidAmount
	}: {
		subtotal: number;
		salesTaxAmount: number;
		paidAmount: number;
	} = $props();
</script>

<div class="em:-mt-8 em:gap-x-20 grid break-inside-avoid grid-cols-[1fr,auto] items-end">
	<!-- Invisible row for spacing -->
	<div class="em:h-8 col-span-full"></div>

	<div class="em:p-6 border">
		<span class="font-semibold">Terms and Conditions:</span>
		<ul class="em:mt-2 em:gap-0.5 em:px-4 flex list-disc flex-col">
			<li>
				All cheques should be drawn in favor of <br />
				<span class="font-medium">
					{COMPANY_NAME.toUpperCase()}.
				</span>
			</li>
			<li>Any discrepancies in details should be notified immediately.</li>
		</ul>
	</div>

	<div class="grid grid-cols-[auto,1fr] text-right">
		{@render detail('Subtotal:', formatCurrency(subtotal))}
		{@render detail(`VAT 5% (TRN ${COMPANY_TRN}):`, formatCurrency(salesTaxAmount))}
		{#if paidAmount}
			{@render detail('Amount Paid:', formatCurrency(paidAmount))}
		{/if}
		{@render detail(
			'Amount Due:',
			formatCurrency(subtotal + salesTaxAmount - paidAmount),
			'bg-muted font-medium em:mt-2'
		)}
	</div>

	<div class="em:mt-20 em:px-6 em:py-2.5 border-t">Customer's Seal & Signature</div>
	<div class="em:mt-20 em:px-6 em:py-2.5 border-t">For {COMPANY_NAME}</div>

	<!-- Invisible row for spacing -->
	<div class="em:h-[5em] col-span-full"></div>
</div>

{#snippet detail(heading: string, description: string, className?: string)}
	<span class={cn('em:py-2.5 em:pl-6 em:pr-3', className)}> {heading} </span>
	<span class={cn('em:py-2.5 em:pl-3 em:pr-6', className)}> {description} </span>
{/snippet}
