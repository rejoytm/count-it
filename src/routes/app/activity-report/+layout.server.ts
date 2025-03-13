import { activityReportGenerateSchema } from '$lib/types/form.types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async ({}) => {
	function dateToIso8601DateString(date: Date) {
		return date.toISOString().split('T')[0];
	}

	let today = new Date();

	return {
		requestForm: superValidate(
			{
				start_date: dateToIso8601DateString(today),
				end_date: dateToIso8601DateString(today)
			},
			zod(activityReportGenerateSchema),
			{ errors: false }
		)
	};
};
