<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { getError, type Error } from '$lib/types/api.types';
	import { invalidateAll } from '$app/navigation';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { ActivityReportGenerateSchema } from '$lib/types/form.types';
	import RequestForm from './request-form.svelte';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	let {
		requestForm
	}: {
		requestForm: Promise<SuperValidated<Infer<ActivityReportGenerateSchema>>>;
	} = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		requestForm: SuperValidated<Infer<ActivityReportGenerateSchema>>;
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
		const [requestFormResponse] = await Promise.all([requestForm.catch(() => undefined)]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!requestFormResponse) {
			const occuredWhile = `awaiting ${!requestFormResponse ? 'activity report request form' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else {
			bucketError = undefined;
			bucketData = {
				requestForm: requestFormResponse
			};
		}

		// Define side effects (optional)
		if (bucketData) {
			bucketData.requestForm.data = {
				start_date:
					$page.url.searchParams.get('start_date') ?? bucketData.requestForm.data.start_date,
				end_date: $page.url.searchParams.get('end_date') ?? bucketData.requestForm.data.end_date
			};
		}

		isBucketDelayed = false;
	}
</script>

<Panel class={cn('md:border-r')}>
	{#snippet header()}
		<Header navigationLink="sidebar">
			{#snippet heading()}
				<h1 class="text-base font-bold leading-none">Activity Report</h1>
			{/snippet}
		</Header>
	{/snippet}

	{#snippet content()}
		{#if (isBucketTimedOut || isBucketDelayed) && !bucketData}
			<Spinner />
		{:else if bucketError}
			<div class="p-4">
				<AlertPane
					title="Failed to load activity report request form"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => invalidateAll()}
				/>
			</div>
		{:else if bucketData}
			<RequestForm validatedForm={bucketData.requestForm} />
		{/if}
	{/snippet}
</Panel>
