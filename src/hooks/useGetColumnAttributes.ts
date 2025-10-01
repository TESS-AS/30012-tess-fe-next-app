import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Attribute {
	attributeIdentifier: string;
	name: string;
	language: string;
	dataType: string;
	valueDef: string;
	valueMax?: string;
	contentUnit?: string;
	unspsc?: string;
}

interface ColumnAttributeResponse {
	[itemNumber: string]: {
		productNumber: string;
		itemNumber: string;
		itemCount?: number | string;
		inventory?: {
			warehouseId: number;
			companyId: number;
			balance: number;
		}[];
		attributes: Attribute[];
		mediaId?: Array<{
			url: string;
			filename: string;
			picture_type: string;
			thumbnail_url: string;
		}>;
	};
}

export function useGetColumnAttributes(variantNumber?: string) {
	const [data, setData] = useState<ColumnAttributeResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!variantNumber) return;

		const fetchAttributes = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get(
					`/columnAttributes/${variantNumber}`,
				);
				setData(response.data);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAttributes();
	}, [variantNumber]);

	return { data, isLoading, error };
}
