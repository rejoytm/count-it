export type Product = {
	product_id: string;
	name: string;
	unit_price: number | null;
	sales_tax: SalesTax | null;
	category: ProductCategory | null;
	inventory: ProductInventory | null;
	is_archived: boolean;
};

export type ProductCategory = {
	category_id: string;
	name: string;
	position: number;
};

export type ProductInventory = {
	product_id: string;
	stock: number;
	low_stock_threshold: number;
	allow_sales_when_out_of_stock: boolean;
};

export type SalesTax = {
	sales_tax_id: string;
	name: string;
	abbreviation: string;
	rate: number;
	is_recoverable: boolean;
	is_archived: boolean;
};

export type Customer = {
	customer_id: string;
	name: string;
	tax_registration_number: string | null;
	email: string | null;
	image_url: string | null;
	product_pricing: ProductPricing[];
	is_archived: boolean;
};

export type ProductPricing = {
	product_id: string;
	unit_price: number;
	sales_tax_id: string | null;
};

export type CustomerStatement = {
	customer: Omit<Customer, 'product_pricing'>;
	start_date: string;
	end_date: string;
	paid_amount_override: number | null;
	invoices_grouped_by_date: CustomerStatementInvoice[][];
};

export type CustomerStatementInvoice = Omit<
	Invoice,
	'invoice_id' | 'customer' | 'created_at' | 'payment_status'
>;

export type ActivityReport = {
	start_date: string;
	end_date: string;
	subtotal: number;
	sales_tax_amount: number;
	expense: number;
	product_insights: ActivityReportProductInsight[];
	customer_insights: ActivityReportCustomerInsight[];
};

export type ActivityReportProductInsight = {
	product_name: string;
	product_category_name: string;
	quantity: number;
	subtotal: number;
	sales_tax_amount: number;
};

export type ActivityReportCustomerInsight = {
	customer_name: string;
	customer_image_url: string | null;
	products_ordered: {
		product_name: string;
		quantity: number;
	}[];
	subtotal: number;
	sales_tax_amount: number;
};

export type Invoice = {
	invoice_id: string;
	invoice_number: string;
	invoice_date: string;
	customer: Omit<Customer, 'product_pricing'>;
	line_items: InvoiceLineItem[];
	notes: string | null;
	paid_amount: number;
	payment_status: InvoicePaymentStatus;
	created_at: string;
	is_void: boolean;
};

export type InvoicePaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overpaid';

export type InvoiceLineItem = {
	line_item_id: string;
	product: Omit<Product, 'unit_price' | 'sales_tax' | 'category' | 'inventory'>;
	quantity: number;
	unit_price: number;
	sales_tax: SalesTax | null;
	delivery_note_number: string | null;
	description: string | null;
};
