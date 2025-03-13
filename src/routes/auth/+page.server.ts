import { fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			let message = `An authentication error occured. The system logged: ${error.code ?? 'network_error'}.`;

			if (error.code === 'invalid_credentials') {
				message = 'The email or password you entered is incorrect.';
			}

			return fail(400, { error: message });
		} else {
			redirect(303, '/app/invoices');
		}
	}
};
