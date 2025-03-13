import { createCustomer } from '$lib/database.js';
import { customerCreateSchema } from '$lib/types/form.types.js';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getError } from '$lib/types/api.types';
import type { FormMessage } from '$lib/forms';

export const load = async () => {
	return {
		createForm: superValidate(zod(customerCreateSchema))
	};
};

export const actions = {
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
