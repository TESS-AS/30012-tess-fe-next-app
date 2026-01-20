export type SelectOption = { value: string; label: string };

export function buildSelectOptions(
	base: SelectOption[],
	extra: SelectOption[],
): SelectOption[] {
	const map = new Map<string, string>();
	base.forEach(({ value, label }) => {
		if (value) map.set(value, label);
	});
	extra.forEach(({ value, label }) => {
		if (value && label && !map.has(value)) map.set(value, label);
	});
	return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}

export function normalizeValuesWithMap(
	values: string[],
	isNumericId: (value: string) => boolean,
	labelToIdMap: Map<string, string>,
): string[] {
	const normalized = values
		.map((v) => {
			const trimmed = v.trim();
			if (!trimmed) return "";
			if (isNumericId(trimmed)) return trimmed;
			return labelToIdMap.get(trimmed) ?? trimmed;
		})
		.filter(Boolean);
	return Array.from(new Set(normalized));
}
