<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PlusIcon from 'phosphor-svelte/lib/Plus';
	import SearchIcon from 'lucide-svelte/icons/search';
	import InfoTile from '$lib/components/info-tile/info-tile.svelte';
	import type { Customer } from '$lib/types/entity.types';
	import { getError, type Error, type Response } from '$lib/types/api.types';
	import { invalidate } from '$app/navigation';
	import InfoTileSkeleton from '$lib/components/info-tile/info-tile-skeleton.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import { SoupSearch } from '$lib/search.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getNameInitials } from '$lib/accounting';
	import { page } from '$app/stores';
	import { hasPermission } from '$lib/permissions';

	let {
		customers
	}: {
		customers: Promise<Response<Omit<Customer, 'product_pricing'>[]>>;
	} = $props();

	/* Search */

	let searchInput: string | undefined = $state();
	const soupSearch = new SoupSearch<Omit<Customer, 'product_pricing'>>([], ['name']);
	let filteredCustomers = $derived(soupSearch.search(searchInput));
	let activeCustomers = $derived(filteredCustomers.filter((customer) => !customer.is_archived));
	let inactiveCustomers = $derived(filteredCustomers.filter((customer) => customer.is_archived));
	let tabOfInterest: 'active' | 'inactive' = $state('active');

	$effect(() => {
		tabOfInterest = inactiveCustomers.length && !activeCustomers.length ? 'inactive' : 'active';
	});

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		customers: Omit<Customer, 'product_pricing'>[];
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
		const [customersResponse] = await Promise.all([customers.catch(() => undefined)]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!customersResponse) {
			const occuredWhile = `awaiting customer list`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!customersResponse.error) {
			bucketError = undefined;
			bucketData = {
				customers: customersResponse.data
			};
		} else {
			bucketError = customersResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)
		soupSearch.setItems(bucketData?.customers ?? []);

		isBucketDelayed = false;
	}
</script>

<Tabs.Root bind:value={tabOfInterest} activationMode="manual" class="contents">
	<Panel class="md:border-r">
		{#snippet header()}
			<Header navigationLink="sidebar">
				{#snippet heading()}
					<h1 class="text-base font-bold leading-none">Customers</h1>
				{/snippet}

				{#snippet actions()}
					{#if hasPermission($page.data.permissions, 'customers:create')}
						<Button size="sm" href="/app/customers/new">
							<PlusIcon weight="bold" /> New
						</Button>
					{/if}
				{/snippet}

				{#snippet content()}
					<div class="relative flex items-center">
						<Input
							bind:value={searchInput}
							placeholder="Type to search..."
							class="pl-9"
							autocapitalize="none"
							autocomplete="off"
							autocorrect="off"
						/>
						<SearchIcon class="absolute left-3 size-4 text-muted-foreground" />
					</div>
					<Tabs.List class="grid h-auto grid-cols-2">
						<Tabs.Trigger value="active">
							Active
							<Badge variant="outline" class="ml-2 bg-muted">{activeCustomers.length}</Badge>
						</Tabs.Trigger>
						<Tabs.Trigger value="inactive">
							Inactive
							<Badge variant="outline" class="ml-2 bg-muted">{inactiveCustomers.length}</Badge>
						</Tabs.Trigger>
					</Tabs.List>
				{/snippet}
			</Header>
		{/snippet}

		{#snippet content()}
			{#snippet customerInfoTile(customer: Omit<Customer, 'product_pricing'>)}
				<InfoTile
					href="/app/customers/{customer.customer_id}"
					heading={customer.name}
					description={customer.email ??
						(customer.tax_registration_number ? `TRN ${customer.tax_registration_number}` : '')}
				>
					{#snippet avatar()}
						<Avatar.Root>
							<Avatar.Image src={customer.image_url} alt="" />
							<Avatar.Fallback>
								{getNameInitials(customer.name)}
							</Avatar.Fallback>
						</Avatar.Root>
					{/snippet}
				</InfoTile>
			{/snippet}

			{#snippet noTiles()}
				<p class="p-4 text-center text-sm text-muted-foreground">
					{#if searchInput?.length}
						No results found.
					{:else}
						No customers available.
					{/if}
				</p>
			{/snippet}

			{#if (isBucketTimedOut || isBucketDelayed) && !bucketData}
				<div class="mb-6 duration-100 animate-in fade-in">
					{#each { length: 25 } as _}
						<InfoTileSkeleton description badge />
					{/each}
				</div>
			{:else if bucketError}
				<div class="p-4">
					<AlertPane
						title="Failed to load customer list"
						message={JSON.stringify(bucketError)}
						statusCode={bucketError.statusCode}
						onRetry={() => invalidate('customers:all')}
					/>
				</div>
			{:else if bucketData}
				<div class="mb-6 duration-100 animate-in fade-in">
					<Tabs.Content value="active" class="mt-0">
						{#each activeCustomers as customer}
							{@render customerInfoTile(customer)}
						{/each}
						{#if !activeCustomers.length}
							{@render noTiles()}
						{/if}
					</Tabs.Content>

					<Tabs.Content value="inactive" class="mt-0">
						{#each inactiveCustomers as customer}
							{@render customerInfoTile(customer)}
						{/each}
						{#if !inactiveCustomers.length}
							{@render noTiles()}
						{/if}
					</Tabs.Content>
				</div>
			{/if}
		{/snippet}
	</Panel>
</Tabs.Root>
