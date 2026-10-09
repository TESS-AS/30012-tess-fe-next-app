import type { HoseSelectionItem } from "@/types/hose-configurator.types";

const STORAGE_KEY = "hoseConfigurator.draft.v2";

export type HoseBruksomradeDraft = {
	medium: string;
	workingPressure: string;
	temperatureMin?: string;
	temperatureMax?: string;
	/** Older drafts stored a single temperature. */
	temperature?: string;
	hoseSize: string;
	customEndSize: boolean;
	moreRequirements: string;
};

export type HoseSelectedProductDraft = {
	id: string;
	name: string;
	description: string;
	imageSrc: string;
	href: string;
	itemNumber: string;
	productNumber?: string;
	itemName: string;
	stockOptions: string[];
	documentCount: number;
	maxCoilMeters: number;
};

export type HoseEndConfigDraft = {
	fittingType: string;
	connection: string;
	size: string;
	design: string;
	material: string;
};

export type HoseSpecsDraft = {
	endsEqual: boolean;
	end1: HoseEndConfigDraft;
	end2: HoseEndConfigDraft;
	angle: string;
	options: {
		innerCleaning: boolean;
		flushing: boolean;
		testCertificate: boolean;
		spiralProtection: boolean;
		protectionSleeve: boolean;
		heatFireProtection: boolean;
		rfid: boolean;
		hoseTag: boolean;
		extraMarking: boolean;
	};
	customMarking: string;
};

export type HoseKoblingerDraft = {
	lengthMtr: string;
	quantity: number;
	warehouseNumber: string;
};

export type HoseConfiguratorDraft = {
	version: 2;
	currentStep: number;
	bruksomrade: HoseBruksomradeDraft | null;
	hasSearched: boolean;
	selectedProduct: HoseSelectedProductDraft | null;
	selectionResults: HoseSelectionItem[] | null;
	koblinger: HoseKoblingerDraft | null;
	specs: HoseSpecsDraft | null;
};

export const EMPTY_DRAFT: HoseConfiguratorDraft = {
	version: 2,
	currentStep: 0,
	bruksomrade: null,
	hasSearched: false,
	selectedProduct: null,
	selectionResults: null,
	koblinger: null,
	specs: null,
};

function canUseStorage(): boolean {
	return (
		typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
	);
}

export function loadHoseConfiguratorDraft(): HoseConfiguratorDraft | null {
	if (!canUseStorage()) return null;
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as HoseConfiguratorDraft;
		if (parsed?.version !== 2) return null;
		return {
			...EMPTY_DRAFT,
			...parsed,
			version: 2,
		};
	} catch {
		return null;
	}
}

export function saveHoseConfiguratorDraft(draft: HoseConfiguratorDraft): void {
	if (!canUseStorage()) return;
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
	} catch {
		// Quota / private mode — ignore; configurator still works without persistence.
	}
}

export function patchHoseConfiguratorDraft(
	patch: Partial<HoseConfiguratorDraft>,
): HoseConfiguratorDraft {
	const current = loadHoseConfiguratorDraft() ?? { ...EMPTY_DRAFT };
	const next = { ...current, ...patch, version: 2 as const };
	saveHoseConfiguratorDraft(next);
	return next;
}

export function clearHoseConfiguratorDraft(): void {
	if (!canUseStorage()) return;
	try {
		window.sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}
