import { getCustomersMinimal } from '$lib/database';
import { customerStatementGenerateSchema } from '$lib/types/form.types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({ locals, depends }) => {
	depends('customers:all');

	function dateToIso8601DateString(date: Date) {
		return date.toISOString().split('T')[0];
	}

	let today = new Date();
	const firstDayOfPreviousMonth = new Date(
		Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
	);
	const lastDayOfPreviousMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));

	return {
		customers: getCustomersMinimal(locals.session?.access_token),
		requestForm: superValidate(
			{
				start_date: dateToIso8601DateString(firstDayOfPreviousMonth),
				end_date: dateToIso8601DateString(lastDayOfPreviousMonth)
			},
			zod(customerStatementGenerateSchema),
			{ errors: false }
		)
	};
};
