<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input';
	import type { InvoiceUpdateSchema } from '$lib/types/form.types';
	import { type Infer, type SuperForm } from 'sveltekit-superforms';
	import type { Product, ProductPricing, SalesTax } from '$lib/types/entity.types';
	import { findPricingForProduct, findSalesTaxById, getSalesTaxLabel } from '$lib/accounting';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import AddIcon from 'phosphor-svelte/lib/Plus';
	import TrashIcon from 'lucide-svelte/icons/trash-2';
	import FieldErrors from '$lib/components/form/field-errors.svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { tick, untrack } from 'svelte';
	import Combobox from '$lib/components/combobox/combobox.svelte';

	let {
		products,
		salesTaxes,
		productPricing,
		superForm
	}: {
		products: Product[];
		salesTaxes: SalesTax[];
		productPricing: ProductPricing[];
		superForm: SuperForm<Infer<InvoiceUpdateSchema>>;
	} = $props();

	let { form, errors, validate } = superForm;

	const gridClass = 'grid grid-cols-[1fr_1fr_0.4fr_0.4fr_0.4fr_40px]';
	const wrapperClass = 'flex h-10 justify-start items-start p-0.5 focus-within:z-20';
	const elementClass = 'rounded-none border-transparent size-full px-2';
	const interactiveClass =
		'!ring-offset-[1px] hover:z-0 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-950 data-[field-error]:z-10 transition duration-100';

	/* Runes */

	async function addItem() {
		form.update(
			($form) => {
				$form.line_items.push({
					product_id: '',
					description: null,
					quantity: 1,
					unit_price: 0,
					sales_tax_id: null,
					delivery_note_number: null
				});

				return $form;
			},
			{ taint: 'untaint' }
		);

		await tick();
		focusItem($form.line_items.length - 1);
	}

	function removeItem(index: number) {
		$form.line_items[index].product_id = '';
		validate(`line_items[${index}].product_id`);

		$form.line_items = [...$form.line_items.slice(0, index), ...$form.line_items.slice(index + 1)];
	}

	function focusItem(index: number) {
		const item = document.getElementById(getProductComboboxId(index));
		if (item) {
			(item as HTMLInputElement).focus();
		}
	}

	function getProductComboboxId(index: number) {
		return `line_items.${index}.product_id`;
	}

	/* Automatic Pricing */

	let initialUpdateSkipped: boolean = $state(false);

	function updateAutomaticPricingForLineItem(index: number) {
		const lineItem = $form.line_items[index];
		if (!lineItem || !lineItem.product_id) {
			return;
		}

		const pricing = findPricingForProduct(productPricing, lineItem.product_id);
		if (!pricing) {
			return;
		}

		$form.line_items[index].unit_price = pricing.unit_price;
		$form.line_items[index].sales_tax_id = pricing.sales_tax_id;
	}

	function updateAutomaticPricingForAllLineItems() {
		if (!initialUpdateSkipped) {
			initialUpdateSkipped = true;
			return;
		}

		for (let i = 0; i < $form.line_items.length; i++) {
			updateAutomaticPricingForLineItem(i);
		}
	}

	$effect(() => {
		productPricing;
		untrack(() => updateAutomaticPricingForAllLineItems());
	});

	/* Annoyance */

	let productIdComboboxDisplayedValueRefreshFunctions = $state<(() => void)[]>([]);
</script>

{#snippet listItem(i: number)}
	{@const productIdError = $errors.line_items?.[i]?.product_id}
	{@const descriptionError = $errors.line_items?.[i]?.description}
	{@const quantityError = $errors.line_items?.[i]?.quantity}
	{@const unitPriceError = $errors.line_items?.[i]?.unit_price}
	{@const salesTaxIdError = $errors.line_items?.[i]?.sales_tax_id}
	{@const hasError =
		productIdError || descriptionError || quantityError || unitPriceError || salesTaxIdError}

	<div
		class={cn(
			gridClass,
			'col-span-full border border-b-0',
			i === 0 && 'rounded-t-md',
			i === $form.line_items.length - 1 && 'rounded-b-md border-b',
			i % 2 !== 0 && '-my-px'
		)}
	>
		<div class={cn(wrapperClass)}>
			<Combobox
				class={cn(
					elementClass,
					interactiveClass,
					'pr-9',
					i === 0 && 'rounded-tl',
					!hasError && i === $form.line_items.length - 1 && 'rounded-bl'
				)}
				type="single"
				allowDeselect={false}
				items={products.map((product) => ({ value: product.product_id, label: product.name }))}
				inputProps={{
					id: getProductComboboxId(i),
					placeholder: 'Select a product',
					'data-field-error': productIdError,
					onblur: () => validate(`line_items[${i}].product_id`),
					autocapitalize: 'none',
					autocomplete: 'off',
					autocorrect: 'off'
				}}
				onValueChange={() => {
					updateAutomaticPricingForLineItem(i);
				}}
				bind:refreshDisplayedValue={productIdComboboxDisplayedValueRefreshFunctions[i]}
				bind:value={$form.line_items[i].product_id}
			/>
		</div>

		<div class={cn(wrapperClass, '-mx-px cursor-text border-x')}>
			<Input
				class={cn(elementClass, interactiveClass)}
				data-field-error={descriptionError}
				placeholder="Enter a description"
				bind:value={$form.line_items[i].description}
				onblur={() => validate(`line_items[${i}].description`)}
				autocapitalize="none"
				autocomplete="off"
				autocorrect="off"
			/>
		</div>

		<div class={cn(wrapperClass, 'cursor-text')}>
			<Input
				type="number"
				class={cn(elementClass, interactiveClass)}
				data-field-error={quantityError}
				placeholder="Quantity"
				bind:value={$form.line_items[i].quantity}
				onblur={() => validate(`line_items[${i}].quantity`)}
				autocomplete="off"
			/>
		</div>

		<div class={cn(wrapperClass, '-mx-px cursor-text border-x')}>
			<Input
				type="number"
				step="any"
				class={cn(elementClass, interactiveClass)}
				data-field-error={unitPriceError}
				placeholder="Price"
				bind:value={$form.line_items[i].unit_price}
				onblur={() => validate(`line_items[${i}].unit_price`)}
				autocomplete="off"
			/>
		</div>

		<div class={cn(wrapperClass, 'cursor-pointer')}>
			<Select.Root
				type="single"
				value={$form.line_items[i].sales_tax_id ?? undefined}
				onValueChange={(value) => {
					$form.line_items[i].sales_tax_id = value;
					validate(`line_items[${i}].sales_tax_id`);
				}}
			>
				<Select.Trigger
					data-field-error={salesTaxIdError}
					class={cn(elementClass, interactiveClass)}
				>
					{@const salesTax = findSalesTaxById(salesTaxes, $form.line_items[i].sales_tax_id)}
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

		<div class={cn(wrapperClass, 'flex items-center justify-center border-l')}>
			<Button
				disabled={$form.line_items.length === 1}
				onclick={async () => {
					removeItem(i);
					// Need to await tick before refreshing combobox displayed values
					// because bind:$form.line_items[i].product_id causes an error otherwise.
					await tick();
					productIdComboboxDisplayedValueRefreshFunctions.forEach((f) => f());
				}}
				size="icon"
				variant="ghost"
				class={cn(
					'size-9 rounded-none !ring-offset-1',
					i === 0 && 'rounded-tr-sm',
					!hasError && i === $form.line_items.length - 1 && 'rounded-br-sm'
				)}
			>
				<TrashIcon class="text-destructive" />
			</Button>
		</div>

		{#if hasError}
			<div
				class={cn(
					'col-span-full space-y-0 border-t bg-sidebar px-3 py-1.5 pb-2',
					i === $form.line_items.length - 1 && 'rounded-b-[calc(var(--radius)-2.5px)]'
				)}
			>
				<FieldErrors errors={productIdError} />
				<FieldErrors errors={descriptionError} />
				<FieldErrors errors={quantityError} />
				<FieldErrors errors={unitPriceError} />
				<FieldErrors errors={salesTaxIdError} />
			</div>
		{/if}
	</div>
{/snippet}

{#snippet headerItem(heading: string)}
	<p class="h-full truncate px-0 py-3 text-xs text-muted-foreground">
		{heading}
	</p>
{/snippet}

<ScrollArea orientation="horizontal">
	<div class={cn(gridClass, 'relative mx-4 mb-5 min-w-[52rem] items-center')}>
		{@render headerItem('Product')}
		{@render headerItem('Description')}
		{@render headerItem('Quantity')}
		{@render headerItem('Unit Price')}
		{@render headerItem('Sales Tax')}
		{@render headerItem('')}

		{#each $form.line_items as _, i}
			{@render listItem(i)}
		{/each}
	</div>
</ScrollArea>

<div class="px-4">
	<Button variant="foreground" onclick={addItem}>
		<AddIcon weight="bold" />
		<span> Add Item </span>
	</Button>
</div>
