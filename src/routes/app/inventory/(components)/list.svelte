<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import EditIcon from 'lucide-svelte/icons/square-pen';
	import RemoveIcon from 'lucide-svelte/icons/trash-2';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { Product } from '$lib/types/entity.types';
	import { page } from '$app/stores';
	import { hasPermission } from '$lib/permissions';

	let {
		heading,
		items,
		variant,
		onRequestUpdate,
		onRequestDelete
	}: {
		heading: string;
		items: { product: Product; stock: number }[];
		variant: 'red' | 'yellow' | 'green';
		onRequestUpdate: (product_id: string) => void;
		onRequestDelete: (product_id: string) => void;
	} = $props();
</script>

{#if items.length}
	<div class="flex flex-col items-start">
		<div class="flex w-full items-center gap-2">
			<Badge {variant}>
				<div
					class={cn(
						'mr-1.5 size-2 rounded-full',
						variant === 'red' && 'bg-red-700 dark:text-red-400',
						variant === 'yellow' && 'bg-orange-600 dark:text-orange-500',
						variant === 'green' && 'bg-green-700 dark:text-green-500'
					)}
				></div>

				{heading}
			</Badge>
			<p class="text-muted-foreground text-sm">
				{items.length}
				{items.length === 1 ? 'product' : 'products'}
			</p>
		</div>

		<div class="mt-4 grid w-full gap-4 lg:grid-cols-3">
			{#each items as item}
				<div
					class="bg-background ring-foreground/5 flex items-start justify-between gap-2 rounded-lg px-4 py-3.5 shadow-sm ring-1"
				>
					<div class="grid gap-0.5 text-pretty text-sm">
						<p class="line-clamp-2 font-medium">{item.product.name}</p>
						<p class="text-muted-foreground">{item.stock} remaining</p>
					</div>

					<div class="-mr-1 -mt-1 flex items-center gap-0.5">
						<Tooltip.Provider delayDuration={0}>
							{#if hasPermission($page.data.permissions, 'inventory:update')}
								<Tooltip.Root ignoreNonKeyboardFocus>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												{...props}
												class="text-muted-foreground size-7"
												size="icon"
												variant="ghost"
												onclick={() => onRequestUpdate(item.product.product_id)}
											>
												<EditIcon />
											</Button>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p class="text-sm">Edit</p>
									</Tooltip.Content>
								</Tooltip.Root>
							{/if}

							{#if hasPermission($page.data.permissions, 'inventory:delete')}
								<Tooltip.Root ignoreNonKeyboardFocus>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												{...props}
												class="text-muted-foreground hover:text-destructive size-7"
												size="icon"
												variant="ghost"
												onclick={() => onRequestDelete(item.product.product_id)}
											>
												<RemoveIcon />
											</Button>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p class="text-sm">Remove</p>
									</Tooltip.Content>
								</Tooltip.Root>
							{/if}
						</Tooltip.Provider>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
