import { getActivityReport } from '$lib/database.js';
import { activityReportGenerateSchema } from '$lib/types/form.types.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, locals, depends }) => {
	depends('activity_report:one');

	const zodResult = activityReportGenerateSchema.safeParse({
		start_date: url.searchParams.get('start_date'),
		end_date: url.searchParams.get('end_date')
	});

	if (zodResult.error) {
		redirect(302, '/app/activity-report');
	}

	return {
		activityReport: getActivityReport(locals.session?.access_token, zodResult.data)
	};
};
