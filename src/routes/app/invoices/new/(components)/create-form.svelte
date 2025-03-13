<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Panel from '$lib/components/layout/panel.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Customer, ProductPricing, Product, SalesTax } from '$lib/types/entity.types';
	import { invoiceCreateSchema, type InvoiceCreateSchema } from '$lib/types/form.types';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import CloseIcon from 'lucide-svelte/icons/x';
	import { appSuperForm, type FormMessage } from '$lib/forms';
	import type { Error } from '$lib/types/api.types';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';
	import * as Form from '$lib/components/ui/form/index.js';
	import { parseDate } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils';
	import { findCustomerById, formatDate, getMergedPricingForCustomer } from '$lib/accounting';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { Calendar } from '$lib/components/ui/calendar';
	import Combobox from '$lib/components/combobox/combobox.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import LineItemsTable from './line-items-table.svelte';
	import PlusIcon from 'phosphor-svelte/lib/Plus';
	import { hasPermission } from '$lib/permissions';
	import { page } from '$app/stores';

	/* Form */

	let {
		validatedForm,
		onSuccess,
		onRequestCreateCustomer,
		products,
		salesTaxes,
		customers,
		isOpen = $bindable()
	}: {
		validatedForm: SuperValidated<Infer<InvoiceCreateSchema>>;
		onSuccess: (invoice_id: string) => void;
		onRequestCreateCustomer: () => void;
		products: Product[];
		salesTaxes: SalesTax[];
		customers: Customer[];
		isOpen: boolean;
	} = $props();

	async function onFormUpdated({ form }: { form: SuperValidated<Infer<InvoiceCreateSchema>> }) {
		const message = form.message as FormMessage<{ invoice_id: string }> | undefined;

		if (!message) {
			return;
		} else if (message.error) {
			error = message.error;
		} else {
			error = undefined;
			onSuccess(message.data.invoice_id);
		}
	}

	const superForm = appSuperForm(validatedForm, {
		validators: zodClient(invoiceCreateSchema),
		onUpdated: onFormUpdated
	});

	const { form, enhance, validate, tainted, isTainted, submitting, delayed } = superForm;

	/* Runes */

	let error: Error | undefined = $state();
	let mergedPricing: ProductPricing[] = $state(getMergedPricingForCustomer(products, undefined));
	let isCustomerComboboxOpen = $state(false);
</script>

<Panel maxWidthClass="max-w-4xl">
	{#snippet header()}
		<Header>
			{#snippet heading()}
				<h2 class="font-semibold">Create Invoice</h2>
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
			action="?/createInvoice"
			use:enhance
			class="grid gap-6 px-4 py-6 md:gap-8 md:py-8"
		>
			{#if error}
				<AlertBanner
					alert={{
						type: 'error',
						title: 'Failed to create invoice',
						description: `${error.description} ${error.resolution}`,
						errorCode: error.errorCode
					}}
				/>
			{/if}

			<div class="grid items-start gap-4 md:max-w-xl md:grid-cols-2">
				<Form.Field form={superForm} name="invoice_date">
					<Form.Control>
						{#snippet children()}
							{@const calendarDate = $form.invoice_date ? parseDate($form.invoice_date) : undefined}
							<Form.Label>Invoice Date</Form.Label>
							<Popover.Root>
								<Popover.Trigger>
									{#snippet child({ props })}
										<Button
											variant="outline"
											class={cn(
												'w-full justify-between text-left font-normal',
												!calendarDate && 'text-muted-foreground'
											)}
											{...props}
										>
											{calendarDate ? formatDate(calendarDate.toString()) : 'Select a date'}
											<CalendarIcon />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" align="start">
									<Calendar
										preventDeselect
										value={calendarDate}
										onValueChange={(value) => {
											// @ts-ignore
											$form.invoice_date = value?.toString();
											validate('invoice_date');
										}}
										type="single"
										initialFocus
									/>
								</Popover.Content>
							</Popover.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={superForm} name="customer_id">
					<Form.Control>
						{#snippet children()}
							<Form.Label>Customer</Form.Label>
							<Combobox
								bind:open={isCustomerComboboxOpen}
								type="single"
								allowDeselect={false}
								inputProps={{
									placeholder: 'Select a customer',
									onblur: () => validate('customer_id'),
									autocapitalize: 'none',
									autocomplete: 'off',
									autocorrect: 'off'
								}}
								items={customers
									.filter((customer) => !customer.is_archived)
									.map((customer) => ({ value: customer.customer_id, label: customer.name }))}
								onValueChange={(value) =>
									(mergedPricing = getMergedPricingForCustomer(
										products,
										findCustomerById(customers, value)
									))}
								bind:value={$form.customer_id}
							>
								{#snippet noResults()}
									{#if hasPermission($page.data.permissions, 'customers:create')}
										<div>
											<p class="px-4 pb-0.5 pt-2 text-xs text-muted-foreground">
												No results found.
											</p>
											<Button
												onclick={() => {
													isCustomerComboboxOpen = false;
													onRequestCreateCustomer();
												}}
												class="w-full justify-start"
												variant="ghost"
												size="sm"
											>
												<PlusIcon weight="bold"></PlusIcon>
												Create a Customer
											</Button>
										</div>
									{:else}
										<div class="px-2 py-1.5">
											<p class="text-center text-sm text-muted-foreground">No results found.</p>
										</div>
									{/if}
								{/snippet}
							</Combobox>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<section class="-mx-4 mb-3">
				<h2 class="mx-4 mb-2 text-sm font-medium">Items to Bill</h2>
				<LineItemsTable {products} {salesTaxes} productPricing={mergedPricing} {superForm} />
			</section>

			<Form.Field form={superForm} name="notes">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Notes</Form.Label>
						<Textarea
							{...props}
							placeholder="Enter any additional notes"
							bind:value={$form.notes}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				form={superForm}
				name="is_void"
				class="hidden flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
			>
				<Form.Control>
					{#snippet children({ props })}
						<Checkbox {...props} bind:checked={$form.is_void} />
						<div class="space-y-1 leading-none">
							<Form.Label class="text-sm text-foreground">Mark as void</Form.Label>
							<Form.Description>
								Void invoices are not deleted. Instead, they will not be included in reports or
								monthly statements. This can be reversed later if needed.
							</Form.Description>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</form>
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-end px-4 py-3.5">
			<Button
				class="w-full px-4 md:w-auto"
				type="submit"
				form={validatedForm.id}
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
