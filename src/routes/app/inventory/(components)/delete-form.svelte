<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		productInventoryDeleteSchema,
		type ProductInventoryDeleteSchema
	} from '$lib/types/form.types';
	import { appSuperForm, type FormMessage } from '$lib/forms';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Error } from '$lib/types/api.types';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import type { Product } from '$lib/types/entity.types';
	import { findProductById } from '$lib/accounting';

	/* Form */

	let {
		products,
		validatedForm,
		onSuccess,
		isOpen = $bindable()
	}: {
		products: Product[];
		validatedForm: SuperValidated<Infer<ProductInventoryDeleteSchema>>;
		onSuccess: () => void;
		isOpen: boolean;
	} = $props();

	async function onFormUpdated({
		form
	}: {
		form: SuperValidated<Infer<ProductInventoryDeleteSchema>>;
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
		validators: zodClient(productInventoryDeleteSchema),
		onUpdated: onFormUpdated
	});

	const { form, enhance, tainted, isTainted, submitting, delayed } = superForm;

	/* Runes */

	let error: Error | undefined = $state();
</script>

<Panel contentClass="h-auto max-h-[calc(100svh-theme(spacing.8)-2*theme(spacing.16))]">
	{#snippet header()}
		<Header>
			{#snippet heading()}
				<h2 class="font-semibold">Confirm Item Removal</h2>
			{/snippet}
		</Header>
	{/snippet}

	{#snippet content()}
		<form
			id={validatedForm.id}
			method="post"
			action="?/deleteProductInventory"
			use:enhance
			class="grid gap-4 p-4"
		>
			{#if error}
				<AlertBanner
					alert={{
						type: 'error',
						title: 'Failed to delete inventory item',
						description: `${error.description} ${error.resolution}`,
						errorCode: error.errorCode
					}}
				/>
			{/if}

			<p class="text-sm text-muted-foreground">
				This action will only remove the selected item from the inventory. The product itself will
				not be deleted.
			</p>

			<Form.Field form={superForm} name="product_id">
				<Form.Control>
					{#snippet children({ props })}
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
		</form>

		<div class="mb-4 flex flex-col justify-end gap-2 px-4 md:flex-row">
			<Button disabled={$submitting || $delayed} variant="outline" onclick={() => (isOpen = false)}>
				Cancel
			</Button>

			<Button
				type="submit"
				form={validatedForm.id}
				disabled={$submitting || $delayed}
				variant="destructive"
			>
				{#if $delayed}
					<SpinnerIcon class="mr-0.5 size-5 animate-spin" weight="bold" />
				{/if}
				Remove Item
			</Button>
		</div>
	{/snippet}
</Panel>
