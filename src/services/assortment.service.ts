/**
 * Assortment (KSU) service layer.
 *
 * Thin wrappers around every /assortment endpoint on the BE
 * `assortment-creation` branch. Hooks in `src/hooks/useAssortment*.ts`
 * wrap these for React Query — components should never call this file
 * directly, so the fetch/caching strategy stays in one place.
 */

import axiosClient from "@/services/axiosClient";
import type {
	AssortmentNode,
	CatalogStructureResponse,
	CreateAssortmentBody,
	CreateAssortmentResponse,
	CustomGroup,
	ExcelCommitResult,
	ExcelValidationResult,
	NameAvailabilityResponse,
	UserSearchResult,
} from "@/types/assortment.types";

/** Returns the TESS Katalog 2026 tree (BE resolves root = DEFAULT_SALES_NEW). */
export async function getCatalogStructure(): Promise<CatalogStructureResponse> {
	const { data } = await axiosClient.get<CatalogStructureResponse>(
		"/assortment/catalog",
	);
	return data;
}

export interface AssortmentDetail {
	assortmentNumber: string;
	assortmentName: string;
	assortmentDescription?: string | null;
	nameNo?: string | null;
	nameEn?: string | null;
	depth?: number | null;
	type?: string | null;
	parentNumber?: string | null;
	sourceAssortmentNumber?: string | null;
	sourceAssortmentName?: string | null;
	categoryCount?: number;
	productCount?: number;
	itemCount?: number;
	administrators?: Array<{ userId: number; name: string; email?: string }>;
	createdByName?: string;
	createdAt?: string;
	updatedAt?: string;
}

/** Metadata for a single existing KSU — used by the success page's summary
 *  card and the admin edit flow. BE endpoint is `GET /assortment/:number`. */
export async function getAssortmentByNumber(
	assortmentNumber: string,
): Promise<AssortmentDetail> {
	const { data } = await axiosClient.get<AssortmentDetail>(
		`/assortment/${encodeURIComponent(assortmentNumber)}`,
	);
	return data;
}

/** Full tree of an existing KSU — used by the "Kopier eksisterende" flow
 *  once the user picks a source assortment. */
export async function getAssortmentStructure(
	assortmentNumber: string,
): Promise<AssortmentNode[]> {
	const { data } = await axiosClient.get<AssortmentNode[]>(
		`/assortment/${encodeURIComponent(assortmentNumber)}/structure`,
	);
	return data;
}

export async function createAssortmentFromSource(
	body: CreateAssortmentBody,
): Promise<CreateAssortmentResponse> {
	const { data } = await axiosClient.post<CreateAssortmentResponse>(
		"/assortment/create",
		body,
	);
	return data;
}

export async function checkAssortmentNameAvailable(
	name: string,
): Promise<NameAvailabilityResponse> {
	const { data } = await axiosClient.get<NameAvailabilityResponse>(
		"/assortment/nameAvailable",
		{ params: { name } },
	);
	return data;
}

/** BE enforces min 2 chars (returns 400 below that). Caller debounces + gates. */
export async function searchUsers(
	q: string,
	limit = 10,
): Promise<UserSearchResult[]> {
	const { data } = await axiosClient.get<UserSearchResult[]>("/user/search", {
		params: { q, limit },
	});
	return data;
}

async function fetchAssortmentExcel(
	path: string,
	fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
	const response = await axiosClient.get<Blob>(path, { responseType: "blob" });
	const disposition = String(response.headers?.["content-disposition"] ?? "");
	const match =
		/filename\*=UTF-8''([^;]+)/i.exec(disposition) ??
		/filename="?([^";]+)"?/i.exec(disposition);
	const filename = match ? decodeURIComponent(match[1]) : fallbackFilename;
	return { blob: response.data, filename };
}

function triggerBlobDownload(blob: Blob, filename: string): void {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

export async function downloadExcelTemplate(): Promise<void> {
	const { blob, filename } = await fetchAssortmentExcel(
		"/assortment/excel/template",
		"ksu-import-mal.xlsx",
	);
	triggerBlobDownload(blob, filename);
}

export async function downloadAssortmentExcel(
	assortmentNumber: string,
): Promise<void> {
	const { blob, filename } = await fetchAssortmentExcel(
		`/assortment/${encodeURIComponent(assortmentNumber)}/excel`,
		`${assortmentNumber}.xlsx`,
	);
	triggerBlobDownload(blob, filename);
}

export async function validateExcelImport(
	file: File,
): Promise<ExcelValidationResult> {
	const form = new FormData();
	form.append("file", file);
	const { data } = await axiosClient.post<ExcelValidationResult>(
		"/assortment/excel/validate",
		form,
		{ headers: { "Content-Type": "multipart/form-data" } },
	);
	return data;
}

export async function commitExcelImport(
	file: File,
	assortmentName?: string,
): Promise<ExcelCommitResult> {
	const form = new FormData();
	form.append("file", file);
	if (assortmentName) form.append("assortmentName", assortmentName);
	const { data } = await axiosClient.post<ExcelCommitResult>(
		"/assortment/excel/commit",
		form,
		{ headers: { "Content-Type": "multipart/form-data" } },
	);
	return data;
}

export interface AddProductsToAssortmentPayload {
	productNumbers?: string[];
	itemNumbers?: string[];
}

/** Attaches products/items to an existing KSU. Used by the "Legg til varer
 *  i sortilog" entry points from product detail and cart pages. */
export async function addProductsToAssortment(
	assortmentNumber: string,
	payload: AddProductsToAssortmentPayload,
): Promise<void> {
	await axiosClient.post(
		`/assortment/postProduct/${encodeURIComponent(assortmentNumber)}`,
		payload,
	);
}

export interface PatchAssortmentBody {
	assortmentName?: string;
	assortmentDescription?: string;
	/** Replace the category tree. BE requires sourceAssortmentNumber +
	 *  selectedCategoryNumbers to come together — enforced by caller. */
	sourceAssortmentNumber?: string;
	selectedCategoryNumbers?: string[];
}

/** PATCH /assortment/:number. BE rejects (400) when `sourceAssortmentNumber`
 *  and `selectedCategoryNumbers` aren't both set together, when nothing is
 *  being updated, or when `assortmentName` is an empty string. BE rejects
 *  (403) when the user doesn't have `can_administer` on the KSU, or the
 *  KSU is a Bluestone catalogue (`type === 'BS'`). (409) on duplicate name. */
export interface PatchAssortmentResponse {
	assortmentNumber: string;
	categoriesAdded: number;
	categoriesRemoved: number;
}

export async function patchAssortment(
	assortmentNumber: string,
	body: PatchAssortmentBody,
): Promise<PatchAssortmentResponse> {
	const { data } = await axiosClient.patch<PatchAssortmentResponse>(
		`/assortment/${encodeURIComponent(assortmentNumber)}`,
		body,
	);
	return data;
}

/** DELETE /assortment/:number. Irreversible. BE rejects (403) when the user
 *  doesn't have `can_administer`, when the KSU is a Bluestone catalogue, or
 *  (400) when the KSU is not a top-level root. BE rejects (409) with
 *  `{ users: number }` when any user has this KSU as their
 *  `default_assortment_id` — caller must surface that count to the user. */
export async function deleteAssortment(assortmentNumber: string): Promise<void> {
	await axiosClient.delete(
		`/assortment/${encodeURIComponent(assortmentNumber)}`,
	);
}

/** POST /assortment/postUser/:number. Grants one or more users access to
 *  the KSU, each with their own `canAdminister` flag. Used from the admin
 *  surface's "Legg til ansvarlig(e)" section. */
export async function addUserToAssortment(
	assortmentNumber: string,
	payload: { users: Array<{ userId: number; canAdminister: boolean }> },
): Promise<void> {
	await axiosClient.post(
		`/assortment/postUser/${encodeURIComponent(assortmentNumber)}`,
		payload,
	);
}

/** DELETE /assortment/removeUser/:number. */
export async function removeUserFromAssortment(
	assortmentNumber: string,
	userId: number,
): Promise<void> {
	await axiosClient.delete(
		`/assortment/removeUser/${encodeURIComponent(assortmentNumber)}`,
		{ data: { userId } },
	);
}

export interface AssortmentItemRow {
	itemNumber: string;
	categoryNumber: string;
	categoryName: string | null;
}

export interface AssortmentItemsResponse {
	items: AssortmentItemRow[];
	page: number;
	pageSize: number;
	total: number;
}

export async function getItemsForAssortment(
	assortmentNumber: string,
	page: number = 1,
	pageSize: number = 50,
	search?: string,
): Promise<AssortmentItemsResponse> {
	const { data } = await axiosClient.get<AssortmentItemsResponse>(
		`/assortment/${encodeURIComponent(assortmentNumber)}/items`,
		{ params: { page, pageSize, ...(search ? { search } : {}) } },
	);
	return data;
}

/** TODO BE: fetch the user-authored custom group structure for a KSU.
 *  Proposed `GET /assortment/:number/customGroups`. */
export async function getCustomGroups(
	assortmentNumber: string,
): Promise<CustomGroup[]> {
	const { data } = await axiosClient.get<CustomGroup[]>(
		`/assortment/${encodeURIComponent(assortmentNumber)}/customGroups`,
	);
	return data;
}

/** TODO BE: persist the user-authored custom group tree.
 *  Proposed `PUT /assortment/:number/customGroups` with the entire tree
 *  in the body (replace semantics — simpler than per-group diffs). */
export async function saveCustomGroups(
	assortmentNumber: string,
	groups: CustomGroup[],
): Promise<void> {
	await axiosClient.put(
		`/assortment/${encodeURIComponent(assortmentNumber)}/customGroups`,
		{ groups },
	);
}
