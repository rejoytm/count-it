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
	import type { Product } from '$lib/types/entity.types';
	import { getError, type Error } from '$lib/types/api.types';
	import { invalidate } from '$app/navigation';
	import InfoTileSkeleton from '$lib/components/info-tile/info-tile-skeleton.svelte';
	import AlertPane from '$lib/components/alerts/alert-pane.svelte';
	import { SoupSearch } from '$lib/search.svelte';
	import { formatCurrency } from '$lib/accounting';
	import { hasPermission } from '$lib/permissions';
	import { page } from '$app/stores';

	let { data } = $props();

	/* Search */

	let searchInput: string | undefined = $state();
	const soupSearch = new SoupSearch<Product>([], ['name']);
	let filteredProducts = $derived(soupSearch.search(searchInput));
	let activeProducts = $derived(filteredProducts.filter((product) => !product.is_archived));
	let inactiveProducts = $derived(filteredProducts.filter((product) => product.is_archived));
	let tabOfInterest: 'active' | 'inactive' = $state('active');

	$effect(() => {
		tabOfInterest = inactiveProducts.length && !activeProducts.length ? 'inactive' : 'active';
	});

	/* Bucket */

	// Define bucket's data shape (1/3)
	interface BucketData {
		products: Product[];
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
		const [productsResponse] = await Promise.all([data.products.catch(() => undefined)]);

		clearTimeout(bucketDelayTimer);

		// Define extraction logic (3/3)
		if (!productsResponse) {
			const occuredWhile = `awaiting product list`;
			bucketError = getError('UnexpectedError', { occuredWhile: occuredWhile });
			bucketData = undefined;
		} else if (!productsResponse.error) {
			bucketError = undefined;
			bucketData = {
				products: productsResponse.data
			};
		} else {
			bucketError = productsResponse.error;
			bucketData = undefined;
		}

		// Define side effects (optional)
		soupSearch.setItems(bucketData?.products ?? []);

		isBucketDelayed = false;
	}
</script>

<Tabs.Root bind:value={tabOfInterest} activationMode="manual" class="contents">
	<Panel class="md:border-r">
		{#snippet header()}
			<Header navigationLink="sidebar">
				{#snippet heading()}
					<h1 class="text-base font-bold leading-none">Products</h1>
				{/snippet}

				{#snippet actions()}
					{#if hasPermission($page.data.permissions, 'products:create')}
						<Button size="sm" href="/app/products/new">
							<PlusIcon class="size-5" weight="bold" /> New
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
						<SearchIcon class="text-muted-foreground absolute left-3 size-4" />
					</div>
					<Tabs.List class="grid h-auto grid-cols-2">
						<Tabs.Trigger value="active">
							Active
							<Badge variant="outline" class="bg-muted ml-2">{activeProducts.length}</Badge>
						</Tabs.Trigger>
						<Tabs.Trigger value="inactive">
							Inactive
							<Badge variant="outline" class="bg-muted ml-2">{inactiveProducts.length}</Badge>
						</Tabs.Trigger>
					</Tabs.List>
				{/snippet}
			</Header>
		{/snippet}

		{#snippet content()}
			{#snippet productInfoTile(product: Product)}
				<InfoTile
					href="/app/products/{product.product_id}"
					heading={product.name}
					description={formatCurrency(product.unit_price ?? 0)}
				/>
			{/snippet}

			{#snippet noTiles()}
				<p class="text-muted-foreground p-4 text-center text-sm">
					{#if searchInput?.length}
						No results found.
					{:else}
						No products available.
					{/if}
				</p>
			{/snippet}

			{#if (isBucketTimedOut || isBucketDelayed) && !bucketData}
				<div class="animate-in fade-in mb-6 duration-100">
					{#each { length: 25 } as _}
						<InfoTileSkeleton description badge />
					{/each}
				</div>
			{:else if bucketError}
				<div class="p-4">
					<AlertPane
						title="Failed to load product list"
						message={JSON.stringify(bucketError)}
						statusCode={bucketError.statusCode}
						onRetry={() => invalidate('products:all')}
					/>
				</div>
			{:else if bucketData}
				<div class="animate-in fade-in mb-6 duration-100">
					<Tabs.Content value="active" class="mt-0">
						{#each activeProducts as product}
							{@render productInfoTile(product)}
						{/each}
						{#if !activeProducts.length}
							{@render noTiles()}
						{/if}
					</Tabs.Content>

					<Tabs.Content value="inactive" class="mt-0">
						{#each inactiveProducts as product}
							{@render productInfoTile(product)}
						{/each}
						{#if !inactiveProducts.length}
							{@render noTiles()}
						{/if}
					</Tabs.Content>
				</div>
			{/if}
		{/snippet}
	</Panel>
</Tabs.Root>
