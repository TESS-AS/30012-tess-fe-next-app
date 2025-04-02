import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, StoreState, User } from '../types/store.types';

export const useStore = create<StoreState>()(
    persist(
      (set, get) => ({
        // Cart slice
        cart: [],
        addToCart: (product: Product) => {
          const cart = get().cart;
          const exists = cart.find((item) => item.id === product.id);
          if (exists) {
            set({
              cart: cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
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
              item.id === productId ? { ...item, quantity } : item
            ),
          })),
        clearCart: () => set({ cart: [] }),
  
        // Product slice
        products: [],
        setProducts: (products: Product[]) => set({ products }),
        filterProducts: (criteria: any) => {
        },
  
        // User slice
        user: null,
        setUser: (user: User) => set({ user }),
        clearUser: () => set({ user: null }),
  
        // UI slice
        isLoading: false,
        setLoading: (loading: boolean) => set({ isLoading: loading }),
      }),
      {
        name: 'ecommerce-storage',
      }
    )
  );
  