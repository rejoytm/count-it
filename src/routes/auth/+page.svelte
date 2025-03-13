<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerGap';

	let { form } = $props();

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
</script>

<div
	class="flex min-h-screen w-screen items-center justify-center sm:bg-muted sm:dark:bg-background"
>
	<main class="mx-auto grid w-full max-w-sm gap-8 p-4">
		<div class="grid gap-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Sign In</h1>
			<p class="text-sm text-muted-foreground">Enter your account details below.</p>
		</div>

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				isSubmitting = true;

				return async ({ update, result }) => {
					await update();
					if (result.type === 'error' || result.type === 'failure') {
						password = '';
						isSubmitting = false;
					}
				};
			}}
		>
			<div class="grid gap-2.5">
				<div class="grid gap-1">
					<Label class="sr-only" for="email">Email</Label>
					<Input
						class="ring-offset-muted"
						required
						name="email"
						placeholder="Email"
						type="email"
						autocapitalize="none"
						autocomplete="off"
						autocorrect="off"
						bind:value={email}
					/>
				</div>

				<div class="grid gap-1">
					<Label class="sr-only" for="email">Password</Label>
					<Input
						class="ring-offset-muted"
						required
						name="password"
						placeholder="Password"
						type="password"
						autocapitalize="none"
						autocomplete="off"
						autocorrect="off"
						bind:value={password}
					/>
				</div>

				<Button
					type="submit"
					class="bg-foreground ring-offset-muted hover:bg-foreground/90 focus-visible:ring-foreground"
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<SpinnerIcon class="mr-2 size-5 shrink-0 animate-spin" weight="bold" />
					{/if}
					Sign In To Account
				</Button>
			</div>
		</form>

		{#if form?.error}
			<p class="mt-2 text-pretty text-center text-sm font-medium text-destructive">{form.error}</p>
		{/if}
	</main>
</div>
