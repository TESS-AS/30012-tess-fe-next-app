import { create } from "zustand";

interface NavMenuState {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	// Slug another page (e.g. /alle-kategorier tiles) asked the header megamenu
	// to open. NavigationMenu consumes this, opens the matching category, and
	// clears it back to null.
	requestedOpenSlug: string | null;
	requestOpen: (slug: string | null) => void;
	// Top-level nav slug that owns the current product page. The product page
	// resolves it from the product's category tree and sets it here so the
	// header nav can persistently highlight the correct root — used for URLs
	// that don't carry category info (e.g. /produkt/:id search-result links).
	// Cleared on unmount.
	productTopLevelSlug: string | null;
	setProductTopLevelSlug: (slug: string | null) => void;
}

export const useNavMenuStore = create<NavMenuState>((set) => ({
	isOpen: false,
	setIsOpen: (open) => set({ isOpen: open }),
	requestedOpenSlug: null,
	requestOpen: (slug) => set({ requestedOpenSlug: slug }),
	productTopLevelSlug: null,
	setProductTopLevelSlug: (slug) => set({ productTopLevelSlug: slug }),
}));
