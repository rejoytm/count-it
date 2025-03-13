export class SoupSearch<TItem> {
	private items: TItem[] = $state([]);
	private keys: (keyof TItem)[] = $state([]);
	private storedSoups: string[] = [];

	constructor(items: TItem[], keys: (keyof TItem)[]) {
		this.items = items;
		this.keys = keys;
		this.storedSoups = this.computeSoups();
	}

	private normalize(string: string): string {
		return string
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '');
	}

	private makeSoup(item: TItem): string {
		return this.keys.map((key) => String(item[key])).join('');
	}

	private computeSoups(): string[] {
		return this.items.map((item) => {
			const soup = this.makeSoup(item);
			return this.normalize(soup).replace(/\s+/g, '');
		});
	}

	public search(search: string | undefined): TItem[] {
		if (!search) {
			return this.items;
		}

		const normalizedSearchWords = search
			.split(/\s+/)
			.map(this.normalize)
			.filter((word) => word !== '');

		const filteredItems = this.items.filter((_, index) => {
			const normalizedItemSoup = this.storedSoups[index];
			return normalizedSearchWords.every((word) => normalizedItemSoup.includes(word));
		});

		return filteredItems;
	}

	public setItems(newItems: TItem[]): void {
		this.items = newItems;
		this.storedSoups = this.computeSoups();
	}
}
