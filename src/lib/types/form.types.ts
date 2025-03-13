import { z } from 'zod';

export function emptyStringToNull(arg: unknown) {
	if (typeof arg !== 'string') {
		return arg;
	}
	if (arg.trim() === '') {
		return null;
	}
	return arg;
}

export function nullishToNull(arg: unknown) {
	if (arg === undefined) {
		return null;
	} else if (typeof arg === 'string' && arg.trim() === '') {
		return null;
	}
	return arg;
}

export function nullToZero(arg: unknown) {
	if (typeof arg !== null) {
		return arg;
	}
	return 0;
}

function zStringNonEmpty(entity: string) {
	return z
		.string({ required_error: `${entity} is required` })
		.nonempty({ message: `${entity} is required` });
}

function zStringNullable() {
	return z.preprocess(nullishToNull, z.string().nullable());
}

function zNumberNonNegative(entity: string) {
	return z.preprocess(
		(value) => (value === '' || value == null ? null : Number(value)),
		z
			.number({ required_error: `${entity} is required` })
			.nonnegative({ message: `${entity} must be non-negative` })
	);
}

function zNumberNonNegativeNullable(entity: string) {
	return z.preprocess(
		(value) => (value === '' || value == null ? null : Number(value)),
		z
			.number()
			.nonnegative({ message: `${entity} must be non-negative` })
			.nullable()
	);
}

export const activityReportGenerateSchema = z.object({
	start_date: zStringNonEmpty('Start date'),
	end_date: zStringNonEmpty('End date')
});

export type ActivityReportGenerateSchema = typeof activityReportGenerateSchema;

export const customerStatementGenerateSchema = z.object({
	customer_id: zStringNonEmpty('Customer'),
	start_date: zStringNonEmpty('Start date'),
	end_date: zStringNonEmpty('End date'),
	paid_amount_override: zNumberNonNegativeNullable('Amount')
});

export type CustomerStatementGenerateSchema = typeof customerStatementGenerateSchema;

export const productInventoryCreateSchema = z.object({
	product_id: zStringNonEmpty('Product'),
	stock: zNumberNonNegative('Stock'),
	low_stock_threshold: zNumberNonNegative('Low stock threshold'),
	allow_sales_when_out_of_stock: z.boolean().default(true)
});

export type ProductInventoryCreateSchema = typeof productInventoryCreateSchema;

export const productInventoryUpdateSchema = productInventoryCreateSchema;

export type ProductInventoryUpdateSchema = typeof productInventoryUpdateSchema;

export const productInventoryDeleteSchema = z.object({
	product_id: zStringNonEmpty('Product')
});

export type ProductInventoryDeleteSchema = typeof productInventoryDeleteSchema;

export const invoiceLineItemSchema = z.object({
	product_id: z.string({ required_error: 'Product is required' }).nonempty('Product is required'),
	quantity: z.preprocess(nullishToNull, z.coerce.number().gt(0, 'Quantity must be greater than 0')),
	unit_price: z.preprocess(nullishToNull, z.coerce.number().gt(0, 'Price must be greater than 0')),
	sales_tax_id: z.preprocess(nullishToNull, z.string().nullable()),
	delivery_note_number: z.preprocess(nullishToNull, z.string().nullable()),
	description: z.preprocess(nullishToNull, z.string().nullable())
});

export type InvoiceLineItemSchema = typeof invoiceLineItemSchema;

export const invoiceCreateSchema = z.object({
	invoice_date: z
		.string({ required_error: 'Invoice date is required' })
		.nonempty('Invoice date is required'),
	customer_id: z
		.string({ required_error: 'Customer is required' })
		.nonempty('Customer is required'),
	line_items: invoiceLineItemSchema.array(),
	notes: z.preprocess(nullishToNull, z.string().nullable()),
	is_void: z.boolean()
});

export type InvoiceCreateSchema = typeof invoiceCreateSchema;

export const invoiceUpdateSchema = z.object({
	invoice_id: z.string({ required_error: 'Invoice is required' }).nonempty('Invoice is required'),
	invoice_number: z
		.string({ required_error: 'Invoice number is required' })
		.nonempty('Invoice number is required'),
	invoice_date: z
		.string({ required_error: 'Invoice date is required' })
		.nonempty('Invoice date is required'),
	customer_id: z
		.string({ required_error: 'Customer is required' })
		.nonempty('Customer is required'),
	line_items: invoiceLineItemSchema.array(),
	notes: z.preprocess(nullishToNull, z.string().nullable()),
	is_void: z.boolean()
});

export type InvoiceUpdateSchema = typeof invoiceUpdateSchema;

export const productPricingSchema = z.object({
	product_id: z.string({ required_error: 'Product is required' }).nonempty('Product is required'),
	unit_price: z.preprocess(nullishToNull, z.coerce.number().gt(0, 'Price must be greater than 0')),
	sales_tax_id: z.preprocess(nullishToNull, z.string().nullable())
});

export const customerCreateSchema = z.object({
	name: zStringNonEmpty('Name'),
	tax_registration_number: zStringNullable(),
	email: z.preprocess(nullishToNull, z.string().email().nullable()),
	image_url: z.preprocess(nullishToNull, z.string().url().nullable()),
	product_pricing: productPricingSchema.array()
});

export type CustomerCreateSchema = typeof customerCreateSchema;

export const customerUpdateSchema = customerCreateSchema.merge(
	z.object({
		customer_id: zStringNonEmpty('Customer'),
		is_archived: z.boolean()
	})
);

export type CustomerUpdateSchema = typeof customerUpdateSchema;

export const customerProductPricingUpdateSchema = z.object({
	customer_id: zStringNonEmpty('Customer'),
	product_pricing: z
		.object({
			product_id: z
				.string({ required_error: 'Product is required' })
				.nonempty('Product is required'),
			unit_price: z.preprocess(
				nullishToNull,
				z.coerce.number().gt(0, 'Price must be greater than 0')
			),
			sales_tax_id: z.preprocess(nullishToNull, z.string().nullable())
		})
		.array()
});

export type CustomerProductPricingUpdateSchema = typeof customerProductPricingUpdateSchema;

export const productCreateSchema = z.object({
	name: zStringNonEmpty('Name'),
	unit_price: zNumberNonNegativeNullable('Price'),
	sales_tax_id: zStringNullable(),
	category_id: zStringNullable()
});

export type ProductCreateSchema = typeof productCreateSchema;

export const productUpdateSchema = productCreateSchema.merge(
	z.object({
		product_id: zStringNonEmpty('Product'),
		is_archived: z.boolean()
	})
);

export type ProductUpdateSchema = typeof productUpdateSchema;
