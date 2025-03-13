<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import type { Customer } from '$lib/types/entity.types';
	import { getError, type Error, type Response } from '$lib/types/api.types';
	import { invalidate } from '$app/navigation';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { CustomerStatementGenerateSchema } from '$lib/types/form.types';
	import RequestForm from './request-form.svelte';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	let {
		customers,
		requestForm
	}: {
		customers: Promise<Response<Omit<Customer, 'product_pricing'>[]>>;
		requestForm: Promise<SuperValidated<Infer<CustomerStatementGenerateSchema>>>;
	} = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		customers: Omit<Customer, 'product_pricing'>[];
		requestForm: SuperValidated<Infer<CustomerStatementGenerateSchema>>;
	}

	let bucketData: BucketData | undefined = $state();
	let bucketError: Error | undefined = $state();
	let isBucketDelayed: boolean = $state(false);
	let isBucketTimedOut: boolean = $state(false);
	const BUCKET_DELAY_THRESHOLD_IN_MILLISECONDS = 300;
	const BUCKET_TIMEOUT_DURATION_IN_MILLISECONDS = 300;

	$effect(() => {
		bucketWait();
	});

	async function bucketWait(): Promise<void> {
		let bucketDelayTimer = setTimeout(() => {
			isBucketDelayed = true;
			isBucketTimedOut = true;
			setTimeout(() => (isBucketTimedOut = false), BUCKET_TIMEOUT_DURATION_IN_MILLISECONDS);
		}, BUCKET_DELAY_THRESHOLD_IN_MILLISECONDS);

		// Define await logic (2/3)
		const [customersResponse, requestFormResponse] = await Promise.all([
			customers.catch(() => undefined),
			requestForm.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!customersResponse || !requestFormResponse) {
			const occuredWhile = `awaiting ${!customersResponse ? 'customer list' : 'statement request form'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!customersResponse.error) {
			bucketError = undefined;
			bucketData = {
				customers: customersResponse.data,
				requestForm: requestFormResponse
			};
		} else {
			bucketError = customersResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)
		if (bucketData) {
			bucketData.requestForm.data = {
				customer_id:
					$page.url.searchParams.get('customer_id') ?? bucketData.requestForm.data.customer_id,
				start_date:
					$page.url.searchParams.get('start_date') ?? bucketData.requestForm.data.start_date,
				end_date: $page.url.searchParams.get('end_date') ?? bucketData.requestForm.data.end_date,
				paid_amount_override: null
			};
		}

		isBucketDelayed = false;
	}
</script>

<Panel class={cn('md:border-r')}>
	{#snippet header()}
		<Header navigationLink="sidebar">
			{#snippet heading()}
				<h1 class="text-base font-bold leading-none">Statements</h1>
			{/snippet}
		</Header>
	{/snippet}

	{#snippet content()}
		{#if (isBucketTimedOut || isBucketDelayed) && !bucketData}
			<Spinner />
		{:else if bucketError}
			<div class="p-4">
				<AlertPane
					title="Failed to load statement request form"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => invalidate('customers:all')}
				/>
			</div>
		{:else if bucketData}
			<RequestForm customers={bucketData.customers} validatedForm={bucketData.requestForm} />
		{/if}
	{/snippet}
</Panel>
