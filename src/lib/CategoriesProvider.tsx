// context/CategoriesContext.tsx
"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";

import { mapCategoryTree } from "@/lib/utils";
import axiosClient from "@/services/axiosClient";
import type { RawCategory, Category } from "@/types/categories.types";

interface CategoriesContextValue {
	categories: Category[] | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(
	undefined,
);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
	const [categories, setCategories] = useState<Category[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await axiosClient.get("/categories");
			const raw: RawCategory[] = res.data;
			// Always use Norwegian for category names
			const mapped = raw.map((node) => mapCategoryTree(node, "no"));
			setCategories(mapped);
		} catch (err: any) {
			setError(err?.response?.data?.message || "Failed to load categories");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return (
		<CategoriesContext.Provider
			value={{ categories, loading, error, refetch: fetchCategories }}>
			{children}
		</CategoriesContext.Provider>
	);
};

export const useCategories = (): CategoriesContextValue => {
	const ctx = useContext(CategoriesContext);
	if (!ctx) {
		throw new Error("useCategories must be used within a CategoriesProvider");
	}
	return ctx;
};
