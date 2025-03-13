<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import NoDataIcon from 'lucide-svelte/icons/file-x-2';
	import Details from './(components)/details.svelte';
	import type { ActivityReport } from '$lib/types/entity.types';
	import { getError, type Error } from '$lib/types/api.types';
	import { invalidate } from '$app/navigation';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import Middle from '$lib/components/layout/middle.svelte';
	import Spinner from '$lib/components/spinner/spinner.svelte';
	import SuperDebug from 'sveltekit-superforms';
	import { formatDateRange } from '$lib/accounting';

	let { data } = $props();

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		activityReport: ActivityReport;
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
		const [activityReportResponse] = await Promise.all([
			data.activityReport.catch(() => undefined)
		]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!activityReportResponse) {
			const occuredWhile = `awaiting ${!activityReportResponse ? 'activity report details' : 'data'}`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!activityReportResponse.error) {
			bucketError = undefined;
			bucketData = {
				activityReport: activityReportResponse.data
			};
		} else {
			bucketError = activityReportResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)

		isBucketDelayed = false;
	}

	/* Navigation */

	function getNavigateBackHref(currentUrl: URL): string {
		const url = new URL(currentUrl);
		return `/app/activity-report${url.search}`;
	}
</script>

<Panel>
	{#snippet header()}
		{#if !isBucketTimedOut && !isBucketDelayed && !bucketError && bucketData}
			{@const activityReport = bucketData.activityReport}
			<Header navigationLink={getNavigateBackHref($page.url)}>
				{#snippet heading()}
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item isMobileHidden>
								<Breadcrumb.Link href={getNavigateBackHref($page.url)}>
									Activity Report
								</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator isMobileHidden />
							<Breadcrumb.Item>
								<Breadcrumb.Page>
									{formatDateRange(activityReport.start_date, activityReport.end_date)}
								</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				{/snippet}
			</Header>
		{/if}
	{/snippet}

	{#snippet content()}
		{#if isBucketTimedOut || isBucketDelayed}
			<Spinner />
		{:else if bucketError}
			<Middle>
				<AlertPane
					class="m-4"
					title="Failed to load activity report details"
					message={JSON.stringify(bucketError)}
					statusCode={bucketError.statusCode}
					onRetry={() => {
						invalidate('activity_report:one');
					}}
				/>
			</Middle>
		{:else if bucketData}
			{#if !bucketData.activityReport.product_insights.length}
				<Middle class="gap-3.5 text-muted-foreground">
					<NoDataIcon class="size-8" />
					<p class="text-sm">No data found for this period.</p>
				</Middle>
			{:else}
				<Details activityReport={bucketData.activityReport} />
			{/if}
		{/if}
	{/snippet}
</Panel>
