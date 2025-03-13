<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form/index.js';
	import {
		activityReportGenerateSchema,
		type ActivityReportGenerateSchema
	} from '$lib/types/form.types';
	import { appSuperForm } from '$lib/forms';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { type Error } from '$lib/types/api.types';
	import AlertBanner from '$lib/components/alerts/alert-banner.svelte';
	import { parseDate } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { formatDate } from '$lib/accounting';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { cn } from '$lib/utils';
	import CalendarWithSelect from '$lib/components/calendar-with-select/calendar-with-select.svelte';

	/* Form */

	let {
		validatedForm
	}: {
		validatedForm: SuperValidated<Infer<ActivityReportGenerateSchema>>;
	} = $props();

	const superForm = appSuperForm(validatedForm, {
		validators: zodClient(activityReportGenerateSchema)
	});

	const { form, enhance, validate } = superForm;

	/* Runes */

	let error: Error | undefined = $state();

	let isFormValid = $derived($form.start_date && $form.end_date);

	function getActivityReportHref(start_date: string, end_date: string): string {
		return `/app/activity-report/view?start_date=${start_date}&end_date=${end_date}`;
	}
</script>

<form
	id={validatedForm.id}
	method="post"
	action="?/generateActivityReport"
	use:enhance
	class="grid gap-4 p-4"
>
	{#if error}
		<AlertBanner
			alert={{
				type: 'error',
				title: 'Failed to generate activity report',
				description: `${error.description} ${error.resolution}`,
				errorCode: error.errorCode
			}}
		/>
	{/if}

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
</form>

<div class="grid px-4">
	{#if isFormValid}
		<Button href={getActivityReportHref($form.start_date, $form.end_date)}>Generate Report</Button>
	{:else}
		<Button disabled>Generate Report</Button>
	{/if}
</div>
