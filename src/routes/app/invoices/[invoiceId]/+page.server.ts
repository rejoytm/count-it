import { getInvoice, updateInvoice } from '$lib/database';
import type { FormMessage } from '$lib/forms';
import type { Response } from '$lib/types/api.types';
import { getError } from '$lib/types/api.types';
import type { Invoice } from '$lib/types/entity.types';
import { invoiceUpdateSchema, type InvoiceUpdateSchema } from '$lib/types/form.types';
import { message } from 'sveltekit-superforms';
import { superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ params, locals, depends }) => {
	depends('invoices:one');
	depends('customers:all');

	async function getUpdateForm(invoice: Promise<Response<Invoice>>) {
		const invoiceResponse = await invoice;
		if (invoiceResponse.error) {
			return await superValidate(zod(invoiceUpdateSchema));
		}

		const invoiceData: Infer<InvoiceUpdateSchema> = {
			invoice_id: invoiceResponse.data.invoice_id,
			invoice_number: invoiceResponse.data.invoice_number,
			invoice_date: invoiceResponse.data.invoice_date,
			customer_id: invoiceResponse.data.customer.customer_id,
			notes: invoiceResponse.data.notes,
			is_void: invoiceResponse.data.is_void,
			line_items: invoiceResponse.data.line_items.map((line_item) => ({
				product_id: line_item.product.product_id,
				quantity: line_item.quantity,
				unit_price: line_item.unit_price,
				sales_tax_id: line_item.sales_tax?.sales_tax_id ?? null,
				delivery_note_number: line_item.delivery_note_number,
				description: line_item.description
			}))
		};

		return await superValidate(invoiceData, zod(invoiceUpdateSchema));
	}

	const invoice = getInvoice(locals.session?.access_token, params.invoiceId);

	return {
		invoice: invoice,
		updateForm: getUpdateForm(invoice)
	};
};

export const actions = {
	updateInvoice: async ({ request, locals }) => {
		const form = await superValidate(request, zod(invoiceUpdateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { error } = await updateInvoice(locals.session?.access_token, form.data);

		if (error) {
			const formMessage: FormMessage = {
				data: undefined,
				error: error
			};
			return message(form, formMessage, {
				status: error.statusCode
			});
		}

		const formMessage: FormMessage = {
			data: undefined,
			error: undefined
		};
		return message(form, formMessage);
	}
};
