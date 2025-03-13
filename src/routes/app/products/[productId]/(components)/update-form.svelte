<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { productUpdateSchema, type ProductUpdateSchema } from '$lib/types/form.types';
	import { appSuperForm, type FormMessage } from '$lib/forms';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Error } from '$lib/types/api.types';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import type { ProductCategory, SalesTax } from '$lib/types/entity.types';
	import CloseIcon from 'lucide-svelte/icons/x';
	import * as Select from '$lib/components/ui/select/index.js';
	import { findSalesTaxById, getSalesTaxLabel } from '$lib/accounting';
	import { cn } from '$lib/utils';

	/* Form */

	let {
		salesTaxes,
		categories,
		validatedForm,
		onSuccess,
		isOpen = $bindable()
	}: {
		salesTaxes: SalesTax[];
		categories: ProductCategory[];
		validatedForm: SuperValidated<Infer<ProductUpdateSchema>>;
		onSuccess: () => void;
		isOpen: boolean;
	} = $props();

	async function onFormUpdated({ form }: { form: SuperValidated<Infer<ProductUpdateSchema>> }) {
		const message = form.message as FormMessage | undefined;

		if (!message) {
			return;
		} else if (message.error) {
			error = message.error;
		} else {
			error = undefined;
			onSuccess();
		}
	}

	const superForm = appSuperForm(validatedForm, {
		validators: zodClient(productUpdateSchema),
		onUpdated: onFormUpdated
	});

	const { form, enhance, tainted, isTainted, validate, submitting, delayed } = superForm;

	/* Runes */

	let error: Error | undefined = $state();
</script>

<Panel>
	{#snippet header()}
		<Header>
			{#snippet heading()}
				<h2 class="font-semibold">Edit Product</h2>
			{/snippet}

			{#snippet actions()}
				<Button class="size-7" size="icon" variant="ghost" onclick={() => (isOpen = false)}>
					<CloseIcon class="size-5" />
				</Button>
			{/snippet}
		</Header>
	{/snippet}

	{#snippet content()}
		<form
			id={validatedForm.id}
			method="post"
			action="?/updateProduct"
			use:enhance
			class="grid gap-4 p-4"
		>
			{#if error}
				<AlertBanner
					alert={{
						type: 'error',
						title: 'Failed to update product',
						description: `${error.description} ${error.resolution}`,
						errorCode: error.errorCode
					}}
				/>
			{/if}

			<Form.Field form={superForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$form.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="unit_price">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit Price</Form.Label>
						<Input type="number" step="any" {...props} bind:value={$form.unit_price} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="sales_tax_id">
				<Form.Control>
					{#snippet children()}
						<Form.Label>Sales Tax</Form.Label>
						<Select.Root
							type="single"
							value={$form.sales_tax_id ?? undefined}
							onValueChange={(value) => {
								$form.sales_tax_id = value;
								validate('sales_tax_id');
							}}
						>
							<Select.Trigger>
								{@const salesTax = findSalesTaxById(salesTaxes, $form.sales_tax_id)}
								<span class={cn(!salesTax && 'text-muted-foreground')}>
									{salesTax ? getSalesTaxLabel(salesTax) : 'Select'}
								</span>
							</Select.Trigger>
							<Select.Content align="end">
								{#each salesTaxes as salesTax}
									<Select.Item value={salesTax.sales_tax_id} label={getSalesTaxLabel(salesTax)} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="category_id">
				<Form.Control>
					{#snippet children()}
						<Form.Label>Category</Form.Label>
						<Select.Root
							type="single"
							value={$form.category_id ?? undefined}
							onValueChange={(value) => {
								$form.category_id = value;
								validate('category_id');
							}}
						>
							<Select.Trigger>
								{@const category = categories.find(
									(category) => category.category_id === $form.category_id
								)}
								<span class={cn(!category && 'text-muted-foreground')}>
									{category?.name ?? 'Select'}
								</span>
							</Select.Trigger>
							<Select.Content align="end">
								{#each categories as category}
									<Select.Item value={category.category_id} label={category.name} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				form={superForm}
				name="is_archived"
				class="mt-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
			>
				<Form.Control>
					{#snippet children({ props })}
						<Checkbox {...props} bind:checked={$form.is_archived} />
						<div class="space-y-1 leading-none">
							<Form.Label class="text-sm text-foreground">Mark as inactive product</Form.Label>
							<Form.Description>
								Inactive products are not deleted. Instead, they will not be available for inclusion
								in new invoices. This can be reversed later if needed.
							</Form.Description>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</form>
	{/snippet}

	{#snippet footer()}
		<div class="px-4 py-3.5">
			<Button
				type="submit"
				form={validatedForm.id}
				class="w-full"
				disabled={!isTainted($tainted) || $submitting || $delayed}
			>
				{#if $delayed}
					<SpinnerIcon class="mr-0.5 size-5 animate-spin" weight="bold" />
				{/if}
				Save Changes
			</Button>
		</div>
	{/snippet}
</Panel>
