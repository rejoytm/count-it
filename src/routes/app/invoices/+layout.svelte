<script lang="ts">
	import TwoStepPage from '$lib/components/layout/two-step-page.svelte';
	import StepOne from './(components)/step-one.svelte';

	let { data, children } = $props();
</script>

<TwoStepPage stepTwoRoutes={['[invoiceId]', 'new']}>
	{#snippet stepOne()}
		<StepOne invoices={data.invoices} />
	{/snippet}

	{#snippet stepTwo()}
		{@render children()}
	{/snippet}
</TwoStepPage>
