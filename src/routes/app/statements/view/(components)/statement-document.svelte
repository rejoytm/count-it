<script lang="ts">
	import {
		calculateCustomerStatementPaymentSummary,
		calculateLineItemSalesTaxAmount,
		calculateLineItemSubtotal,
		formatCurrency,
		formatDate
	} from '$lib/accounting';
	import DocumentHeader from '$lib/components/document/document-header.svelte';
	import DocumentMetadata from '$lib/components/document/document-metadata.svelte';
	import DocumentPage from '$lib/components/document/document-page.svelte';
	import DocumentPaymentSummary from '$lib/components/document/document-payment-summary.svelte';
	import type { CustomerStatement } from '$lib/types/entity.types';
	import { cn } from '$lib/utils';

	let {
		statement,
		isReadyToPrint = $bindable(false)
	}: {
		statement: CustomerStatement;
		isReadyToPrint?: boolean;
	} = $props();

	const paymentSummary = $derived(calculateCustomerStatementPaymentSummary(statement));
</script>

<DocumentPage>
	<div class="em:min-h-[85em] em:px-8 em:pt-8 print:em:min-h-0 flex flex-col">
		<DocumentHeader onAllImagesLoaded={() => (isReadyToPrint = true)} />

		{#snippet customerDetailsSectionContent()}
			<p class="font-medium">{statement.customer.name}</p>
			<p>
				{#if statement.customer.tax_registration_number}
					TRN {statement.customer.tax_registration_number}
				{/if}
			</p>
		{/snippet}

		{#snippet statementDetailsSectionContent()}
			<p>Start Date: <span class="font-medium">{formatDate(statement.start_date)}</span></p>
			<p>End Date: <span class="font-medium">{formatDate(statement.end_date)}</span></p>
		{/snippet}

		<DocumentMetadata
			heading="Customer Statement"
			sections={[
				{ heading: 'Customer Details', content: customerDetailsSectionContent },
				{ heading: 'Statement Details', content: statementDetailsSectionContent }
			]}
		/>

		<table class="em:mt-6 w-full table-fixed">
			<colgroup>
				<col span="1" style="width: 1.5em;" />
				<col span="1" style="width: 7.5em;" />
				<col span="1" style="width: 7.5em;" />
				<col span="1" style="width: 40%;" />
				<col span="1" style="width: 10%;" />
				<col span="1" style="width: 15%;" />
				<col span="1" style="width: 20%;" />
				<col span="1" style="width: 20%;" />
				<col span="1" style="width: 1.5em" />
			</colgroup>

			<thead>
				<!-- Invisible row for spacing -->
				<tr><th class="em:h-8"></th></tr>

				<!-- Actual header -->
				<tr class="bg-muted text-muted-foreground border">
					<th></th>
					{@render tableHeaderCell('Date')}
					{@render tableHeaderCell('Invoice #', 'text-right em:pr-8')}
					{@render tableHeaderCell('Items / Particulars')}
					{@render tableHeaderCell('Quantity', 'text-center')}
					{@render tableHeaderCell('Rate (AED)', 'text-right')}
					{@render tableHeaderCell('VAT 5% (AED)', 'text-right')}
					{@render tableHeaderCell('Amount (AED)', 'text-right')}
					<th></th>
				</tr>
			</thead>

			<!-- Content -->
			<tbody>
				{#each statement.invoices_grouped_by_date as groupedInvoices, groupIndex}
					{#each groupedInvoices as invoice, invoiceIndex}
						{#each invoice.line_items as lineItem, lineItemIndex}
							{@const subtotal = calculateLineItemSubtotal(lineItem)}
							{@const salesTaxAmount = calculateLineItemSalesTaxAmount(lineItem)}

							<tr
								class={cn(
									'break-inside-avoid border-x',
									lineItemIndex === 0 && 'border-t',
									lineItemIndex === invoice.line_items.length - 1 && 'border-b'
								)}
							>
								<td></td>

								{@render tableBodyCell(
									invoiceIndex === 0 && lineItemIndex === 0 ? formatDate(invoice.invoice_date) : ''
								)}

								{@render tableBodyCell(
									lineItemIndex === 0 ? invoice.invoice_number : '',
									'text-primary font-medium text-right em:pr-8'
								)}

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
							<tr class="em:py-3.5 break-inside-avoid text-pretty border">
								<td></td>
								<td></td>
								{@render tableBodyCell('Notes:', 'text-right em:pr-8 font-medium')}
								{@render tableBodyCell(invoice.notes, undefined, 5)}
								<td></td>
							</tr>
						{/if}
					{/each}

					<!-- Group Spacer -->
					{#if groupIndex !== statement.invoices_grouped_by_date.length - 1}
						<tr class="break-inside-avoid">
							{@render tableBodyCell('.', 'invisible')}
						</tr>
					{/if}
				{/each}
			</tbody>

			<tfoot>
				<!-- Invisible row for spacing -->
				<tr><td class="em:h-20"></td></tr>
			</tfoot>
		</table>

		<DocumentPaymentSummary
			subtotal={paymentSummary.subtotal}
			salesTaxAmount={paymentSummary.salesTaxAmount}
			paidAmount={statement.paid_amount_override !== null
				? statement.paid_amount_override
				: paymentSummary.paidAmount}
		/>

		<!-- Actual footer -->
		<div class="em:pb-8 print:em:px-[1.965em] mt-auto print:fixed print:inset-x-0 print:bottom-0">
			<div
				class="bg-foreground text-background em:px-7 em:py-3.5 flex items-center justify-between"
			>
				<p class="em:text-sm font-medium uppercase !leading-tight tracking-wide">
					Statement to {statement.customer.name}
				</p>
			</div>
		</div>
	</div>
</DocumentPage>

{#snippet tableHeaderCell(text: string, className?: string)}
	<th class={cn('em:py-2.5 text-left', className)}>
		<span class="em:text-sm font-medium !leading-tight"> {text} </span>
	</th>
{/snippet}

{#snippet tableBodyCell(text: string, className?: string, colspan?: number)}
	<td class={cn('em:py-3.5 text-left align-top', className)} colspan={colspan ?? 1}>
		<p class="em:text-base !leading-tight">
			{text}
		</p>
		<p class="em:text-base !leading-tight"></p>
	</td>
{/snippet}
