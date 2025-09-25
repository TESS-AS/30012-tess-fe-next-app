import { useCallback, useEffect, useState } from "react";

import { getAssets, getS1Codes, searchAssets } from "@/services/assets.service";
import { GetAssetsResponse, S1Codes } from "@/types/assets.types";

export interface FilterOptions {
	page?: number;
	pageSize?: number;
	ageSize?: string;
	approved?: string;
	overdue?: string;
	replacementDue?: string;
	spareSet?: string;
	rejected?: string;
}

export const useGetAssets = (customerNumber?: string, s1Code?: string) => {
	const [initialized, setInitialized] = useState(false);
	const [s1Codes, setS1Codes] = useState<S1Codes[]>([]);
	const [assets, setAssets] = useState<GetAssetsResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingRef, setLoadingRef] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		pageSize: 10,
		totalItems: 0,
		totalPages: 0,
	});
	const [s1CodesPagination, setS1CodesPagination] = useState({
		currentPage: 1,
		pageSize: 100,
		totalItems: 0,
		totalPages: 0,
	});

	const fetchAssets = useCallback(
		async ({
			page = 1,
			pageSize = 10,
			ageSize,
			approved,
			overdue,
			replacementDue,
			spareSet,
			rejected,
			search,
		}: FilterOptions & { search?: string } = {}) => {
			try {
				const result = search
					? await searchAssets(
							search,
							customerNumber,
							s1Code,
							page,
							pageSize,
							ageSize,
							approved,
							overdue,
							replacementDue,
							spareSet,
							rejected,
						)
					: await getAssets(
							customerNumber,
							s1Code,
							page,
							pageSize,
							ageSize,
							approved,
							overdue,
							replacementDue,
							spareSet,
							rejected,
						);

				return result;
			} catch (error) {
				setError(error as string);
				throw error;
			}
		},
		[customerNumber, s1Code],
	);

	const fetchS1Codes = useCallback(
		async (page: number = 1, pageSize: number = 100) => {
			try {
				const response = await getS1Codes(page, pageSize);
				return response;
			} catch (error) {
				setError(error as string);
				throw error;
			}
		},
		[],
	);

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			setLoadingRef(true);
			setAssets([]);

			try {
				if (!initialized) {
					setS1Codes([]);
					const [assetsResult, s1CodesResult] = await Promise.all([
						fetchAssets({}),
						fetchS1Codes(),
					]);

					setAssets(assetsResult.data);
					setPagination({
						currentPage: assetsResult.meta.page,
						pageSize: assetsResult.meta.pageSize,
						totalItems: assetsResult.meta.totalItems,
						totalPages: assetsResult.meta.totalPages,
					});

					const allCodes: S1Codes[] = [];
					s1CodesResult.data.forEach((newCode) => {
						if (!allCodes.find((item) => item.S1Code === newCode.S1Code)) {
							allCodes.push(newCode);
						}
					});
					setS1Codes(allCodes);
					setS1CodesPagination({
						currentPage: s1CodesResult.meta.page,
						pageSize: s1CodesResult.meta.pageSize,
						totalItems: s1CodesResult.meta.total,
						totalPages: s1CodesResult.meta.totalPages,
					});

					setInitialized(true);
				} else {
					const assetsResult = await fetchAssets({});
					setAssets(assetsResult.data);
					setPagination({
						currentPage: assetsResult.meta.page,
						pageSize: assetsResult.meta.pageSize,
						totalItems: assetsResult.meta.totalItems,
						totalPages: assetsResult.meta.totalPages,
					});
				}
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setLoading(false);
				setLoadingRef(false);
			}
		};

		loadInitialData();
	}, [customerNumber, s1Code, initialized]);

	return {
		assets,
		setAssets,
		s1Codes,
		setS1Codes,
		loading: loading || loadingRef,
		setLoading,
		error,
		pagination,
		s1CodesPagination,
		fetchAssets,
		fetchS1Codes,
	};
};
