import { create } from "zustand";

interface NavMenuState {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	// Slug another page (e.g. /alle-kategorier tiles) asked the header megamenu
	// to open. NavigationMenu consumes this, opens the matching category, and
	// clears it back to null.
	requestedOpenSlug: string | null;
	requestOpen: (slug: string | null) => void;
}

export const useNavMenuStore = create<NavMenuState>((set) => ({
	isOpen: false,
	setIsOpen: (open) => set({ isOpen: open }),
	requestedOpenSlug: null,
	requestOpen: (slug) => set({ requestedOpenSlug: slug }),
}));
