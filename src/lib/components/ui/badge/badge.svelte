<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'focus:ring-ring shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
				outline: 'text-foreground',
				red: 'bg-red-50 text-red-700 border-red-400/80 dark:bg-red-950/75 dark:text-red-400 dark:border-red-700/40',
				yellow:
					'bg-orange-100 text-orange-600 border-orange-600/80 dark:bg-orange-950/75 dark:text-orange-500 dark:border-orange-700/40',
				green:
					'bg-green-100 text-green-700 border-green-500/80 dark:bg-green-950 dark:text-green-500 dark:border-green-700/40',
				blue: 'bg-blue-50 text-blue-700 border-blue-400/80 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-700/40',
				muted: 'bg-muted text-muted-foreground border-muted-foreground/40'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	{href}
	class={cn(badgeVariants({ variant, className }))}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
