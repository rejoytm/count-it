import { getCustomers, getInvoices } from '$lib/database.js';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

const searchSchema = z.object({
	query: z.string().nullable(),
	page: z
		.string()
		.nullable()
		.transform((val) => (val ? parseInt(val) : 1))
		.pipe(z.number().positive())
});

export const load = async ({ url, locals, depends }) => {
	depends('invoices:all');

	const zodResult = searchSchema.safeParse({
		query: url.searchParams.get('query'),
		page: url.searchParams.get('page')
	});

	if (zodResult.error) {
		const cleanUrl = `${url.origin}${url.pathname}`;
		redirect(302, cleanUrl);
	}

	return {
		invoices: getInvoices(locals.session?.access_token, zodResult.data.page, zodResult.data.query),
		customers: getCustomers(locals.session?.access_token)
	};
};
