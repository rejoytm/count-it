<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input';
	import type { CustomerCreateSchema } from '$lib/types/form.types';
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import type { Product, SalesTax } from '$lib/types/entity.types';
	import { findProductById, findSalesTaxById, getSalesTaxLabel } from '$lib/accounting';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import AddIcon from 'phosphor-svelte/lib/Plus';
	import FieldErrors from '$lib/components/form/field-errors.svelte';
	import { cn } from '$lib/utils';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { tick } from 'svelte';
	import TrashIcon from 'lucide-svelte/icons/trash-2';
	import { sampleProduct } from '$lib/database';

	let {
		products,
		salesTaxes,
		superForm
	}: {
		products: Product[];
		salesTaxes: SalesTax[];
		superForm: SuperForm<Infer<CustomerCreateSchema>>;
	} = $props();

	let { form, errors, validate } = superForm;

	const gridClass = 'grid grid-cols-[1fr_0.5fr_0.5fr_42px]';
	const wrapperClass = 'flex h-10 justify-start items-start p-0.5 focus-within:z-20';
	const elementClass = 'rounded-none border-transparent size-full px-2';
	const interactiveClass =
		'!ring-offset-[1px] hover:z-0 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-950 data-[field-error]:z-10 transition duration-100';

	/* Runes */

	let selectedProductId: string | undefined = $state();

	async function addItem(productId: string | undefined) {
		const product = findProductById(products, productId);
		if (!product) {
			return;
		}

		const item = {
			product_id: product.product_id,
			unit_price: product.unit_price ?? 0,
			sales_tax_id: product.sales_tax?.sales_tax_id ?? null
		};

		$form.product_pricing = [...$form.product_pricing, item];

		await tick();

		focusItem($form.product_pricing.length - 1);
	}

	function removeItem(productId: string) {
		$form.product_pricing = $form.product_pricing.filter((item) => item.product_id !== productId);
	}

	function focusItem(index: number) {
		const item = document.getElementById(getItemPriceInputId(index));
		if (item) {
			(item as HTMLInputElement).focus();
		}
	}

	function getItemPriceInputId(index: number) {
		return `price-input-${index}`;
	}

	function getSelectableProducts(
		allProducts: Product[],
		selectedItems: { product_id: string }[]
	): Product[] {
		const selectedProductIds = selectedItems.map((item) => item.product_id);
		const selectableProducts = allProducts.filter(
			(product) => !selectedProductIds.includes(product.product_id) && !product.is_archived
		);
		return selectableProducts;
	}
</script>

<ScrollArea orientation="horizontal">
	<div class={cn(gridClass, 'relative mx-4 mb-5 min-w-[32rem] items-center')}>
		{@render headerItem('Product')}
		{@render headerItem('Special Price')}
		{@render headerItem('Sales Tax')}
		{@render headerItem('')}

		{#each $form.product_pricing as _, i}
			{@render listItem(i)}
		{/each}

		{#if !$form.product_pricing.length}
			<div class="col-span-full border-t py-2.5">
				<p class="text-sm text-muted-foreground">No special prices added.</p>
			</div>
		{/if}
	</div>
</ScrollArea>

<div class="mb-1 px-4">
	<Select.Root
		type="single"
		bind:value={selectedProductId}
		onValueChange={(value) => {
			addItem(value);
			selectedProductId = undefined;
		}}
	>
		<Select.Trigger
			hideIcon
			class={cn(buttonVariants({ variant: 'foreground' }), 'w-auto !text-background')}
		>
			<AddIcon weight="bold" />
			<span> Add a Product </span>
		</Select.Trigger>
		<Select.Content
			avoidCollisions={true}
			side="bottom"
			align="start"
			class="max-w-[calc(100vw-2rem)]"
		>
			{#each getSelectableProducts(products, $form.product_pricing) as product}
				<Select.Item value={product.product_id} label={product.name} />
			{/each}
		</Select.Content>
	</Select.Root>
</div>

{#snippet headerItem(heading: string)}
	<p class="h-full truncate px-0 py-3 text-xs text-muted-foreground">
		{heading}
	</p>
{/snippet}

{#snippet listItem(i: number)}
	{@const unitPriceError = $errors.product_pricing?.[i]?.unit_price}
	{@const salesTaxIdError = $errors.product_pricing?.[i]?.sales_tax_id}
	{@const hasError = unitPriceError ?? salesTaxIdError}

	<div
		class={cn(
			gridClass,
			'col-span-full border border-b-0',
			i === 0 && 'rounded-t-md',
			i === $form.product_pricing.length - 1 && 'rounded-b-md border-b',
			i % 2 !== 0 && '-my-px'
		)}
	>
		<div
			class={cn(
				wrapperClass,
				'line-clamp-1 bg-sidebar text-sidebar-foreground',
				i === 0 && 'rounded-tl-md',
				i === $form.product_pricing.length - 1 && 'rounded-bl-md'
			)}
		>
			<p class={cn(elementClass, 'flex items-center text-sm')}>
				{(findProductById(products, $form.product_pricing[i].product_id) ?? sampleProduct).name}
			</p>
		</div>

		<div class={cn(wrapperClass, '-mx-px cursor-text border-x')}>
			<Input
				class={cn(elementClass, interactiveClass)}
				data-field-error={unitPriceError}
				id={getItemPriceInputId(i)}
				type="number"
				step="any"
				placeholder="Enter a description"
				bind:value={$form.product_pricing[i].unit_price}
				onblur={() => validate(`product_pricing[${i}].unit_price`)}
			/>
		</div>

		<div class={cn(wrapperClass, 'cursor-pointer')}>
			<Select.Root
				type="single"
				value={$form.product_pricing[i].sales_tax_id ?? undefined}
				onValueChange={(value) => {
					$form.product_pricing[i].sales_tax_id = value;
					validate(`product_pricing[${i}].sales_tax_id`);
				}}
			>
				<Select.Trigger
					data-field-error={salesTaxIdError}
					class={cn(elementClass, interactiveClass)}
				>
					{@const salesTax = findSalesTaxById(salesTaxes, $form.product_pricing[i].sales_tax_id)}
					<span class={cn(!salesTax && 'text-muted-foreground')}>
						{salesTax ? getSalesTaxLabel(salesTax, 'abbreviation') : 'Select'}
					</span>
				</Select.Trigger>
				<Select.Content align="end">
					{#each salesTaxes as salesTax}
						<Select.Item value={salesTax.sales_tax_id} label={getSalesTaxLabel(salesTax)} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class={cn(wrapperClass, 'items-center justify-center border-l')}>
			<Button
				class={cn(
					'size-9 rounded-none !ring-offset-1',
					i === 0 && 'rounded-tr-sm',
					!hasError && i === $form.product_pricing.length - 1 && 'rounded-br-sm'
				)}
				size="icon"
				variant="ghost"
				onclick={() => removeItem($form.product_pricing[i].product_id)}
			>
				<TrashIcon class="text-destructive" />
			</Button>
		</div>

		{#if hasError}
			<div
				class={cn(
					'col-span-full space-y-0 border-t bg-sidebar px-3 py-1.5 pb-2',
					i === $form.product_pricing.length - 1 && 'rounded-b-[calc(var(--radius)-2.5px)]'
				)}
			>
				<FieldErrors errors={unitPriceError} />
				<FieldErrors errors={salesTaxIdError} />
			</div>
		{/if}
	</div>
{/snippet}
