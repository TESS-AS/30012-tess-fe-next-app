import { useState, useCallback, useEffect } from "react";

import { getCart } from "@/services/carts.service";
import { CartLine } from "@/types/carts.types";
import { useSession } from "next-auth/react";

export function useCart() {
	const { data: session, status } = useSession();
	const [cart, setCart] = useState<CartLine[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchCart = useCallback(async () => {
		if (status !== "authenticated") {
			setCart([]);
			return [];
		}
		try {
			setLoading(true);
			setError(null);
			const items = await getCart();
			setCart(items);
			return items;
		} catch (err) {
			setError("Failed to fetch cart");
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (status === "authenticated") {
			fetchCart();
		} else {
			setCart([]);
		}
	}, [status, fetchCart]);

	return {
		cart,
		loading,
		error,
		fetchCart,
		isAuthenticated: status === "authenticated",
	};
}
