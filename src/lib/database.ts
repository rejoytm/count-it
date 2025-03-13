import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { type Response, type Error, getError } from '$lib/types/api.types';
import {
	type Customer,
	type Invoice,
	type Product,
	type ProductCategory,
	type SalesTax,
	type ProductInventory,
	type CustomerStatement,
	type CustomerStatementInvoice,
	type ActivityReport,
	type ActivityReportProductInsight,
	type ActivityReportCustomerInsight
} from '$lib/types/entity.types';
import { type Database } from '$lib/types/database.types';
import {
	type ActivityReportGenerateSchema,
	type CustomerCreateSchema,
	type CustomerStatementGenerateSchema,
	type CustomerUpdateSchema,
	type InvoiceCreateSchema,
	type InvoiceUpdateSchema,
	type ProductCreateSchema,
	type ProductInventoryCreateSchema,
	type ProductInventoryDeleteSchema,
	type ProductInventoryUpdateSchema,
	type ProductUpdateSchema
} from '$lib/types/form.types';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import type { Infer } from 'sveltekit-superforms';
import { sleep } from './utils';

export const sampleCustomer: Customer = {
	customer_id: '',
	name: 'Sample Customer',
	tax_registration_number: null,
	email: null,
	image_url: null,
	product_pricing: [],
	is_archived: true
};

export const sampleProduct: Product = {
	product_id: '',
	name: 'Sample Product',
	unit_price: 0,
	sales_tax: null,
	category: null,
	inventory: null,
	is_archived: true
};

export function createSupabaseClient(accessToken: string | undefined): SupabaseClient<Database> {
	const headers: { Authorization?: string } = {};

	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	return createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { headers }
	});
}

export async function getActivityReport(
	accessToken: string | undefined,
	request: Infer<ActivityReportGenerateSchema>
): Promise<{ data: undefined; error: Error } | { data: ActivityReport; error: undefined }> {
	console.log('@getActivityReport');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient.rpc('generate_activity_report', {
		start_date: request.start_date,
		end_date: request.end_date
	});

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error?.message,
				occuredWhile: 'generating activity report'
			})
		};
	}

	let rawData = data as {
		subtotal: number | null;
		sales_tax_amount: number | null;
		product_insights: { json_agg: ActivityReportProductInsight[] | null };
		customer_insights: { json_agg: ActivityReportCustomerInsight[] | null };
	};

	return {
		data: {
			start_date: request.start_date,
			end_date: request.end_date,
			subtotal: rawData.subtotal ?? 0,
			sales_tax_amount: rawData.sales_tax_amount ?? 0,
			expense: 0,
			product_insights: rawData.product_insights.json_agg ?? [],
			customer_insights: rawData.customer_insights.json_agg ?? []
		},
		error: undefined
	};
}

export async function getCustomerStatement(
	accessToken: string | undefined,
	request: Infer<CustomerStatementGenerateSchema>
): Promise<{ data: undefined; error: Error } | { data: CustomerStatement; error: undefined }> {
	console.log('@getCustomerStatement');
	const supabaseClient = createSupabaseClient(accessToken);

	const customer = supabaseClient
		.from('customer')
		.select('customer_id, name, tax_registration_number, email, image_url, is_archived')
		.eq('customer_id', request.customer_id)
		.single();

	const invoices = supabaseClient
		.from('invoice')
		.select(
			'invoice_number, invoice_date, line_items: invoice_line_item(line_item_id, product(product_id, name, is_archived), quantity, unit_price, sales_tax(sales_tax_id, name, abbreviation, rate, is_recoverable, is_archived), delivery_note_number, description), notes, paid_amount, is_void'
		)
		.eq('customer_id', request.customer_id)
		.eq('is_void', false)
		.gte('invoice_date', request.start_date)
		.lte('invoice_date', request.end_date)
		.order('invoice_date', { ascending: true });

	const [customerResponse, invoicesResponse] = await Promise.all([customer, invoices]);

	if (customerResponse.error || invoicesResponse.error) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: (customerResponse.error ?? invoicesResponse.error)?.message,
				occuredWhile: 'loading statement details'
			})
		};
	}

	function groupInvoicesByDate(invoices: CustomerStatementInvoice[]): CustomerStatementInvoice[][] {
		const groupedInvoices: Record<string, CustomerStatementInvoice[]> = {};

		for (const invoice of invoices) {
			const date = invoice.invoice_date;
			if (!groupedInvoices[date]) {
				groupedInvoices[date] = [];
			}
			groupedInvoices[date].push(invoice);
		}

		return Object.values(groupedInvoices);
	}

	return {
		data: {
			customer: customerResponse.data,
			start_date: request.start_date,
			end_date: request.end_date,
			paid_amount_override: request.paid_amount_override,
			invoices_grouped_by_date: groupInvoicesByDate(invoicesResponse.data)
		},
		error: undefined
	};
}

export async function getProductInventories(
	accessToken: string | undefined
): Promise<{ data: undefined; error: Error } | { data: ProductInventory[]; error: undefined }> {
	console.log('@getProductInventories');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('product_inventory')
		.select('product_id, stock, low_stock_threshold, allow_sales_when_out_of_stock');

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading inventory list'
			})
		};
	}

	return {
		data: data,
		error: undefined
	};
}

export async function getInvoices(
	accessToken: string | undefined,
	page: number = 1,
	query: string | null = null
): Promise<
	| { data: undefined; error: Error }
	| {
			data: {
				results: Omit<Invoice, 'line_items' | 'notes' | 'created_at'>[];
				totalResultsCount: number;
			};
			error: undefined;
	  }
> {
	console.log('@getInvoices');
	const supabaseClient = createSupabaseClient(accessToken);

	const limit = 25;
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	const { data, count, error } = await supabaseClient
		.from('invoice')
		.select(
			'invoice_id, invoice_number, invoice_date, customer(customer_id, name, tax_registration_number, email, image_url, is_archived), paid_amount, payment_status, is_void',
			{ count: 'estimated' }
		)
		.order('invoice_date', { ascending: query ? true : false })
		.order('invoice_number', { ascending: query ? true : false })
		.range(from, to)
		.like('invoice_number', `${query ?? ''}%`);

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading the invoice list'
			})
		};
	}

	return {
		data: {
			results: data.map((invoice) => ({
				...invoice,
				customer: invoice.customer ?? sampleCustomer
			})),
			totalResultsCount: count ?? 0
		},
		error: undefined
	};
}

export async function getInvoice(
	accessToken: string | undefined,
	invoice_id: string
): Promise<{ data: undefined; error: Error } | { data: Invoice; error: undefined }> {
	console.log('@getInvoice');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('invoice')
		.select(
			'invoice_id, invoice_number, invoice_date, customer(customer_id, name, tax_registration_number, email, image_url, is_archived), line_items: invoice_line_item(line_item_id, product(product_id, name, is_archived), quantity, unit_price, sales_tax(sales_tax_id, name, abbreviation, rate, is_recoverable, is_archived), delivery_note_number, description), notes, paid_amount, payment_status, is_void, created_at'
		)
		.eq('invoice_id', invoice_id)
		.single();

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading invoice details'
			})
		};
	}

	return {
		data: {
			...data,
			customer: data.customer ?? sampleCustomer,
			line_items: data.line_items.map((lineItem) => ({
				...lineItem,
				product: lineItem.product ?? sampleProduct
			}))
		},
		error: undefined
	};
}

export async function getCustomersMinimal(
	accessToken: string | undefined
): Promise<
	| { data: undefined; error: Error }
	| { data: Omit<Customer, 'product_pricing'>[]; error: undefined }
> {
	console.log('@getCustomersMinimal');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('customer')
		.select('customer_id, name, tax_registration_number, email, image_url, is_archived')
		.order('name');

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading the customer list'
			})
		};
	}

	return { data: data, error: undefined };
}

export async function getCustomers(
	accessToken: string | undefined
): Promise<{ data: undefined; error: Error } | { data: Customer[]; error: undefined }> {
	console.log('@getCustomers');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('customer')
		.select(
			`customer_id, name, tax_registration_number, email, image_url, product_pricing: customer_product_pricing(product_id, sales_tax_id, unit_price), is_archived`
		)
		.order('name');

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading the customer list'
			})
		};
	}

	const withFilteredProductPricing = data.map((customer) => ({
		...customer,
		product_pricing: customer.product_pricing
	}));

	return { data: withFilteredProductPricing, error: undefined };
}

export async function getCustomer(
	accessToken: string | undefined,
	customer_id: string
): Promise<{ data: undefined; error: Error } | { data: Customer; error: undefined }> {
	console.log('@getCustomer');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('customer')
		.select(
			`customer_id, name, tax_registration_number, email, image_url, product_pricing: customer_product_pricing(product_id, unit_price, sales_tax_id), is_archived`
		)
		.eq('customer_id', customer_id)
		.single();

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading customer details'
			})
		};
	}

	return { data: data, error: undefined };
}

export async function getProducts(
	accessToken: string | undefined
): Promise<{ data: undefined; error: Error } | { data: Product[]; error: undefined }> {
	console.log('@getProducts');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('product')
		.select(
			'product_id, name, unit_price, is_archived, category: product_category(category_id, name, position), sales_tax(sales_tax_id, name, abbreviation, rate, is_recoverable, is_archived), inventory: product_inventory(product_id, stock, low_stock_threshold, allow_sales_when_out_of_stock)'
		)
		.order('name');

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading the product list'
			})
		};
	}

	return { data: data, error: undefined };
}

export async function getProduct(
	accessToken: string | undefined,
	product_id: string
): Promise<{ data: undefined; error: Error } | { data: Product; error: undefined }> {
	console.log('@getProduct');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('product')
		.select(
			'product_id, name, unit_price, sales_tax(sales_tax_id, name, abbreviation, rate, is_recoverable, is_archived), category: product_category(category_id, name, position), inventory: product_inventory(product_id, stock, low_stock_threshold, allow_sales_when_out_of_stock), is_archived'
		)
		.eq('product_id', product_id)
		.single();

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading product details'
			})
		};
	}

	return { data: data, error: undefined };
}

export async function getSalesTaxes(
	accessToken: string | undefined
): Promise<{ data: undefined; error: Error } | { data: SalesTax[]; error: undefined }> {
	console.log('@getSalesTaxes');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('sales_tax')
		.select('sales_tax_id, name, abbreviation, rate, is_recoverable, is_archived')
		.order('name');

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading sales taxes'
			})
		};
	}

	return { data: data, error: undefined };
}

export async function getProductCategories(
	accessToken: string | undefined
): Promise<{ data: undefined; error: Error } | { data: ProductCategory[]; error: undefined }> {
	console.log('@getProductCategories');
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('product_category')
		.select('category_id, name, position')
		.order('position');

	if (error || !data) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'loading product categories'
			})
		};
	}

	return { data: data, error: undefined };
}

export async function createProductInventory(
	accessToken: string | undefined,
	creation: Infer<ProductInventoryCreateSchema>
): Promise<{ error: Error | undefined }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { error } = await supabaseClient.from('product_inventory').insert(creation);

	if (error) {
		return {
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'inserting a row in the inventory table'
			})
		};
	}

	return { error: undefined };
}

export async function updateProductInventory(
	accessToken: string | undefined,
	update: Infer<ProductInventoryUpdateSchema>
): Promise<{ error: Error | undefined }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { error } = await supabaseClient
		.from('product_inventory')
		.update(update)
		.eq('product_id', update.product_id);

	if (error) {
		return {
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'updating a row in the inventory table'
			})
		};
	}

	return { error: undefined };
}

export async function deleteProductInventory(
	accessToken: string | undefined,
	deletion: Infer<ProductInventoryDeleteSchema>
): Promise<{ error: Error | undefined }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { error } = await supabaseClient
		.from('product_inventory')
		.delete()
		.eq('product_id', deletion.product_id);

	if (error) {
		return {
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'deleting a row in the inventory table'
			})
		};
	}

	return { error: undefined };
}

export async function createInvoice(
	accessToken: string | undefined,
	creation: Infer<InvoiceCreateSchema>
): Promise<{ data: { invoice_id: string }; error: undefined } | { data: undefined; error: Error }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { data: invoice_id, error } = await supabaseClient.rpc('create_invoice', {
		invoice_data: creation
	});

	if (error || !invoice_id) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error?.message,
				occuredWhile: 'creating an invoice'
			})
		};
	}

	return { data: { invoice_id: invoice_id }, error: undefined };
}

export async function updateInvoice(
	accessToken: string | undefined,
	update: Infer<InvoiceUpdateSchema>
): Promise<{ error: Error | undefined }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { error } = await supabaseClient.rpc('update_invoice', { invoice_data: update });

	if (error) {
		return {
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'updating an invoice'
			})
		};
	}

	return { error: undefined };
}

export async function createCustomer(
	accessToken: string | undefined,
	creation: Infer<CustomerCreateSchema>
): Promise<Response<{ customer_id: string }>> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { data: customer_id, error } = await supabaseClient.rpc('create_customer', {
		customer_data: creation
	});

	if (error || !customer_id) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error?.message,
				occuredWhile: 'creating a customer'
			})
		};
	}

	return { data: { customer_id: customer_id }, error: undefined };
}

export async function updateCustomer(
	accessToken: string | undefined,
	update: Infer<CustomerUpdateSchema>
): Promise<{ error: Error | undefined }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { error } = await supabaseClient.rpc('update_customer', {
		customer_data: update
	});

	if (error) {
		return {
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'updating a customer'
			})
		};
	}

	return { error: undefined };
}

export async function createProduct(
	accessToken: string | undefined,
	creation: Infer<ProductCreateSchema>
): Promise<Response<{ product_id: string }>> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { data, error } = await supabaseClient
		.from('product')
		.insert({
			name: creation.name,
			unit_price: creation.unit_price,
			sales_tax_id: creation.sales_tax_id,
			category_id: creation.category_id
		})
		.select('product_id')
		.single();

	if (error) {
		return {
			data: undefined,
			error: getError('PostgrestError', {
				detail: error.message,
				occuredWhile: 'inserting a row in the product table'
			})
		};
	}

	return { data: { product_id: data.product_id }, error: undefined };
}

export async function updateProduct(
	accessToken: string | undefined,
	update: Infer<ProductUpdateSchema>
): Promise<{ error: Error | undefined }> {
	const supabaseClient = createSupabaseClient(accessToken);

	const { error: productTableError } = await supabaseClient
		.from('product')
		.update({
			name: update.name,
			unit_price: update.unit_price,
			sales_tax_id: update.sales_tax_id,
			category_id: update.category_id,
			is_archived: update.is_archived
		})
		.eq('product_id', update.product_id);

	if (productTableError) {
		return {
			error: getError('PostgrestError', {
				detail: productTableError.message,
				occuredWhile: 'updating a row in the product table'
			})
		};
	}

	return { error: undefined };
}
