// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Permission } from '$lib/permissions';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null;
			permissions: Permission[];
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
