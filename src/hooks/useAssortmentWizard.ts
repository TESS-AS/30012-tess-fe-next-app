"use client";

/**
 * KSU creation form controller.
 *
 * Owns the entire form state machine for the four creation options
 * (new / copy / excel / egne). Components stay dumb UI — all branching,
 * validation gating, and submit payload shaping live here.
 *
 * Design calls:
 *   - Switching option RESETS option-scoped fields (source number, selected
 *     categories) but PRESERVES shared metadata (name, description, users)
 *     — the user shouldn't have to retype a name when they realise they
 *     meant Copy, not New.
 *   - `selectedCategoryNumbers` empty = "copy everything from source" per BE
 *     contract. We don't force the user to tick every box to signal "take all".
 *   - Name uniqueness is debounced + checked separately (`useCheckAssortmentName`
 *     inside the hook). `canSubmit` reflects it only when a check has landed.
 */

import { useCallback, useMemo, useState } from "react";

import {
	useCheckAssortmentName,
	useCreateAssortment,
} from "@/hooks/useAssortmentQueries";
import type { AssortmentUserGrant } from "@/types/assortment.types";
import { DEFAULT_SALES_NEW } from "@/types/assortment.types";

export type WizardOption = "new" | "copy" | "excel" | "egne";

export interface WizardFormData {
	name: string;
	description: string;
	/** Only used by "copy" option. */
	sourceAssortmentNumber: string | null;
	/** Shared by "new" and "copy". Empty Set = "copy everything". */
	selectedCategoryNumbers: Set<string>;
	users: AssortmentUserGrant[];
}

interface SubmitDependencies {
	/** Called with the created assortment number on success. */
	onSuccess?: (assortmentNumber: string) => void;
	onError?: (err: unknown) => void;
}

const EMPTY_FORM: WizardFormData = {
	name: "",
	description: "",
	sourceAssortmentNumber: null,
	selectedCategoryNumbers: new Set(),
	users: [],
};

export function useAssortmentWizard(deps: SubmitDependencies = {}) {
	const [selectedOption, setSelectedOption] = useState<WizardOption | null>(
		null,
	);
	const [formData, setFormData] = useState<WizardFormData>(EMPTY_FORM);

	const { available: nameAvailable, isChecking: isCheckingName } =
		useCheckAssortmentName(formData.name);

	const createMutation = useCreateAssortment();

	// Switching options is the single source of truth for which fields apply.
	// Clear option-scoped fields but keep user-written metadata.
	const setOption = useCallback((next: WizardOption) => {
		setSelectedOption(next);
		setFormData((prev) => ({
			...prev,
			sourceAssortmentNumber: null,
			selectedCategoryNumbers: new Set(),
		}));
	}, []);

	const setMeta = useCallback(
		(patch: Partial<Pick<WizardFormData, "name" | "description">>) => {
			setFormData((prev) => ({ ...prev, ...patch }));
		},
		[],
	);

	const setSource = useCallback((sourceAssortmentNumber: string | null) => {
		setFormData((prev) => ({
			...prev,
			sourceAssortmentNumber,
			// New source → drop previous selection; it's keyed to a different tree.
			selectedCategoryNumbers: new Set(),
		}));
	}, []);

	const setCategoriesBulk = useCallback((next: Set<string>) => {
		setFormData((prev) => ({ ...prev, selectedCategoryNumbers: next }));
	}, []);

	const addUser = useCallback(
		(userId: number, canAdminister = false) => {
			setFormData((prev) => {
				if (prev.users.some((u) => u.userId === userId)) return prev;
				return { ...prev, users: [...prev.users, { userId, canAdminister }] };
			});
		},
		[],
	);

	const removeUser = useCallback((userId: number) => {
		setFormData((prev) => ({
			...prev,
			users: prev.users.filter((u) => u.userId !== userId),
		}));
	}, []);

	const setUserRole = useCallback(
		(userId: number, canAdminister: boolean) => {
			setFormData((prev) => ({
				...prev,
				users: prev.users.map((u) =>
					u.userId === userId ? { ...u, canAdminister } : u,
				),
			}));
		},
		[],
	);

	const reset = useCallback(() => {
		setSelectedOption(null);
		setFormData(EMPTY_FORM);
	}, []);

	/** Resolves the effective source assortment for the current option.
	 *  "new" always targets DEFAULT_SALES_NEW; "copy" uses the user's pick. */
	const effectiveSourceNumber = useMemo<string | null>(() => {
		if (selectedOption === "new") return DEFAULT_SALES_NEW;
		if (selectedOption === "copy") return formData.sourceAssortmentNumber;
		return null;
	}, [selectedOption, formData.sourceAssortmentNumber]);

	const canSubmit = useMemo(() => {
		if (!selectedOption) return false;
		if (!formData.name.trim()) return false;
		// Only block for a confirmed unavailable; while the first check is in
		// flight we let the user try (BE unique constraint is the final arbiter).
		if (nameAvailable === false) return false;
		if (selectedOption === "copy" && !formData.sourceAssortmentNumber) {
			return false;
		}
		// Excel flow doesn't go through this submit path.
		if (selectedOption === "excel") return false;
		return !createMutation.isPending;
	}, [selectedOption, formData, nameAvailable, createMutation.isPending]);

	const submit = useCallback(async () => {
		if (!selectedOption || selectedOption === "excel") return;
		const selectedArr = Array.from(formData.selectedCategoryNumbers);
		const body = (() => {
			const base = {
				assortmentName: formData.name.trim(),
				assortmentDescription:
					formData.description.trim().length > 0
						? formData.description.trim()
						: undefined,
				users: formData.users.length > 0 ? formData.users : undefined,
			};
			if (selectedOption === "new") {
				return {
					...base,
					sourceAssortmentNumber: DEFAULT_SALES_NEW,
					selectedCategoryNumbers:
						selectedArr.length > 0 ? selectedArr : undefined,
				};
			}
			if (selectedOption === "copy") {
				return {
					...base,
					sourceAssortmentNumber: formData.sourceAssortmentNumber ?? undefined,
					selectedCategoryNumbers:
						selectedArr.length > 0 ? selectedArr : undefined,
				};
			}
			// egne: no source, no selectedCategoryNumbers.
			return base;
		})();

		try {
			const result = await createMutation.mutateAsync(body);
			deps.onSuccess?.(result.assortment.assortmentNumber);
			reset();
		} catch (err) {
			deps.onError?.(err);
			throw err;
		}
	}, [selectedOption, formData, createMutation, deps, reset]);

	return {
		// State
		selectedOption,
		formData,
		effectiveSourceNumber,
		// Derived
		canSubmit,
		isSubmitting: createMutation.isPending,
		nameAvailable,
		isCheckingName,
		submitError: createMutation.error,
		// Actions
		setOption,
		setMeta,
		setSource,
		setCategoriesBulk,
		addUser,
		removeUser,
		setUserRole,
		reset,
		submit,
	};
}

export type AssortmentWizardController = ReturnType<typeof useAssortmentWizard>;
