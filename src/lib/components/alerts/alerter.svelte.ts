import type { Alert } from '$lib/types/api.types';

interface AlertStore {
	alert?: Alert;
	isShown: boolean;
}

export let alertStore: AlertStore = $state({ isShown: false });

export function alert(alert: Alert) {
	alertStore.alert = alert;
	alertStore.isShown = true;
}
