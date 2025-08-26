import { create } from "zustand";

interface SearchState {
	shouldFocus: boolean;
	triggerFocus: () => void;
	resetFocus: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
	shouldFocus: false,
	triggerFocus: () => set({ shouldFocus: true }),
	resetFocus: () => set({ shouldFocus: false }),
}));
