<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import {
		customerStatementGenerateSchema,
		type CustomerStatementGenerateSchema
	} from '$lib/types/form.types';
	import { appSuperForm } from '$lib/forms';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Error } from '$lib/types/api.types';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import Combobox from '$lib/components/combobox/combobox.svelte';
	import type { Customer } from '$lib/types/entity.types';
	import { parseDate } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { formatDate } from '$lib/accounting';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { cn } from '$lib/utils';
	import CalendarWithSelect from '$lib/components/calendar-with-select/calendar-with-select.svelte';
	import { Input } from '$lib/components/ui/input';

	/* Form */

	let {
		customers,
		validatedForm
	}: {
		customers: Omit<Customer, 'product_pricing'>[];
		validatedForm: SuperValidated<Infer<CustomerStatementGenerateSchema>>;
	} = $props();

	const superForm = appSuperForm(validatedForm, {
		validators: zodClient(customerStatementGenerateSchema)
	});

	const { form, enhance, validate } = superForm;

	/* Runes */

	let error: Error | undefined = $state();

	let isFormValid = $derived(
		$form.customer_id &&
			$form.start_date &&
			$form.end_date &&
			($form.paid_amount_override ? $form.paid_amount_override >= 0 : true)
	);

	function getCustomerStatementHref(
		customer_id: string,
		start_date: string,
		end_date: string,
		paid_amount_override: number | null
	): string {
		return `/app/statements/view?customer_id=${customer_id}&start_date=${start_date}&end_date=${end_date}${paid_amount_override ? `&paid_amount_override=${paid_amount_override}` : ''}`;
	}
</script>

<form
	id={validatedForm.id}
	method="post"
	action="?/generateCustomerStatement"
	use:enhance
	class="grid gap-4 p-4"
>
	{#if error}
		<AlertBanner
			alert={{
				type: 'error',
				title: 'Failed to generate statement',
				description: `${error.description} ${error.resolution}`,
				errorCode: error.errorCode
			}}
		/>
	{/if}

	<Form.Field form={superForm} name="customer_id">
		<Form.Control>
			{#snippet children()}
				<Form.Label>Customer</Form.Label>
				<Combobox
					type="single"
					allowDeselect={false}
					inputProps={{
						placeholder: 'Select a customer',
						onblur: () => validate('customer_id'),
						autocapitalize: 'none',
						autocomplete: 'off',
						autocorrect: 'off'
					}}
					items={customers.map((customer) => ({
						value: customer.customer_id,
						label: customer.name
					}))}
					bind:value={$form.customer_id}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field form={superForm} name="start_date">
		<Form.Control>
			{#snippet children()}
				{@const calendarDate = $form.start_date ? parseDate($form.start_date) : undefined}
				<Form.Label>Start Date</Form.Label>
				<Popover.Root onOpenChange={(open) => !open && validate('start_date')}>
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
								{calendarDate ? formatDate(calendarDate.toString()) : 'Select a start date'}
								<CalendarIcon />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<CalendarWithSelect
							preventDeselect
							value={calendarDate}
							onValueChange={(value) => {
								// @ts-ignore
								$form.start_date = value?.toString();
								validate('start_date');
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

	<Form.Field form={superForm} name="end_date">
		<Form.Control>
			{#snippet children()}
				{@const calendarDate = $form.end_date ? parseDate($form.end_date) : undefined}
				<Form.Label>End Date</Form.Label>
				<Popover.Root onOpenChange={(open) => !open && validate('end_date')}>
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
								{calendarDate ? formatDate(calendarDate.toString()) : 'Select an end date'}
								<CalendarIcon />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0" align="start">
						<CalendarWithSelect
							preventDeselect
							value={calendarDate}
							onValueChange={(value) => {
								// @ts-ignore
								$form.end_date = value?.toString();
								validate('end_date');
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

	<Form.Field form={superForm} name="paid_amount_override">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Paid Amount Override (Optional)</Form.Label>
				<Input type="number" step="any" {...props} bind:value={$form.paid_amount_override} />
				<Form.Description>
					To manually adjust the paid amount, enter the value here. This will appear at the bottom
					of the statement.
				</Form.Description>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>

<div class="grid px-4">
	{#if isFormValid}
		<Button
			href={getCustomerStatementHref(
				$form.customer_id,
				$form.start_date,
				$form.end_date,
				$form.paid_amount_override
			)}
		>
			Generate Statement
		</Button>
	{:else}
		<Button disabled>Generate Statement</Button>
	{/if}
</div>
