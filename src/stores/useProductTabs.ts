import { create } from "zustand";

interface ProductTabsState {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

export const useProductTabs = create<ProductTabsState>((set) => ({
	activeTab: "description",
	setActiveTab: (tab) => set({ activeTab: tab }),
}));
