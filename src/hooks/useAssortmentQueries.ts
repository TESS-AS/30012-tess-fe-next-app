"use client";

/**
 * React Query hooks for the KSU (assortment) feature.
 *
 * All queryKeys live in `assortmentWizardKeys` — distinct from the existing
 * `assortmentKeys` in useGetAssortments.ts (which keys the plain list used
 * by the sidebar/header). Mutations invalidate both namespaces so UI stays
 * fresh across surfaces.
 */

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { assortmentKeys } from "@/hooks/useGetAssortments";
import {
	addProductsToAssortment,
	addUserToAssortment,
	checkAssortmentNameAvailable,
	commitExcelImport,
	createAssortmentFromSource,
	deleteAssortment,
	getAssortmentByNumber,
	getAssortmentStructure,
	getCatalogStructure,
	getCustomGroups,
	getItemsForAssortment,
	patchAssortment,
	removeUserFromAssortment,
	saveCustomGroups,
	searchUsers,
	validateExcelImport,
	type AddProductsToAssortmentPayload,
	type PatchAssortmentBody,
} from "@/services/assortment.service";
import type { CustomGroup } from "@/types/assortment.types";
import type { CreateAssortmentBody } from "@/types/assortment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const assortmentWizardKeys = {
	all: ["assortment-wizard"] as const,
	catalog: () => [...assortmentWizardKeys.all, "catalog"] as const,
	structure: (assortmentNumber: string | null) =>
		[...assortmentWizardKeys.all, "structure", assortmentNumber ?? ""] as const,
	nameAvailable: (name: string) =>
		[...assortmentWizardKeys.all, "nameAvailable", name] as const,
	userSearch: (q: string) =>
		[...assortmentWizardKeys.all, "userSearch", q] as const,
	detail: (assortmentNumber: string | null) =>
		[...assortmentWizardKeys.all, "detail", assortmentNumber ?? ""] as const,
	items: (assortmentNumber: string | null) =>
		[...assortmentWizardKeys.all, "items", assortmentNumber ?? ""] as const,
	customGroups: (assortmentNumber: string | null) =>
		[...assortmentWizardKeys.all, "customGroups", assortmentNumber ?? ""] as const,
};

/** TESS Katalog 2026 (DEFAULT_SALES_NEW) — static per deploy, cache aggressively. */
export function useGetCatalogStructure(enabled = true) {
	return useQuery({
		queryKey: assortmentWizardKeys.catalog(),
		queryFn: getCatalogStructure,
		enabled,
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}

/** Tree of an existing KSU — fetched on-demand after the user picks a
 *  source assortment in the "Kopier eksisterende" flow. */
export function useGetAssortmentStructure(assortmentNumber: string | null) {
	return useQuery({
		queryKey: assortmentWizardKeys.structure(assortmentNumber),
		queryFn: () => getAssortmentStructure(assortmentNumber as string),
		enabled: Boolean(assortmentNumber),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}

/**
 * Debounced name-uniqueness check. The caller passes the raw input value
 * and this hook handles the trailing-edge debounce + the BE's 1-char lower
 * bound (we never fire for < 2 chars).
 *
 * Return: `{ available, isChecking, debouncedName }`.
 *  - `available === undefined` means "haven't checked yet" (keep neutral UI).
 *  - `available === true | false` once the first check lands.
 */
export function useCheckAssortmentName(name: string, delayMs = 400) {
	const debouncedName = useDebouncedValue(name.trim(), delayMs);
	const enabled = debouncedName.length >= 2;

	const query = useQuery({
		queryKey: assortmentWizardKeys.nameAvailable(debouncedName),
		queryFn: () => checkAssortmentNameAvailable(debouncedName),
		enabled,
		staleTime: 30 * 1000,
		refetchOnWindowFocus: false,
	});

	return {
		debouncedName,
		isChecking: enabled && query.isFetching,
		available: enabled ? query.data?.available : undefined,
	};
}

/**
 * User autocomplete. BE rejects queries < 2 chars (400). Hook stays silent
 * below that threshold and surfaces an empty-state ready for the caller.
 */
export function useSearchUsers(query: string, delayMs = 300) {
	const debouncedQuery = useDebouncedValue(query.trim(), delayMs);
	const enabled = debouncedQuery.length >= 2;

	const result = useQuery({
		queryKey: assortmentWizardKeys.userSearch(debouncedQuery),
		queryFn: () => searchUsers(debouncedQuery, 10),
		enabled,
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,
	});

	return {
		results: enabled ? (result.data ?? []) : [],
		isSearching: enabled && result.isFetching,
		debouncedQuery,
	};
}

export function useCreateAssortment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: CreateAssortmentBody) =>
			createAssortmentFromSource(body),
		onSuccess: () => {
			// Both namespaces: the wizard's own queries + the plain list the
			// sidebar/header reads via useGetAssortments.
			qc.invalidateQueries({ queryKey: assortmentWizardKeys.all });
			qc.invalidateQueries({ queryKey: assortmentKeys.all });
		},
	});
}

export function useValidateExcelImport() {
	return useMutation({
		mutationFn: (file: File) => validateExcelImport(file),
	});
}

export function useCommitExcelImport() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ file, assortmentName }: { file: File; assortmentName?: string }) =>
			commitExcelImport(file, assortmentName),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: assortmentWizardKeys.all });
			qc.invalidateQueries({ queryKey: assortmentKeys.all });
		},
	});
}

/** Attach products/items to an existing KSU. Used by the "Legg til varer i
 *  sortilog" entry points from product detail and cart pages. */
export function useAddProductsToAssortment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			assortmentNumber,
			payload,
		}: {
			assortmentNumber: string;
			payload: AddProductsToAssortmentPayload;
		}) => addProductsToAssortment(assortmentNumber, payload),
		onSuccess: () => {
			// Only the wizard-local structure cache can go stale on add — the
			// list of assortments itself doesn't change.
			qc.invalidateQueries({ queryKey: assortmentWizardKeys.all });
		},
	});
}

/** Update KSU metadata (name/description) and/or replace the category
 *  selection. Admin surface uses this for rename; the drawer edit path will
 *  pass `sourceAssortmentNumber` + `selectedCategoryNumbers` together. */
export function useUpdateAssortment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			assortmentNumber,
			body,
		}: {
			assortmentNumber: string;
			body: PatchAssortmentBody;
		}) => patchAssortment(assortmentNumber, body),
		onSuccess: (_data, variables) => {
			qc.invalidateQueries({ queryKey: assortmentWizardKeys.all });
			qc.invalidateQueries({ queryKey: assortmentKeys.all });
			// Also invalidate the per-KSU detail cache if callers hold one.
			qc.invalidateQueries({
				queryKey: ["assortment-detail", variables.assortmentNumber],
			});
		},
	});
}

/** Delete a KSU. Irreversible. BE returns 409 `{ users: number }` when any
 *  user has this KSU as their default_assortment_id — caller should toast
 *  that count instead of a generic failure. */
export function useDeleteAssortment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (assortmentNumber: string) => deleteAssortment(assortmentNumber),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: assortmentWizardKeys.all });
			qc.invalidateQueries({ queryKey: assortmentKeys.all });
		},
	});
}

/** Full KSU detail (admins, counts, timestamps) for the admin surface's
 *  right-side detail panel. */
export function useGetAssortmentDetail(assortmentNumber: string | null) {
	return useQuery({
		queryKey: assortmentWizardKeys.detail(assortmentNumber),
		queryFn: () => getAssortmentByNumber(assortmentNumber as string),
		enabled: Boolean(assortmentNumber),
		staleTime: 60 * 1000,
	});
}

/** Add one or more users as responsibles on an existing KSU. */
export function useAddAssortmentUser() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			assortmentNumber,
			grants,
		}: {
			assortmentNumber: string;
			grants: Array<{ userId: number; canAdminister: boolean }>;
		}) => addUserToAssortment(assortmentNumber, { users: grants }),
		onSuccess: (_data, variables) => {
			qc.invalidateQueries({
				queryKey: assortmentWizardKeys.detail(variables.assortmentNumber),
			});
			qc.invalidateQueries({ queryKey: assortmentKeys.all });
		},
	});
}

export function useRemoveAssortmentUser() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			assortmentNumber,
			userId,
		}: {
			assortmentNumber: string;
			userId: number;
		}) => removeUserFromAssortment(assortmentNumber, userId),
		onSuccess: (_data, variables) => {
			qc.invalidateQueries({
				queryKey: assortmentWizardKeys.detail(variables.assortmentNumber),
			});
			qc.invalidateQueries({ queryKey: assortmentKeys.all });
		},
	});
}

/** Items (products) under a specific catalog node — used by the admin
 *  "Opprett og tilpass" drawer to render pickable items on the left. */
export function useGetItemsForAssortment(assortmentNumber: string | null) {
	return useQuery({
		queryKey: assortmentWizardKeys.items(assortmentNumber),
		queryFn: () => getItemsForAssortment(assortmentNumber as string),
		enabled: Boolean(assortmentNumber),
		staleTime: 5 * 60 * 1000,
	});
}

/** User-authored custom group tree for a KSU. */
export function useGetCustomGroups(assortmentNumber: string | null) {
	return useQuery({
		queryKey: assortmentWizardKeys.customGroups(assortmentNumber),
		queryFn: () => getCustomGroups(assortmentNumber as string),
		enabled: Boolean(assortmentNumber),
		staleTime: 60 * 1000,
	});
}

export function useSaveCustomGroups() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			assortmentNumber,
			groups,
		}: {
			assortmentNumber: string;
			groups: CustomGroup[];
		}) => saveCustomGroups(assortmentNumber, groups),
		onSuccess: (_data, variables) => {
			qc.invalidateQueries({
				queryKey: assortmentWizardKeys.customGroups(variables.assortmentNumber),
			});
		},
	});
}
