"use client";

import { useEffect, useState } from "react";

import { mapCategoryTree } from "@/lib/utils";
import axiosInstance from "@/services/axiosClient";
import { Category } from "@/types/categories.types";

export function useCategories(locale: string) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!locale) return;

		const fetchCategories = async () => {
			setLoading(true);
			try {
				const response = await axiosInstance.get(`/categories/${locale}`);
				const transformed = response.data.map((item: any) =>
					mapCategoryTree(item, locale),
				);
				setCategories(transformed);
			} catch (err) {
				console.error("Error fetching categories:", err);
				setError("Failed to load categories");
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
	}, [locale]);

	return { categories, loading, error };
}
