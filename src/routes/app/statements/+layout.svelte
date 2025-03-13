<script lang="ts">
	import TwoStepPage from '$lib/components/layout/two-step-page.svelte';
	import StepOne from './(components)/step-one.svelte';

	let { data, children } = $props();
</script>

<TwoStepPage stepTwoRoutes={['view']}>
	{#snippet stepOne()}
		<StepOne customers={data.customers} requestForm={data.requestForm} />
	{/snippet}

	{#snippet stepTwo()}
		{@render children()}
	{/snippet}
</TwoStepPage>
