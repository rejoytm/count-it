<script lang="ts">
	import TwoStepPage from '$lib/components/layout/two-step-page.svelte';
	import StepOne from './(components)/step-one.svelte';

	let { data, children } = $props();
</script>

<TwoStepPage stepTwoRoutes={['[productId]', 'new']}>
	{#snippet stepOne()}
		<StepOne {data} />
	{/snippet}

	{#snippet stepTwo()}
		{@render children()}
	{/snippet}
</TwoStepPage>
