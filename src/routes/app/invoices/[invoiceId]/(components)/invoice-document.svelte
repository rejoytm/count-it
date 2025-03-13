<script lang="ts">
	import {
		calculateInvoicePaymentSummary,
		calculateLineItemSalesTaxAmount,
		calculateLineItemSubtotal,
		formatCurrency,
		formatDate
	} from '$lib/accounting';
	import DocumentHeader from '$lib/components/document/document-header.svelte';
	import DocumentMetadata from '$lib/components/document/document-metadata.svelte';
	import DocumentPaymentSummary from '$lib/components/document/document-payment-summary.svelte';
	import type { Invoice } from '$lib/types/entity.types';
	import { cn } from '$lib/utils';
	import DocumentPage from '$lib/components/document/document-page.svelte';
	import { COMPANY_CURRENCY, COMPANY_NAME } from '$lib/company';

	let {
		invoice,
		isReadyToPrint = $bindable(false)
	}: { invoice: Invoice; isReadyToPrint?: boolean } = $props();

	const paymentSummary = $derived(calculateInvoicePaymentSummary(invoice));
</script>

<DocumentPage>
	<div class="em:min-h-[85em] em:px-8 em:pt-8 print:em:min-h-0 relative flex flex-col">
		<DocumentHeader onAllImagesLoaded={() => (isReadyToPrint = true)} />

		{#snippet customerDetailsSectionContent()}
			<p class="font-medium">{invoice.customer.name}</p>
			<p>
				{#if invoice.customer.tax_registration_number}
					TRN {invoice.customer.tax_registration_number}
				{/if}
			</p>
		{/snippet}

		{#snippet invoiceDetailsSectionContent()}
			<p>Invoice No: <span class="font-medium">{invoice.invoice_number}</span></p>
			<p>Invoice Date: <span class="font-medium">{formatDate(invoice.invoice_date)}</span></p>
		{/snippet}

		<DocumentMetadata
			heading="Tax Invoice"
			sections={[
				{ heading: 'Customer Details', content: customerDetailsSectionContent },
				{ heading: 'Invoice Details', content: invoiceDetailsSectionContent }
			]}
		/>

		<table class="em:mt-6 w-full table-fixed">
			<colgroup>
				<col span="1" style="width: 1.5em;" />
				<col span="1" style="width: 40%;" />
				<col span="1" style="width: 15%;" />
				<col span="1" style="width: 15%;" />
				<col span="1" style="width: 15%;" />
				<col span="1" style="width: 15%;" />
				<col span="1" style="width: 1.5em" />
			</colgroup>

			<thead>
				<!-- Invisible row for spacing -->
				<tr><th class="em:h-8"></th></tr>

				<!-- Actual header -->
				<tr class="bg-muted text-muted-foreground border">
					<th></th>
					{@render tableHeaderCell('Items / Particulars')}
					{@render tableHeaderCell('Quantity', 'text-center')}
					{@render tableHeaderCell(`Rate (${COMPANY_CURRENCY})`, 'text-right')}
					{@render tableHeaderCell(`VAT 5% (${COMPANY_CURRENCY})`, 'text-right')}
					{@render tableHeaderCell(`Amount (${COMPANY_CURRENCY})`, 'text-right')}
					<th></th>
				</tr>
			</thead>

			<!-- Content -->
			<tbody>
				{#each invoice.line_items as lineItem}
					{@const subtotal = calculateLineItemSubtotal(lineItem)}
					{@const salesTaxAmount = calculateLineItemSalesTaxAmount(lineItem)}

					<tr class="break-inside-avoid border">
						<td></td>

						<td class="em:py-3.5 text-pretty text-left align-top">
							<p class="em:text-base font-medium !leading-tight">
								{lineItem.product.name}
							</p>

							{#if lineItem.description}
								<p class="text-muted-foreground em:mt-1 em:text-base !leading-tight">
									{lineItem.description}
								</p>
							{/if}

							{#if lineItem.delivery_note_number}
								<p class="text-muted-foreground em:mt-1 em:text-base !leading-tight">
									DN #{lineItem.delivery_note_number}
								</p>
							{/if}
						</td>

						{@render tableBodyCell(lineItem.quantity.toString(), 'text-center')}

						{@render tableBodyCell(
							formatCurrency(lineItem.unit_price, { omitCurrencyCode: true }),
							'text-right'
						)}

						{@render tableBodyCell(
							formatCurrency(salesTaxAmount, { omitCurrencyCode: true }),
							'text-right'
						)}

						{@render tableBodyCell(
							formatCurrency(subtotal + salesTaxAmount, { omitCurrencyCode: true }),
							'text-right'
						)}

						<td></td>
					</tr>
				{/each}

				{#if invoice.notes}
					<tr class="break-inside-avoid border">
						<td></td>
						<td class="em:py-3.5 text-pretty" colspan="5">
							<span class="font-medium">Notes:</span>
							<span> {invoice.notes} </span>
						</td>
						<td></td>
					</tr>
				{/if}
			</tbody>

			<tfoot>
				<!-- Invisible row for spacing -->
				<tr><td class="em:h-20"></td></tr>
			</tfoot>
		</table>

		<DocumentPaymentSummary
			subtotal={paymentSummary.subtotal}
			salesTaxAmount={paymentSummary.salesTaxAmount}
			paidAmount={paymentSummary.paidAmount}
		/>

		<!-- Actual footer -->
		<div class="em:pb-8 print:em:px-[1.965em] mt-auto print:fixed print:inset-x-0 print:bottom-0">
			<div
				class="bg-foreground text-background em:px-7 em:py-3.5 flex items-center justify-between"
			>
				<p class="em:text-sm font-medium uppercase !leading-tight tracking-wide">
					{COMPANY_NAME}
				</p>
				<p class="em:text-sm font-medium uppercase !leading-tight tracking-wide">
					Tax Invoice to {invoice.customer.name}
				</p>
			</div>
		</div>

		{#if invoice.is_void}
			<div class="bg-background/50 absolute inset-0 flex items-center justify-center">
				<span
					class="grunge border-destructive text-destructive em:-rotate-12 em:px-2.5 em:py-1 em:text-5xl absolute inline-block border-[0.5em] border-double font-bold uppercase mix-blend-multiply"
				>
					Cancelled
				</span>
			</div>
		{/if}
	</div>
</DocumentPage>

{#snippet tableHeaderCell(text: string, className?: string)}
	<th class={cn('em:py-2.5 text-left', className)}>
		<span class="em:text-sm font-medium !leading-tight"> {text} </span>
	</th>
{/snippet}

{#snippet tableBodyCell(text: string, className?: string)}
	<td class={cn('em:py-3.5 text-left align-top', className)}>
		<p class="em:text-base !leading-tight">
			{text}
		</p>
		<p class="em:text-base !leading-tight"></p>
	</td>
{/snippet}

<style>
	.grunge {
		mask-image: url('/stamp-grunge.png');
		mask-size: 50%;
	}
</style>
