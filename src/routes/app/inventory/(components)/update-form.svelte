<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import {
		productInventoryUpdateSchema,
		type ProductInventoryUpdateSchema
	} from '$lib/types/form.types';
	import { appSuperForm, type FormMessage } from '$lib/forms';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Error } from '$lib/types/api.types';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import { findProductById } from '$lib/accounting';
	import type { Product } from '$lib/types/entity.types';

	/* Form */

	let {
		products,
		validatedForm,
		onSuccess
	}: {
		products: Product[];
		validatedForm: SuperValidated<Infer<ProductInventoryUpdateSchema>>;
		onSuccess: () => void;
	} = $props();

	async function onFormUpdated({
		form
	}: {
		form: SuperValidated<Infer<ProductInventoryUpdateSchema>>;
	}) {
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
		validators: zodClient(productInventoryUpdateSchema),
		onUpdated: onFormUpdated
	});

	const { form, enhance, tainted, isTainted, submitting, delayed } = superForm;

	/* Runes */

	let error: Error | undefined = $state();
</script>

<Panel>
	{#snippet header()}
		<Header>
			{#snippet heading()}
				<h2 class="font-semibold">Edit Inventory Item</h2>
			{/snippet}
		</Header>
	{/snippet}

	{#snippet content()}
		<form
			id={validatedForm.id}
			method="post"
			action="?/updateProductInventory"
			use:enhance
			class="grid gap-4 p-4"
		>
			{#if error}
				<AlertBanner
					alert={{
						type: 'error',
						title: 'Failed to update inventory item',
						description: `${error.description} ${error.resolution}`,
						errorCode: error.errorCode
					}}
				/>
			{/if}

			<Form.Field form={superForm} name="product_id">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Product</Form.Label>
						<Input
							tabindex={-1}
							readonly
							{...props}
							value={findProductById(products, $form.product_id)?.name}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="stock">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Stock</Form.Label>
						<Input type="number" {...props} bind:value={$form.stock} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="low_stock_threshold">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Low Stock Threshold</Form.Label>
						<Input type="number" {...props} bind:value={$form.low_stock_threshold} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				form={superForm}
				name="allow_sales_when_out_of_stock"
				class="mt-2 flex flex-row  items-start space-x-3 space-y-0 rounded-md border p-4"
			>
				<Form.Control>
					{#snippet children({ props })}
						<Checkbox {...props} bind:checked={$form.allow_sales_when_out_of_stock} />
						<div class="space-y-1 leading-none">
							<Form.Label class="text-sm text-foreground">Allow sales when out of stock</Form.Label>
							<Form.Description>
								Enabling this option allows you to include this item in new invoices even when its
								stock is zero.
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
