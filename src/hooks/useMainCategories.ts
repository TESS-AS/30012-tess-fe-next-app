import { useEffect, useState } from "react";

import { categoryImageMap } from "@/constants/mainCategoryIcons";
import axiosClient from "@/services/axiosClient";
import { RawCategory } from "@/types/categories.types";
import { useLocale } from "next-intl";

export interface MainCategory {
	id: string;
	name: string;
	description: string;
	image: string;
}

export function useMainCategories() {
	const [data, setData] = useState<MainCategory[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const locale = useLocale();

	useEffect(() => {
		const fetchMainCategories = async () => {
			try {
				setIsLoading(true);
				const response =
					await axiosClient.get<RawCategory[]>("/mainCategories");

				const transformed: MainCategory[] = response.data
					.filter((cat) => cat.groupId)
					.map((cat) => ({
						id: cat.groupId,
						name: locale === "no" ? cat.nameNo || "" : cat.nameEn || "",
						description: "",
						image:
							categoryImageMap[cat.groupId] ?? "/images/categories/default.jpg",
					}));

				setData(transformed);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMainCategories();
	}, [locale]);

	return { data, isLoading, error };
}
