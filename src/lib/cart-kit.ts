export type CartKitPartEntry = {
	key: string;
	itemNumber: string;
	quantity: number;
	name?: string;
	imageUrl?: string;
};

const IMAGE_KEYS = [
	"imageUrl",
	"thumbnailUrl",
	"thumbnail_url",
	"image",
	"pictureUrl",
] as const;

export function readCartKitImageUrl(value: unknown): string | undefined {
	if (value == null || typeof value !== "object") return undefined;
	const record = value as Record<string, unknown>;
	for (const key of IMAGE_KEYS) {
		const candidate = record[key];
		if (typeof candidate === "string" && candidate.trim()) {
			return candidate.trim();
		}
	}
	const media = record.media ?? record.mediaId;
	if (!Array.isArray(media)) return undefined;
	for (const item of media) {
		if (item == null || typeof item !== "object") continue;
		const mediaRecord = item as { thumbnail_url?: unknown; url?: unknown };
		const url = mediaRecord.thumbnail_url ?? mediaRecord.url;
		if (typeof url === "string" && url.trim()) return url.trim();
	}
	return undefined;
}

const hasItemNumber = (
	value: unknown,
): value is { itemNumber: string; quantity?: number; name?: string } => {
	if (value == null || typeof value !== "object") return false;
	const itemNumber = (value as { itemNumber?: unknown }).itemNumber;
	return typeof itemNumber === "string" && itemNumber.trim().length > 0;
};

export function getCartKitPartEntries(
	group?: Record<string, unknown> | Array<unknown> | null,
): CartKitPartEntry[] {
	if (!group) return [];

	const entries = Array.isArray(group)
		? group.map((value, index) => [String(index), value] as const)
		: Object.entries(group);

	return entries.flatMap(([key, value]) => {
		if (typeof value === "string" && value.trim()) {
			return [{ key, itemNumber: value.trim(), quantity: 1 }];
		}
		if (!hasItemNumber(value)) return [];

		const quantity = Number(value.quantity);
		return [
			{
				key,
				itemNumber: value.itemNumber.trim(),
				quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
				name: typeof value.name === "string" ? value.name : undefined,
				imageUrl: readCartKitImageUrl(value),
			},
		];
	});
}

export function formatCartKitAdditionalLabel(key: string): string {
	const match = key.match(/^([a-h])End([12])$/i);
	if (match) {
		return `Add ${match[1].toUpperCase()} End ${match[2]}`;
	}

	return key
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/_/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}
