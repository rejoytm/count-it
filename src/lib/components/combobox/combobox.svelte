<script lang="ts">
	import { Combobox, type WithoutChildrenOrChild, mergeProps } from 'bits-ui';
	import { cn } from '$lib/utils';
	import TriggerIcon from 'lucide-svelte/icons/chevrons-up-down';
	import ChevronUpIcon from 'lucide-svelte/icons/chevron-up';
	import ChevronDownIcon from 'lucide-svelte/icons/chevron-down';
	import CheckIcon from 'lucide-svelte/icons/check';
	import { SoupSearch } from '$lib/search.svelte';
	import type { Snippet } from 'svelte';

	type Item = { value: string; label: string };

	type Props = Combobox.RootProps & {
		class?: string;
		items: Item[];
		hasFieldError?: boolean;
		noResults?: Snippet;
		refreshDisplayedValue?: () => void;
		inputProps?: WithoutChildrenOrChild<Combobox.InputProps>;
		contentProps?: WithoutChildrenOrChild<Combobox.ContentProps>;
	};

	let {
		items,
		class: className,
		hasFieldError = false,
		noResults,
		refreshDisplayedValue = $bindable(),
		value = $bindable(),
		open = $bindable(false),
		inputProps,
		contentProps,
		...restProps
	}: Props = $props();

	/* Search */

	const soupSearch = new SoupSearch<{ value: string; label: string }>(items, ['label']);
	let searchValue = $state('');
	let filteredItems = $derived(soupSearch.search(searchValue));

	/* Focus input after value change */

	let inputRef = $state<HTMLInputElement | null>(null);

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		searchValue = e.currentTarget.value;
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			searchValue = '';
		}
	}

	const mergedRootProps = $derived(mergeProps(restProps, { onOpenChange: handleOpenChange }));
	const mergedInputProps = $derived(mergeProps(inputProps, { oninput: handleInput }));

	function getCurrentLabel(): string | undefined {
		if (value === undefined) {
			return undefined;
		}

		if (typeof value === 'string') {
			return items.find((item) => item.value === value)?.label;
		}

		return (
			value
				.map((v) => items.find((item) => item.value === v)?.label)
				.filter((v) => v !== undefined)
				.join(', ') || undefined
		);
	}

	/* ANNOYANCE: Input value does not update correctly when SuperForm array is updated */

	function _refreshDisplayedValue() {
		if (!inputRef) {
			return;
		}

		inputRef.value = getCurrentLabel() ?? '';
	}

	$effect(() => {
		refreshDisplayedValue = _refreshDisplayedValue;
	});
</script>

<Combobox.Root bind:value bind:open {...mergedRootProps}>
	<div class="relative flex size-full items-center">
		<Combobox.Input
			bind:ref={inputRef}
			defaultValue={getCurrentLabel()}
			placeholder="Type to select"
			{...mergedInputProps}
			onfocus={(e) => {
				const target = e.target as HTMLInputElement;
				target.select();
				mergedInputProps.onfocus?.(e);
			}}
			onblur={(e) => {
				const target = e.target as HTMLInputElement;
				target.value = getCurrentLabel() ?? '';
				mergedInputProps.onblur?.(e);
			}}
			class={cn(
				'flex h-10 w-full truncate rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				'data-[field-error]:ring-2 data-[field-error]:ring-destructive data-[field-error]:ring-offset-2',
				className
			)}
		></Combobox.Input>

		<Combobox.Trigger class="absolute right-0 z-10 p-3" tabindex={-1}>
			<TriggerIcon class="size-4 shrink-0 text-muted-foreground"></TriggerIcon>
		</Combobox.Trigger>
	</div>

	<Combobox.Portal>
		<Combobox.Content
			align="start"
			sideOffset={4}
			{...contentProps}
			class="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
		>
			<Combobox.ScrollUpButton class="flex cursor-default items-center justify-center py-1">
				<ChevronUpIcon class="size-4" />
			</Combobox.ScrollUpButton>

			<Combobox.Viewport
				class={cn(
					'h-[var(--bits-combobox-anchor-height)] w-full min-w-[var(--bits-combobox-anchor-width)] p-1'
				)}
			>
				{#each filteredItems as item, i (i + item.value)}
					<Combobox.Item
						value={item.value}
						label={item.label}
						class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50"
					>
						{#snippet children({ selected })}
							<span class="absolute left-2 flex size-3.5 items-center justify-center">
								{#if selected}
									<CheckIcon class="size-4" />
								{/if}
							</span>
							{item.label}
						{/snippet}
					</Combobox.Item>
				{:else}
					{#if noResults}
						{@render noResults()}
					{:else}
						<div class="py-1.5 px-2">
							<p class="text-sm text-muted-foreground text-center">No results found.</p>
						</div>
					{/if}
				{/each}
			</Combobox.Viewport>

			{#if filteredItems.length >= 5}
				<Combobox.ScrollDownButton class="flex cursor-default items-center justify-center py-1">
					<ChevronDownIcon class="size-4" />
				</Combobox.ScrollDownButton>
			{/if}
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
