import { create } from "zustand";

interface NavMenuState {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

export const useNavMenuStore = create<NavMenuState>((set) => ({
	isOpen: false,
	setIsOpen: (open) => set({ isOpen: open }),
}));
