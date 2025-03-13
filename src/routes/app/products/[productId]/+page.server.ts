import { message, superValidate, type Infer } from 'sveltekit-superforms';
import type { Actions } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { getError, type Response } from '$lib/types/api.types';
import { getProduct, updateProduct } from '$lib/database';
import { productUpdateSchema, type ProductUpdateSchema } from '$lib/types/form.types';
import type { Product } from '$lib/types/entity.types';
import type { FormMessage } from '$lib/forms';

export const load = async ({ params, locals, depends }) => {
	depends('products:one');

	async function getUpdateForm(product: Promise<Response<Product>>) {
		const productResponse = await product;
		if (productResponse.error) {
			return await superValidate(zod(productUpdateSchema));
		}

		const productData: Infer<ProductUpdateSchema> = {
			product_id: productResponse.data.product_id,
			name: productResponse.data.name,
			unit_price: productResponse.data.unit_price,
			sales_tax_id: productResponse.data.sales_tax?.sales_tax_id ?? null,
			category_id: productResponse.data.category?.category_id ?? null,
			is_archived: productResponse.data.is_archived
		};

		return await superValidate(productData, zod(productUpdateSchema));
	}

	const product = getProduct(locals.session?.access_token, params.productId);

	return {
		product: product,
		updateForm: getUpdateForm(product)
	};
};

export const actions: Actions = {
	updateProduct: async ({ request, locals }) => {
		const form = await superValidate(request, zod(productUpdateSchema));

		if (!form.valid) {
			const formMessage: FormMessage = {
				data: undefined,
				error: getError('InvalidForm')
			};
			return message(form, formMessage, {
				status: formMessage.error.statusCode
			});
		}

		const { error } = await updateProduct(locals.session?.access_token, form.data);

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
