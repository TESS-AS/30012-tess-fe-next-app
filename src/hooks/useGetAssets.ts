import { useEffect, useState } from "react";

import { getAssets, getS1Codes } from "@/services/assets.service";
import { GetAssetsResponse, S1Codes } from "@/types/assets.types";

export const useGetAssets = (customerNumber?: string, s1Code?: string) => {
	const [s1Codes, setS1Codes] = useState<S1Codes[]>([]);
	const [assets, setAssets] = useState<GetAssetsResponse[]>([]);
	const [loading, setLoading] = useState(false);
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

	const fetchAssets = async (page: number = 1, pageSize: number = 10) => {
		try {
			setLoading(true);
			const response = await getAssets(customerNumber, s1Code, page, pageSize);
			setAssets(response.data);
			setPagination({
				currentPage: response.meta.page,
				pageSize: response.meta.pageSize,
				totalItems: response.meta.totalItems,
				totalPages: response.meta.totalPages,
			});
		} catch (error) {
			setError(error as string);
		} finally {
			setLoading(false);
		}
	};

	const fetchS1Codes = async (page: number = 1, pageSize: number = 100) => {
		try {
			setLoading(true);
			const response = await getS1Codes(page, pageSize);

			setS1Codes((prevCodes) => {
				const allCodes = page === 1 ? [] : prevCodes;
				response.data.forEach((newCode) => {
					if (!allCodes.find((item) => item.S1Code === newCode.S1Code)) {
						allCodes.push(newCode);
					}
				});
				return allCodes;
			});

			setS1CodesPagination({
				currentPage: response.meta.page,
				pageSize: response.meta.pageSize,
				totalItems: response.meta.total,
				totalPages: response.meta.totalPages,
			});
		} catch (error) {
			setError(error as string);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAssets();
	}, [customerNumber, s1Code]);

	useEffect(() => {
		fetchS1Codes();
	}, []);

	return {
		assets,
		setAssets,
		s1Codes,
		setS1Codes,
		loading,
		error,
		pagination,
		s1CodesPagination,
		fetchAssets,
		fetchS1Codes,
	};
};
