"use client";

import { useEffect, useState } from "react";

export interface Category {
	name: string;
	slug: string;
}

export function useCategories(query = "") {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<null | string>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`https://30011-proxyapi-cuafeua6bha7ckby.norwayeast-01.azurewebsites.net/searchCategory/${query}`,
				);
				const data = await res.json();
				setCategories(data.categories ?? []);
			} catch (err) {
				setError("Failed to fetch categories");
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
	}, [query]);

	return { categories, loading, error };
}
