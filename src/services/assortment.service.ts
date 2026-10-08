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
	assortmentId: number;
	assortmentNumber: string;
	assortmentName: string;
	assortmentDescription?: string | null;
	categoryCount?: number;
	productCount?: number;
	sourceAssortmentNumber?: string | null;
	sourceAssortmentName?: string | null;
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

/** Returns a URL/blob the browser can download. BE serves the file directly;
 *  use `window.location.href = ...` or an <a download> for the user flow. */
export function getExcelTemplateUrl(): string {
	// BE route is a GET that streams the file — the browser's native download
	// handling works best when hit directly rather than via XHR.
	return "/assortment/excel/template";
}

export function getExportAssortmentExcelUrl(assortmentNumber: string): string {
	return `/assortment/${encodeURIComponent(assortmentNumber)}/excel`;
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
