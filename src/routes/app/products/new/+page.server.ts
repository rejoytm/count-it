import { message, superValidate } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { getError } from '$lib/types/api.types';
import { createProduct } from '$lib/database';
import { productCreateSchema } from '$lib/types/form.types';
import type { FormMessage } from '$lib/forms';

export const load = async () => {
	return {
		createForm: superValidate(zod(productCreateSchema))
	};
};

export const actions: Actions = {
	createProduct: async ({ request, locals }) => {
		const form = await superValidate(request, zod(productCreateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { data, error } = await createProduct(locals.session?.access_token, form.data);

		if (error) {
			const formMessage: FormMessage = {
				data: undefined,
				error: error
			};
			return message(form, formMessage, {
				status: error.statusCode
			});
		}

		const formMessage: FormMessage<{ product_id: string }> = {
			data: data,
			error: undefined
		};
		return message(form, formMessage);
	}
};
