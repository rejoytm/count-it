import { getProductCategories } from '$lib/database';

export const load = async ({ depends, locals }) => {
	depends('product_categories:all');

	return {
		categories: getProductCategories(locals.session?.access_token)
	};
};
