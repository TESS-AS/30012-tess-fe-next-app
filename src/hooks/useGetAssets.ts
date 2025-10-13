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

type InitOptions = {
	initAssets?: boolean;
	initS1Codes?: boolean;
	s2Filter?: boolean;
};

export const useGetAssets = (
	customerNumber?: string,
	s1Code?: string,
	options: InitOptions = {
		initAssets: true,
		initS1Codes: true,
		s2Filter: false,
	},
) => {
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
				setLoading(true);
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

				setAssets(result.data);
				setPagination({
					currentPage: result.meta.page,
					pageSize: result.meta.pageSize,
					totalItems: result.meta.totalItems,
					totalPages: result.meta.totalPages,
				});

				return result;
			} catch (error) {
				setError(error as string);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[customerNumber, s1Code],
	);

	const fetchS1Codes = useCallback(
		async (page: number = 1, pageSize: number = 100, s2?: boolean) => {
			try {
				const response = await getS1Codes(page, pageSize, s2);
				return response;
			} catch (error) {
				setError(error as string);
				throw error;
			}
		},
		[],
	);

	const ensureS1Codes = useCallback(async () => {
		if (s1Codes.length > 0) return s1Codes;
		try {
			const res = await fetchS1Codes(1, 100, options.s2Filter);
			const allCodes: S1Codes[] = [];
			res.data.forEach((newCode: S1Codes) => {
				if (!allCodes.find((item) => item.S1Code === newCode.S1Code)) {
					allCodes.push(newCode);
				}
			});
			setS1Codes(allCodes);
			setS1CodesPagination({
				currentPage: res.meta.page,
				pageSize: res.meta.pageSize,
				totalItems: res.meta.total,
				totalPages: res.meta.totalPages,
			});
			return allCodes;
		} catch (e) {
			throw e;
		}
	}, [s1Codes.length, fetchS1Codes, options.s2Filter]);

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			setLoadingRef(true);
			setAssets([]);

			try {
				if (!initialized) {
					setS1Codes([]);
					if (options.initAssets !== false) {
						const assetsResult = await fetchAssets({});
						setAssets(assetsResult.data);
						setPagination({
							currentPage: assetsResult.meta.page,
							pageSize: assetsResult.meta.pageSize,
							totalItems: assetsResult.meta.totalItems,
							totalPages: assetsResult.meta.totalPages,
						});
					}

					if (options.initS1Codes !== false && s1Codes.length === 0) {
						await ensureS1Codes();
					}

					setInitialized(true);
				} else {
					if (options.initAssets !== false) {
						const assetsResult = await fetchAssets({});
						setAssets(assetsResult.data);
						setPagination({
							currentPage: assetsResult.meta.page,
							pageSize: assetsResult.meta.pageSize,
							totalItems: assetsResult.meta.totalItems,
							totalPages: assetsResult.meta.totalPages,
						});
					}
				}
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setLoading(false);
				setLoadingRef(false);
			}
		};

		loadInitialData();
	}, [
		customerNumber,
		s1Code,
		initialized,
		options.initAssets,
		options.initS1Codes,
		s1Codes.length,
		ensureS1Codes,
	]);

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
		ensureS1Codes,
	};
};
