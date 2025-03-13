<script lang="ts">
	import Panel from '$lib/components/layout/panel.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { customerCreateSchema, type CustomerCreateSchema } from '$lib/types/form.types';
	import { appSuperForm, type FormMessage } from '$lib/forms';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { Error } from '$lib/types/api.types';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import ProductPricingTable from './product-pricing-table.svelte';
	import type { Product, SalesTax } from '$lib/types/entity.types';
	import CloseIcon from 'lucide-svelte/icons/x';

	/* Form */

	let {
		products,
		salesTaxes,
		validatedForm,
		onSuccess,
		isOpen = $bindable()
	}: {
		products: Product[];
		salesTaxes: SalesTax[];
		validatedForm: SuperValidated<Infer<CustomerCreateSchema>>;
		onSuccess: (customer_id: string) => void;
		isOpen: boolean;
	} = $props();

	async function onFormUpdated({ form }: { form: SuperValidated<Infer<CustomerCreateSchema>> }) {
		const message = form.message as FormMessage<{ customer_id: string }> | undefined;

		if (!message) {
			return;
		} else if (message.error) {
			error = message.error;
		} else {
			error = undefined;
			onSuccess(message.data.customer_id);
		}
	}

	const superForm = appSuperForm(validatedForm, {
		validators: zodClient(customerCreateSchema),
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
				<h2 class="font-semibold">Create Customer</h2>
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
			action="?/createCustomer"
			use:enhance
			class="grid gap-4 px-4 py-4"
		>
			{#if error}
				<AlertBanner
					alert={{
						type: 'error',
						title: 'Failed to create customer',
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

			<Form.Field form={superForm} name="tax_registration_number">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Tax Registration Number (Optional)</Form.Label>
						<Input {...props} bind:value={$form.tax_registration_number} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email Address (Optional)</Form.Label>
						<Input {...props} bind:value={$form.email} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={superForm} name="image_url">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Profile Picture URL (Optional)</Form.Label>
						<Input {...props} bind:value={$form.image_url} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<section class="-mx-4 my-4 overflow-x-auto">
				<h2 class="mx-4 mb-1 text-sm font-medium">Special Pricing</h2>
				<ProductPricingTable {products} {salesTaxes} {superForm} />
			</section>
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
