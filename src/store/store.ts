import { Category } from "@/types/categories.types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Product, StoreState, User } from "../types/store.types";

export const useStore = create<StoreState>()(
	persist(
		(set, get) => ({
			// Cart slice
			cart: [],
			addToCart: (product: Product) => {
				const { cart } = get();
				const exists = cart.find((item) => item.id === product.id);
				if (exists) {
					set({
						cart: cart.map((item) =>
							item.id === product.id
								? { ...item, quantity: item.quantity + 1 }
								: item,
						),
					});
				} else {
					set({ cart: [...cart, { ...product, quantity: 1 }] });
				}
			},
			removeFromCart: (productId: string) =>
				set((state) => ({
					cart: state.cart.filter((item) => item.id !== productId),
				})),
			updateQuantity: (productId: string, quantity: number) =>
				set((state) => ({
					cart: state.cart.map((item) =>
						item.id === productId ? { ...item, quantity } : item,
					),
				})),
			clearCart: () => set({ cart: [] }),

			// Product slice
			products: [],
			setProducts: (products: Product[]) => set({ products }),
			filterProducts: (criteria: any) => {},

			// User slice
			user: null,
			setUser: (user: User) => set({ user }),
			clearUser: () => set({ user: null }),

			// UI slice
			isLoading: false,
			setLoading: (loading: boolean) => set({ isLoading: loading }),

			categories: [],
			setCategories: (categories: Category[]) => set({ categories }),
		}),
		{
			name: "ecommerce-storage",
			storage: createJSONStorage(() => {
				// Only use localStorage in the browser
				if (typeof window !== "undefined") {
					return window.localStorage;
				}
				// Return a dummy storage for SSR
				return {
					getItem: () => null,
					setItem: () => {},
					removeItem: () => {},
				};
			}),
		},
	),
);
