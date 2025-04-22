import { useEffect, useState } from "react";

import { categoryIconMap } from "@/constants/mainCategoryIcons";
import axiosClient from "@/services/axiosClient";
import { RawCategory } from "@/types/categories.types";
import { Package } from "lucide-react";
import { useLocale } from "next-intl";

export interface MainCategory {
	id: string;
	name: string;
	description: string;
	icon: React.ElementType;
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
					.filter((cat) => cat.group_id)
					.map((cat) => ({
						id: cat.group_id,
						name: locale === "no" ? cat.name_no || "" : cat.name_en || "",
						description: "",
						icon: categoryIconMap[cat.group_id] ?? Package,
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
