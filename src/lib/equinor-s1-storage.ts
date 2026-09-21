/**
 * Equinor (184200) S1 / Lokasjon helpers.
 *
 * Punchout login should remember which plant the user came from (PBI 2584)
 * and use it as the default location selector + order-history scope.
 */

export const SELECTED_S1_STORAGE_KEY = "selectedS1Code";
export const PUNCHOUT_S1_STORAGE_KEY = "punchoutS1Code";

/** Canonical Equinor S1 codes used in hose management. */
export const EQUINOR_S1_CODES = {
	TROLL_A: "1391731",
	GUDRUN: "1291619",
	DRAUPNER: "2090222",
	VALEMON: "1291617",
	SNORRE_A: "1291622",
	GULLFAKS_A: "1291607",
	SNORRE_B: "1370349",
	GULLFAKS_B: "1291608",
	GULLFAKS_C: "1291609",
	NORNE_SHIP: "1292731",
	OSEBERG_C: "1291630",
	OSEBERG_FELTSENTER: "1291633",
	AASTA_HANSTEEN: "1419515",
	NJORD_B: "1722691",
	OSEBERG_SOR: "1291631",
	OSEBERG_OST: "1291632",
	NJORD_A: "1292735",
	TROLL_C: "1291629",
	TROLL_B: "1294144",
	JOHAN_CASTBERG: "1958795",
	GRANE: "2070299",
	HEIDRUN_A: "1292728",
} as const;

const S1_NAME_TO_CODE: Record<string, string> = {
	"troll a": EQUINOR_S1_CODES.TROLL_A,
	"1130 troll a": EQUINOR_S1_CODES.TROLL_A,
	"troll b": EQUINOR_S1_CODES.TROLL_B,
	"1775 troll b": EQUINOR_S1_CODES.TROLL_B,
	"troll c": EQUINOR_S1_CODES.TROLL_C,
	"1776 troll c": EQUINOR_S1_CODES.TROLL_C,
	gudrun: EQUINOR_S1_CODES.GUDRUN,
	draupner: EQUINOR_S1_CODES.DRAUPNER,
	valemon: EQUINOR_S1_CODES.VALEMON,
	"snorre a": EQUINOR_S1_CODES.SNORRE_A,
	"gullfaks a": EQUINOR_S1_CODES.GULLFAKS_A,
	"snorre b": EQUINOR_S1_CODES.SNORRE_B,
	"gullfaks b": EQUINOR_S1_CODES.GULLFAKS_B,
	"gullfaks c": EQUINOR_S1_CODES.GULLFAKS_C,
	norne: EQUINOR_S1_CODES.NORNE_SHIP,
	"oseberg c": EQUINOR_S1_CODES.OSEBERG_C,
	"1765 oseberg c": EQUINOR_S1_CODES.OSEBERG_C,
	"oseberg sør": EQUINOR_S1_CODES.OSEBERG_SOR,
	"oseberg sor": EQUINOR_S1_CODES.OSEBERG_SOR,
	"oseberg øst": EQUINOR_S1_CODES.OSEBERG_OST,
	"oseberg ost": EQUINOR_S1_CODES.OSEBERG_OST,
	"njord a": EQUINOR_S1_CODES.NJORD_A,
	"njord b": EQUINOR_S1_CODES.NJORD_B,
	"aasta hansteen": EQUINOR_S1_CODES.AASTA_HANSTEEN,
	"johan castberg": EQUINOR_S1_CODES.JOHAN_CASTBERG,
	grane: EQUINOR_S1_CODES.GRANE,
	"1755 grane": EQUINOR_S1_CODES.GRANE,
	"heidrun a": EQUINOR_S1_CODES.HEIDRUN_A,
	"1170 heidrun a": EQUINOR_S1_CODES.HEIDRUN_A,
};

const KNOWN_CODES = new Set(Object.values(EQUINOR_S1_CODES));

function normalizeS1Key(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Resolve a free-text plant name or raw S1 code to a canonical S1 code. */
export function resolveEquinorS1Code(raw?: string | null): string | null {
	if (!raw) return null;
	const trimmed = String(raw).trim();
	if (!trimmed) return null;
	if (KNOWN_CODES.has(trimmed)) return trimmed;

	const key = normalizeS1Key(trimmed);
	if (S1_NAME_TO_CODE[key]) return S1_NAME_TO_CODE[key];

	// Partial match: "TROLL A - something" / "1130 Troll A"
	for (const [alias, code] of Object.entries(S1_NAME_TO_CODE)) {
		if (key.includes(alias) || alias.includes(key)) return code;
	}

	return null;
}

function readStorage(key: string): string | null {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeStorage(key: string, value: string) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, value);
	} catch {
		/* ignore */
	}
}

/** Persist S1 from punchout login and sync the location selector key. */
export function rememberPunchoutS1(raw?: string | null): string | null {
	if (!raw) return null;
	const trimmed = String(raw).trim();
	if (!trimmed) return null;
	const code = resolveEquinorS1Code(trimmed) ?? trimmed;
	writeStorage(PUNCHOUT_S1_STORAGE_KEY, code);
	writeStorage(SELECTED_S1_STORAGE_KEY, code);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("equinor-s1-changed"));
	}
	return code;
}

/**
 * Current S1 for Equinor: last selected (incl. punchout seed) first,
 * then punchout memory, then Troll A as fallback.
 */
export function getEquinorDefaultS1Code(): string {
	const selected = readStorage(SELECTED_S1_STORAGE_KEY);
	const selectedResolved = resolveEquinorS1Code(selected) ?? selected;
	if (selectedResolved) return selectedResolved;
	const punchout = readStorage(PUNCHOUT_S1_STORAGE_KEY);
	const punchoutResolved = resolveEquinorS1Code(punchout) ?? punchout;
	if (punchoutResolved) return punchoutResolved;
	return EQUINOR_S1_CODES.TROLL_A;
}

export function setSelectedS1Code(code: string) {
	const resolved = resolveEquinorS1Code(code) ?? code;
	writeStorage(SELECTED_S1_STORAGE_KEY, resolved);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new Event("equinor-s1-changed"));
	}
}

/**
 * Match a stored punchout/selected value against an S1 list (by code or name).
 * Used when the punchout payload sends a plant name like "TROLL A" / "TESS PRINCESS".
 */
export function matchS1FromList(
	stored: string | null | undefined,
	list: { S1Code: string; S1Name?: string }[],
): string | null {
	if (!stored || list.length === 0) return null;
	const resolved = resolveEquinorS1Code(stored) ?? stored.trim();
	const byCode = list.find((s1) => s1.S1Code === resolved);
	if (byCode) return byCode.S1Code;

	const key = normalizeS1Key(resolved);
	const byName = list.find((s1) => {
		const name = normalizeS1Key(s1.S1Name ?? "");
		return name === key || name.includes(key) || key.includes(name);
	});
	return byName?.S1Code ?? null;
}

/** Pull a possible S1 value from a punchout /user payload of unknown shape. */
export function extractS1FromUnknownPayload(payload: unknown): string | null {
	if (!payload || typeof payload !== "object") return null;
	const obj = payload as Record<string, unknown>;

	const directKeys = [
		"s1Code",
		"S1Code",
		"s1",
		"S1",
		"plant",
		"plantCode",
		"plantName",
		"location",
		"locationCode",
		"locationName",
		"site",
		"siteCode",
		"siteName",
		"defaultS1Code",
		"defaultS1",
		"companyName",
		"defaultCompanyName",
		"customerName",
	];

	for (const key of directKeys) {
		const value = obj[key];
		if (typeof value === "string" || typeof value === "number") {
			const resolved = resolveEquinorS1Code(String(value));
			if (resolved) return resolved;
		}
	}

	// Nested common shapes
	for (const nestedKey of ["user", "data", "profile", "shipTo", "address"]) {
		const nested = obj[nestedKey];
		const fromNested = extractS1FromUnknownPayload(nested);
		if (fromNested) return fromNested;
	}

	if (Array.isArray(payload)) {
		for (const item of payload) {
			const fromItem = extractS1FromUnknownPayload(item);
			if (fromItem) return fromItem;
		}
	}

	return null;
}
