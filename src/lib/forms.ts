import { superForm } from 'sveltekit-superforms';
import type { Response } from '$lib/types/api.types';

export type FormMessage<T = undefined> = Response<T>;

export function appSuperForm<
	T extends Record<string, unknown>,
	M extends FormMessage = FormMessage<undefined>,
	In extends Record<string, unknown> = T
>(...params: Parameters<typeof superForm<T, M, In>>) {
	return superForm<T, M, In>(params[0], {
		// Define defaults
		dataType: 'json',
		resetForm: false,
		invalidateAll: false,

		errorSelector: '.has-error',
		delayMs: 300,
		...params[1]
	});
}
