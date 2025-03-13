import { sleep } from './utils';

export const ui = $state({ usePrintShell: false });

export async function openNativePrintDialog() {
	ui.usePrintShell = true;
	await sleep(100);
	window.print();
}
