export function mergePageItems<T, K extends keyof T>(
	previous: T[],
	pageItems: T[],
	key: K,
	isFirstPage: boolean,
): T[] {
	if (isFirstPage) return pageItems;
	const existingKeys = new Set(
		previous.map((item) => item[key] as unknown as string | number | undefined),
	);
	const nextItems = pageItems.filter(
		(item) =>
			!existingKeys.has(item[key] as unknown as string | number | undefined),
	);
	return [...previous, ...nextItems];
}
