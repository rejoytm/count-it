import { getCustomersMinimal } from '$lib/database';

export const load = async ({ locals, depends }) => {
	depends('customers:all');

	return {
		customers: getCustomersMinimal(locals.session?.access_token)
	};
};
