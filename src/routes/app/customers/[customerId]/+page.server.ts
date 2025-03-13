import { getCustomer, updateCustomer } from '$lib/database.js';
import type { Response } from '$lib/types/api.types.js';
import type { Customer } from '$lib/types/entity.types.js';
import {
	customerProductPricingUpdateSchema,
	customerUpdateSchema,
	type CustomerProductPricingUpdateSchema
} from '$lib/types/form.types.js';
import { message, superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getError } from '$lib/types/api.types';
import type { FormMessage } from '$lib/forms';

export const load = async ({ params, locals, depends }) => {
	depends('customers:one');

	async function getUpdateForm(customer: Promise<Response<Customer>>) {
		const customerResponse = await customer;
		if (customerResponse.error) {
			return await superValidate(zod(customerUpdateSchema));
		}

		return await superValidate(customerResponse.data, zod(customerUpdateSchema));
	}

	const customer = getCustomer(locals.session?.access_token, params.customerId);

	return {
		customer: customer,
		updateForm: getUpdateForm(customer)
	};
};

export const actions = {
	updateCustomer: async ({ request, locals }) => {
		const form = await superValidate(request, zod(customerUpdateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { error } = await updateCustomer(locals.session?.access_token, form.data);
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
