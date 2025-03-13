import type { ErrorStatus } from 'sveltekit-superforms';

export type ErrorCode =
	| 'UnexpectedError'
	| 'ClientError'
	| 'InternalError'
	| 'NoAuthorization'
	| 'InvalidForm'
	| 'PostgrestError'
	| 'FetchFailed';

export interface Error {
	errorCode: ErrorCode;
	description: string;
	statusCode: ErrorStatus;
	resolution: string;
	dynamicDescription?: (detail?: string, occuredWhile?: string) => string;
}

export const errors: { [key in ErrorCode]: Error } = {
	UnexpectedError: {
		errorCode: 'UnexpectedError',
		description: 'An unknown error occurred.',
		statusCode: 500,
		resolution:
			'Please refresh the page or try again later. If the problem persists, contact support.',
		dynamicDescription: (detail?: string, occuredWhile?: string) =>
			(occuredWhile
				? `A unexpected error occurred while ${occuredWhile}.`
				: 'A unexpected error occurred.') + (detail ? ` The system logged: ${detail}.` : '')
	},

	ClientError: {
		errorCode: 'ClientError',
		description: 'There was an issue with your request.',
		statusCode: 400,
		resolution:
			'Review your request for any missing or incorrect details, then try again. If the problem persists, contact support.'
	},
	InternalError: {
		errorCode: 'InternalError',
		description: 'An internal error occurred while processing your request.',
		statusCode: 500,
		resolution: 'Please try again later. If the issue continues, contact support.',
		dynamicDescription: (detail?: string, occuredWhile?: string) =>
			(occuredWhile
				? `An internal error occurred while ${occuredWhile}.`
				: 'An internal error occurred.') + (detail ? ` The system logged: ${detail}.` : '')
	},
	NoAuthorization: {
		errorCode: 'NoAuthorization',
		description: 'You are not logged in.',
		statusCode: 401,
		resolution: 'Please log in to access this resource.'
	},
	InvalidForm: {
		errorCode: 'InvalidForm',
		description: 'The form submission is invalid.',
		statusCode: 400,
		resolution:
			'Please ensure all required fields are filled out and conform to the expected format.'
	},
	FetchFailed: {
		errorCode: 'FetchFailed',
		description: 'Database connection could not be established.',
		statusCode: 503,
		resolution:
			'Please check your network connection and try again. If the problem persists, the database might be down temporarily.',
		dynamicDescription: (detail?: string, occuredWhile?: string) =>
			occuredWhile
				? `A database connection could not be established while ${occuredWhile}.`
				: 'Failed to connect to the database.'
	},
	PostgrestError: {
		errorCode: 'PostgrestError',
		description: 'A database error occurred.',
		statusCode: 500,
		resolution: 'Please try again later. If the problem persists, contact support.',
		dynamicDescription: (detail?: string, occuredWhile?: string) =>
			(occuredWhile
				? `A database error occurred while ${occuredWhile}.`
				: 'A database error occurred.') + (detail ? ` The system logged: ${detail}.` : '')
	}
};

export function getError(
	errorCode: ErrorCode,
	dynamicDescriptionInput?: {
		detail?: string;
		occuredWhile?: string;
	}
): Error {
	let error = errors[errorCode] ?? errors['UnexpectedError'];

	if (dynamicDescriptionInput?.detail === 'TypeError: fetch failed') {
		error = errors['FetchFailed'];
	}

	const errorWithoutFunctions: Error = {
		errorCode: error.errorCode,
		statusCode: error.statusCode,
		resolution: error.resolution,
		description:
			error.dynamicDescription && dynamicDescriptionInput
				? error.dynamicDescription(
						dynamicDescriptionInput.detail,
						dynamicDescriptionInput.occuredWhile
					)
				: error.description
	};

	return errorWithoutFunctions;
}

export function getErrorByStatusCode(statusCode: number): Error {
	let error: Error;

	if (statusCode >= 400 && statusCode < 500) {
		error = errors.ClientError;
	} else if (statusCode >= 500 && statusCode < 600) {
		error = errors.InternalError;
	} else {
		error = errors.UnexpectedError;
	}

	return error;
}

export type Response<T> = { data: T; error: undefined } | { data: undefined; error: Error };

export type Toast = {
	type: 'message' | 'success' | 'info' | 'warning' | 'error';
	title: string;
	description?: string;
	resolution?: string;
};

export type Alert = {
	type: 'warning' | 'error';
	title: string;
	description: string;
	resolution?: string;
	errorCode: string;
};
