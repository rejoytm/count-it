import type { User } from '@supabase/supabase-js';
import { PUBLIC_OWNER_EMAIL, PUBLIC_EMPLOYEE_EMAIL } from '$env/static/public';

type PermissionCategory =
	| 'customers'
	| 'products'
	| 'inventory'
	| 'invoices'
	| 'delivery_notes'
	| 'receipt_vouchers'
	| 'activity_report'
	| 'customer_statements';

type PermissionAction = 'create' | 'read' | 'update' | 'update_conditional' | 'delete';

export type Permission = `${PermissionCategory}:${PermissionAction}`;

function generatePermissions(
	category: PermissionCategory,
	actions: PermissionAction[]
): Permission[] {
	return actions.map((action) => `${category}:${action}` as Permission);
}

const ownerPermissions: Permission[] = [
	...generatePermissions('customers', ['create', 'read', 'update']),
	...generatePermissions('products', ['create', 'read', 'update']),
	...generatePermissions('inventory', ['create', 'read', 'update', 'delete']),
	...generatePermissions('invoices', ['create', 'read', 'update']),
	...generatePermissions('delivery_notes', ['create', 'read', 'update']),
	...generatePermissions('receipt_vouchers', ['create', 'read', 'update']),
	...generatePermissions('activity_report', ['read']),
	...generatePermissions('customer_statements', ['read'])
];

const employeePermissions: Permission[] = [
	...generatePermissions('customers', ['create']),
	...generatePermissions('products', []),
	...generatePermissions('inventory', []),
	...generatePermissions('invoices', ['create', 'read']),
	...generatePermissions('delivery_notes', ['create', 'read', 'update']),
	...generatePermissions('receipt_vouchers', []),
	...generatePermissions('activity_report', []),
	...generatePermissions('customer_statements', [])
];

export function getUserPermissions(user: User | null): Permission[] {
	if (!user) {
		return [];
	}

	let permissions: Permission[] = [];

	if (user.email === PUBLIC_OWNER_EMAIL) {
		permissions = ownerPermissions;
	} else if (user.email === PUBLIC_EMPLOYEE_EMAIL) {
		permissions = employeePermissions;
	}

	return permissions;
}

export function hasPermission(
	permissions: Permission[],
	permission: Permission | undefined
): boolean {
	if (!permissions || !permission) {
		return false;
	}

	return permissions.includes(permission);
}

export function hasPermissionToAccessPath(user: User | null, pathname: string): boolean {
	const protectedPathToPermissionMapping: Record<string, Permission> = {
		customers: 'customers:read',
		products: 'products:read',
		inventory: 'inventory:read',
		invoices: 'invoices:read',
		'delivery-notes': 'delivery_notes:read',
		'receipt-vouchers': 'receipt_vouchers:read',
		'activity-report': 'activity_report:read',
		statements: 'customer_statements:read'
	};

	const permissions = getUserPermissions(user);

	for (const [pathSegment, permission] of Object.entries(protectedPathToPermissionMapping)) {
		if (pathname.includes(pathSegment) && !hasPermission(permissions, permission)) {
			return false;
		}
	}

	return true;
}
