/**
 * Assortment (KSU — Kundespesifikke utvalg) types.
 *
 * Mirrors the response shapes defined on the BE `assortment-creation`
 * branch of `30011-TESS-APIproxy-ts`:
 *  - GET  /assortment/catalog                       → CatalogStructureResponse
 *  - GET  /assortment/:assortmentNumber/structure   → AssortmentNode[]
 *  - POST /assortment/create                        → CreateAssortmentResponse
 *  - GET  /assortment/nameAvailable?name=X          → NameAvailabilityResponse
 *  - GET  /user/search?q=X                          → UserSearchResult[]
 *  - POST /assortment/excel/validate                → ExcelValidationResult
 *  - POST /assortment/excel/commit                  → ExcelCommitResult
 */

export interface AssortmentNode {
	assortmentId: number;
	assortmentName: string;
	assortmentNumber: string;
	assortmentDescription: string | null;
	nameNo: string | null;
	nameEn: string | null;
	depth: number | null;
	type: string | null;
	parentNumber: string | null;
	bluestoneId: string | null;
	treeLevel: number;
	children: AssortmentNode[];
}

export interface CatalogStructureResponse {
	assortmentNumber: string;
	assortmentName: string;
	bluestoneId: string | null;
	categories: AssortmentNode[];
}

/** The hardcoded root the BE catalog endpoint resolves. Kept in sync with
 *  `CATALOG_ASSORTMENT_NUMBER` on the BE (`getCatalogStructureModel.ts`). */
export const DEFAULT_SALES_NEW = "DEFAULT_SALES_NEW";

export interface AssortmentUserGrant {
	userId: number;
	canAdminister: boolean;
}

export interface CreateAssortmentBody {
	assortmentName: string;
	assortmentDescription?: string;
	/** Omit for an empty KSU. For "Opprett ny" send DEFAULT_SALES_NEW,
	 *  for "Kopier eksisterende" send the user's chosen KSU number. */
	sourceAssortmentNumber?: string;
	/** Omit (with a source set) to copy everything. Pass an explicit list to
	 *  copy only the selected subtree. */
	selectedCategoryNumbers?: string[];
	users?: AssortmentUserGrant[];
}

export interface CreateAssortmentResponse {
	assortmentNumber: string;
	assortmentId: number;
	categoryCount: number;
	productCount: number;
	itemCount: number;
	basedOn: string | null;
}

export interface NameAvailabilityResponse {
	available: boolean;
	/** BE may echo the queried name or a normalized form. */
	name?: string;
}

export interface UserSearchResult {
	userId: number;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
}

export interface ExcelParsedRow {
	varenummer?: string;
	remove?: boolean;
	[key: string]: unknown;
}

export interface ExcelValidationResult {
	rowCount: number;
	errors: Array<{ row: number; message: string }>;
	notFound: Array<{ row: number; varenummer: string }>;
	unknownPaths: string[];
	summary: {
		antallIFil: number;
		antallIkkeFunnet: number;
		antallLeggesTil: number;
		antallFjernes: number;
		antallNyeKategorier: number;
	};
	rows: ExcelParsedRow[];
}

export interface ExcelCommitResult {
	assortmentNumber: string;
	antallIFil: number;
	antallLagtTil: number;
	antallFjernet: number;
	antallNyeKategorier: number;
}

export interface CatalogItem {
	itemNumber: string;
	categoryNumber: string;
	categoryName: string | null;
}

/** User-authored custom group inside a KSU. Not a BS catalog node — this
 *  is a container the user composes by dragging in items from the Tessix
 *  catalog. BE needs to persist these per-KSU. */
export interface CustomGroup {
	id: string;
	name: string;
	/** Nested groups the user has created inside this one. */
	children: CustomGroup[];
	/** Items dragged into this group. */
	items: CatalogItem[];
}
