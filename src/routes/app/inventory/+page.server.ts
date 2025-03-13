import {
	createProductInventory,
	deleteProductInventory,
	getProductInventories,
	updateCustomer,
	updateProductInventory
} from '$lib/database';
import type { FormMessage } from '$lib/forms';
import { getError } from '$lib/types/api.types';
import {
	productInventoryCreateSchema,
	productInventoryDeleteSchema,
	productInventoryUpdateSchema
} from '$lib/types/form.types.js';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, depends }) => {
	depends('product_inventories:all');

	return {
		productInventories: getProductInventories(locals.session?.access_token),
		createForm: superValidate(zod(productInventoryCreateSchema)),
		updateForm: superValidate(zod(productInventoryUpdateSchema)),
		deleteForm: superValidate(zod(productInventoryDeleteSchema))
	};
};

export const actions = {
	updateProductInventory: async ({ request, locals }) => {
		const form = await superValidate(request, zod(productInventoryUpdateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { error } = await updateProductInventory(locals.session?.access_token, form.data);
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
	},

	createProductInventory: async ({ request, locals }) => {
		const form = await superValidate(request, zod(productInventoryCreateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { error } = await createProductInventory(locals.session?.access_token, form.data);
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
	},

	deleteProductInventory: async ({ request, locals }) => {
		const form = await superValidate(request, zod(productInventoryDeleteSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { error } = await deleteProductInventory(locals.session?.access_token, form.data);
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
