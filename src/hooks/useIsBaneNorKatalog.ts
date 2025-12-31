import { useMemo } from "react";

import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useGetProfileData } from "@/hooks/useGetProfileData";

/**
 * Hook to check if the current assortment is "Bane NOR Katalog"
 * @param selectedAssortment - Optional assortment number to override the profile's default
 * @returns boolean indicating if the current assortment is "Bane NOR Katalog"
 */
export function useIsBaneNorKatalog(selectedAssortment?: string) {
	const { data: profile } = useGetProfileData();
	const { assortments } = useGetAssortments(!!profile);

	const isBaneNorKatalog = useMemo(() => {
		if (!assortments.length) return false;
		const assortmentNumber =
			selectedAssortment || profile?.defaultAssortmentNumber;
		if (!assortmentNumber) return false;
		const currentAssortment = assortments.find(
			(a: any) => a.assortmentnumber === assortmentNumber,
		);
		return (
			currentAssortment?.nameNo === "Bane NOR Katalog" ||
			currentAssortment?.nameEn === "Bane NOR Katalog" ||
			currentAssortment?.assortmentname === "Bane NOR Katalog"
		);
	}, [selectedAssortment, profile, assortments]);

	return isBaneNorKatalog;
}

