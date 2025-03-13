import { getCustomerStatement } from '$lib/database.js';
import { customerStatementGenerateSchema } from '$lib/types/form.types.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, locals, depends }) => {
	depends('customer_statements:one');

	const zodResult = customerStatementGenerateSchema.safeParse({
		customer_id: url.searchParams.get('customer_id'),
		start_date: url.searchParams.get('start_date'),
		end_date: url.searchParams.get('end_date'),
		paid_amount_override: url.searchParams.get('paid_amount_override')
	});

	if (zodResult.error) {
		redirect(302, '/app/statements');
	}

	return {
		statement: getCustomerStatement(locals.session?.access_token, zodResult.data)
	};
};
