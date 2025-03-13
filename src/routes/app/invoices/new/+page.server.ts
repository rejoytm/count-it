import { createInvoice } from '$lib/database.js';
import { customerCreateSchema, invoiceCreateSchema } from '$lib/types/form.types.js';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getError } from '$lib/types/api.types';
import type { FormMessage } from '$lib/forms';
import { createCustomer } from '$lib/database.js';

export const load = async ({ locals, url, depends }) => {
	depends('customers:all');

	const customer_id = url.searchParams.get('customer_id') ?? undefined;

	return {
		createForm: superValidate({ customer_id: customer_id }, zod(invoiceCreateSchema), {
			errors: false
		}),
		createCustomerForm: superValidate(zod(customerCreateSchema))
	};
};

export const actions = {
	createInvoice: async ({ request, locals }) => {
		const form = await superValidate(request, zod(invoiceCreateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { data, error } = await createInvoice(locals.session?.access_token, form.data);

		if (error) {
			const formMessage: FormMessage = {
				data: undefined,
				error: error
			};
			return message(form, formMessage, {
				status: error.statusCode
			});
		}

		const formMessage: FormMessage<{ invoice_id: string }> = {
			data: data,
			error: undefined
		};
		return message(form, formMessage);
	},

	createCustomer: async ({ request, locals }) => {
		const form = await superValidate(request, zod(customerCreateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { data, error } = await createCustomer(locals.session?.access_token, form.data);
		if (error) {
			const formMessage: FormMessage = {
				data: undefined,
				error: error
			};
			return message(form, formMessage, {
				status: error.statusCode
			});
		}

		const formMessage: FormMessage<{ customer_id: string }> = {
			data: data,
			error: undefined
		};
		return message(form, formMessage);
	}
};
