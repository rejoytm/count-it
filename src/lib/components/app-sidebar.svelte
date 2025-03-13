<script lang="ts" module>
	import CustomersIcon from 'lucide-svelte/icons/contact-round';
	import ProductsIcon from 'lucide-svelte/icons/layers';
	import InventoryIcon from 'lucide-svelte/icons/archive';
	import InvoicesIcon from 'lucide-svelte/icons/receipt-text';
	import DeliveryNotesIcon from 'lucide-svelte/icons/package-check';
	import ReceiptVouchersIcon from 'lucide-svelte/icons/badge-dollar-sign';
	import ActivityReportIcon from 'lucide-svelte/icons/chart-pie';
	import CustomerStatementsIcon from 'lucide-svelte/icons/book-user';
	import PlusIcon from 'phosphor-svelte/lib/Plus';

	const sections: {
		label: string;
		items: {
			name: string;
			url: string;
			icon: any;
			permissionRequired: Permission;
			isDisabled?: boolean;
		}[];
	}[] = [
		{
			label: 'Catalog',
			items: [
				{
					name: 'Customers',
					url: '/app/customers',
					icon: CustomersIcon,
					permissionRequired: 'customers:read'
				},
				{
					name: 'Products',
					url: '/app/products',
					icon: ProductsIcon,
					permissionRequired: 'products:read'
				},
				{
					name: 'Inventory',
					url: '/app/inventory',
					icon: InventoryIcon,
					permissionRequired: 'inventory:read'
				}
			]
		},
		{
			label: 'Sales',
			items: [
				{
					name: 'Tax Invoices',
					url: '/app/invoices',
					icon: InvoicesIcon,
					permissionRequired: 'invoices:read'
				},
				{
					name: 'Delivery Notes',
					url: '#',
					icon: DeliveryNotesIcon,
					permissionRequired: 'delivery_notes:read',
					isDisabled: true
				},
				{
					name: 'Payments',
					url: '#',
					icon: ReceiptVouchersIcon,
					permissionRequired: 'receipt_vouchers:read',
					isDisabled: true
				}
			]
		},
		{
			label: 'Reports',
			items: [
				{
					name: 'Statements',
					url: '/app/statements',
					icon: CustomerStatementsIcon,
					permissionRequired: 'customer_statements:read'
				},
				{
					name: 'Activity Report',
					url: '/app/activity-report',
					icon: ActivityReportIcon,
					permissionRequired: 'activity_report:read'
				}
			]
		}
	];
</script>

<script lang="ts">
	import NavUser from '$lib/components/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Command from 'lucide-svelte/icons/command';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { Button } from './ui/button';
	import { hasPermission, type Permission } from '$lib/permissions';
	import { COMPANY_NAME } from '$lib/company';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/app" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground hidden aspect-square size-8 items-center justify-center rounded-lg"
							>
								<Command class="size-4" />
							</div>
							<img class="size-8 object-cover" src="/favicon.svg" alt="" />
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{COMPANY_NAME}</span>
								<span class="truncate text-xs">Invoicing Suite</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		{#each sections as section}
			{@const permissionsRequired = section.items.map((item) => item.permissionRequired)}

			{#if permissionsRequired.some((permission) => $page.data.permissions.includes(permission))}
				<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
					<Sidebar.GroupLabel>{section.label}</Sidebar.GroupLabel>
					<Sidebar.Menu>
						{#each section.items as item (item.name)}
							{#if $page.data.permissions.includes(item.permissionRequired)}
								{@const isActive = $page.route.id?.includes(item.url)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										{isActive}
										class={cn(item.isDisabled && 'pointer-events-none opacity-50')}
									>
										{#snippet child({ props })}
											<a href={item.url} {...props}>
												<item.icon />
												<span>{item.name}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/if}
						{/each}
					</Sidebar.Menu>
				</Sidebar.Group>
			{/if}
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer>
		{@const user = $page.data.user}

		{#if hasPermission($page.data.permissions, 'invoices:create')}
			<Button size="default" variant="foreground" href="/app/invoices/new">
				<PlusIcon weight="bold"></PlusIcon>
				New Invoice
			</Button>
		{/if}

		<NavUser
			user={{
				name: 'My Account',
				email: user?.email ?? 'Not signed in',
				avatar: '/profile.png'
			}}
		/>
	</Sidebar.Footer>
</Sidebar.Root>
