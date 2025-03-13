import {
	type Customer,
	type CustomerStatement,
	type Invoice,
	type InvoiceLineItem,
	type InvoicePaymentStatus,
	type Product,
	type ProductPricing,
	type SalesTax
} from '$lib/types/entity.types';
import type { BadgeVariant } from '$lib/components/ui/badge';
import { COMPANY_CURRENCY } from './company';

export function roundToTwoDecimalPlaces(number: number) {
	return Math.round(number * 100) / 100;
}

export function calculateLineItemSubtotal(lineItem: InvoiceLineItem): number {
	return roundToTwoDecimalPlaces(lineItem.quantity * lineItem.unit_price);
}

export function calculateLineItemSalesTaxAmount(lineItem: InvoiceLineItem): number {
	return roundToTwoDecimalPlaces(
		lineItem.sales_tax ? lineItem.quantity * lineItem.unit_price * lineItem.sales_tax.rate : 0
	);
}

export function calculateInvoiceSubtotal(invoice: Invoice) {
	let subtotal = 0;

	invoice.line_items.forEach((lineItem) => {
		subtotal += calculateLineItemSubtotal(lineItem);
	});

	return roundToTwoDecimalPlaces(subtotal);
}

export function calculateInvoiceSalesTaxAmount(invoice: Invoice) {
	let salesTaxAmount = 0;

	invoice.line_items.forEach((lineItem) => {
		salesTaxAmount += calculateLineItemSalesTaxAmount(lineItem);
	});

	return roundToTwoDecimalPlaces(salesTaxAmount);
}

export function calculateInvoicePaymentSummary(invoice: Invoice): {
	subtotal: number;
	salesTaxAmount: number;
	paidAmount: number;
} {
	let subtotal = 0;
	let salesTaxAmount = 0;

	invoice.line_items.forEach((lineItem) => {
		subtotal += calculateLineItemSubtotal(lineItem);
		salesTaxAmount += calculateLineItemSalesTaxAmount(lineItem);
	});

	return {
		subtotal: roundToTwoDecimalPlaces(subtotal),
		salesTaxAmount: roundToTwoDecimalPlaces(salesTaxAmount),
		paidAmount: roundToTwoDecimalPlaces(invoice.paid_amount)
	};
}

export function calculateCustomerStatementPaymentSummary(statement: CustomerStatement): {
	subtotal: number;
	salesTaxAmount: number;
	paidAmount: number;
} {
	let subtotal = 0;
	let salesTaxAmount = 0;
	let paidAmount = 0;

	statement.invoices_grouped_by_date.forEach((invoiceGroup) => {
		invoiceGroup.forEach((invoice) => {
			invoice.line_items.forEach((lineItem) => {
				subtotal += calculateLineItemSubtotal(lineItem);
				salesTaxAmount += calculateLineItemSalesTaxAmount(lineItem);
			});
			paidAmount += invoice.paid_amount;
		});
	});

	return {
		subtotal: roundToTwoDecimalPlaces(subtotal),
		salesTaxAmount: roundToTwoDecimalPlaces(salesTaxAmount),
		paidAmount: roundToTwoDecimalPlaces(paidAmount)
	};
}

export function formatCurrency(amount: number, options?: { omitCurrencyCode?: boolean }): string {
	const optionsWithDefaults = {
		omitCurrencyCode: false,
		...options
	};

	const formattedAmount = formatNumber(amount);

	return `${optionsWithDefaults.omitCurrencyCode ? '' : COMPANY_CURRENCY}${formattedAmount}`;
}

export function formatNumber(amount: number | string): string {
	const parsedAmount = Number(amount);
	const validAmount = isNaN(parsedAmount) ? 0 : parsedAmount;
	const fixedAmount = validAmount.toFixed(2);
	const [integerPart, decimalPart] = fixedAmount.split('.');
	const formattedIntegerPart = parseInt(integerPart, 10).toLocaleString('en-US');
	return `${formattedIntegerPart}.${decimalPart}`;
}

export function formatDate(input: string) {
	const date = new Date(input);
	const options: any = { day: '2-digit', month: 'short', year: 'numeric' };
	const formattedDate = date.toLocaleDateString(undefined, options);
	return formattedDate === 'Invalid Date' ? '' : formattedDate;
}

export function formatDateRange(startDate: string, endDate: string): string {
	const start = new Date(startDate);
	const end = new Date(endDate);

	// Case 1: If both the start and end are in the same year
	if (start.getFullYear() === end.getFullYear()) {
		// Case 2: If both the start and end are in the same month
		if (start.getMonth() === end.getMonth()) {
			// Case 3: If both the start and end are in the same day
			if (start.getDate() === end.getDate()) {
				return formatDate(startDate); // e.g., Jan 10, 2025
			}

			// Case 4: If dates cover a full month
			const startIsFirstDayOfMonth = start.getDate() === 1;
			const endIsLastDayOfMonth =
				end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
			if (startIsFirstDayOfMonth && endIsLastDayOfMonth) {
				return `${formatDate(startDate).split(' ')[0]} ${start.getFullYear()}`; // e.g., Jan 2025
			}

			return `${formatDate(startDate).split(' ')[0]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`; // e.g., Jan 10-15, 2025
		}

		return `${formatDate(startDate).split(' ')[0]} ${start.getDate()} - ${formatDate(endDate).split(' ')[0]} ${end.getDate()}, ${end.getFullYear()}`; // e.g., Jan 10 - May 10, 2025
	}

	// Case 2: Different years
	return `${formatDate(startDate)} - ${formatDate(endDate)}`; // e.g., Jan 10, 2025 - May 10, 2026
}

export function getSalesTaxLabel(
	salesTax?: SalesTax | null,
	type: 'name' | 'abbreviation' = 'name',
	fallback?: string
) {
	return salesTax
		? `${type === 'name' ? salesTax.name : salesTax.abbreviation} ${type === 'name' ? '(' : ''}${salesTax.rate * 100}%${type === 'name' ? ')' : ''}`
		: (fallback ?? 'None');
}

export function getBadgeVariantForInvoicePaymentStatus(status: InvoicePaymentStatus): BadgeVariant {
	if (status === 'unpaid') {
		return 'red';
	} else if (status === 'partially_paid') {
		return 'yellow';
	} else if (status === 'paid' || status === 'overpaid') {
		return 'green';
	} else {
		return 'muted';
	}
}

export function findProductById(
	products: Product[],
	productId: string | null | undefined
): Product | undefined {
	if (!productId) {
		return;
	}
	return products.find((product) => product.product_id === productId);
}

export function findSalesTaxById(
	salesTaxes: SalesTax[],
	salesTaxId: string | null | undefined
): SalesTax | undefined {
	if (!salesTaxId) {
		return;
	}
	return salesTaxes.find((salesTax) => salesTax.sales_tax_id === salesTaxId);
}

export function findCustomerById<T extends { customer_id: string }>(
	customers: T[],
	customerId: string | null | undefined
): T | undefined {
	if (!customerId) {
		return;
	}
	return customers.find((customer) => customer.customer_id === customerId);
}

export function findPricingForProduct(
	productPricing: ProductPricing[],
	productId: string
): ProductPricing | undefined {
	return productPricing.find((pricing) => pricing.product_id === productId);
}

export function getMergedPricingForCustomer(
	products: Product[],
	customer: Customer | undefined
): ProductPricing[] {
	const defaultPricing = products.map((product) => ({
		product_id: product.product_id,
		unit_price: product.unit_price ?? 0,
		sales_tax_id: product.sales_tax?.sales_tax_id ?? null
	}));

	if (!customer) {
		return defaultPricing;
	}

	const specialPricing = customer.product_pricing;

	const filteredDefaultPricing = defaultPricing.filter(
		(defaultProduct) =>
			!specialPricing.some(
				(specialProduct) => specialProduct.product_id === defaultProduct.product_id
			)
	);

	return [...specialPricing, ...filteredDefaultPricing];
}

export function getNameInitials(name: string): string {
	// Strip everything after a hyphen, if present
	name = name.split('-')[0].trim();

	if (name.startsWith('Al')) {
		name = name.slice(2).trim();
	}

	return (
		name
			.match(/(^\S\S?|\s\S)?/g)
			?.map((v) => v.trim())
			.join('')
			.match(/(^\S|\S$)?/g)
			?.join('')
			.toLocaleUpperCase() ?? ''
	);
}
