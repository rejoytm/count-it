import { getProducts, getSalesTaxes } from '$lib/database';

export const load = async ({ locals, depends }) => {
	depends('products:all');
	depends('sales_taxes:all');

	return {
		products: getProducts(locals.session?.access_token),
		salesTaxes: getSalesTaxes(locals.session?.access_token)
	};
};
