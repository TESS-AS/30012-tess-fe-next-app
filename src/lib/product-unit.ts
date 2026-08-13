interface UnitAttribute {
	attributeIdentifier?: string;
	name?: string;
	valueDef?: string;
	contentUnit?: string | null;
}

/**
 * Resolve the display unit ("STK", "KG", "M", …) for a product/variant from its
 * columnAttribute record. BE currently returns the value in one of a few
 * places, in priority order:
 *   1. `attribute.contentUnit` field (authoritative when set)
 *   2. attribute identifier `contentUnit` or name containing enhet/contentunit
 *   3. `Salgsforpakning` attribute (identifier `META001317`) — sales package unit
 */
export function resolveProductUnit(
	attrs: UnitAttribute[] | undefined,
	fallback = "STK",
): string {
	if (!attrs?.length) return fallback;

	const contentUnitAttr = attrs.find((a) => a.contentUnit);
	if (contentUnitAttr?.contentUnit) return contentUnitAttr.contentUnit;

	const namedUnitAttr = attrs.find(
		(a) =>
			a.attributeIdentifier === "contentUnit" ||
			a.name?.toLowerCase().includes("contentunit") ||
			a.name?.toLowerCase().includes("content unit") ||
			a.name?.toLowerCase().includes("enhet"),
	);
	if (namedUnitAttr?.valueDef) return namedUnitAttr.valueDef;

	const salesPackageAttr = attrs.find(
		(a) =>
			a.attributeIdentifier === "META001317" ||
			a.name?.toLowerCase() === "salgsforpakning",
	);
	if (salesPackageAttr?.valueDef) return salesPackageAttr.valueDef;

	return fallback;
}