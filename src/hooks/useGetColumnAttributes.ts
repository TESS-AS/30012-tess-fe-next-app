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

interface ColumnAttributeItem {
	productNumber: string;
	itemNumber: string;
	itemName?: string;
	itemCount?: number | string;
	inventory?: {
		wareHouseId: number;
		wareHouseNumber: string;
		wareHouseName: string;
		companyId: number;
		companyNumber: number;
		balance: number;
	}[];
	attributes: Attribute[];
	mediaId?: Array<{
		url: string;
		filename: string;
		picture_type: string;
		thumbnail_url: string;
	}>;
}

interface ColumnAttributeResponse {
	productAttributes?: any; // Product-level attributes from first object
	[itemNumber: string]:
		| {
				productNumber: string;
				itemNumber: string;
				itemName?: string;
				itemCount?: number | string;
				inventory?: {
					warehouseId: number;
					warehouseNumber?: string;
					warehouseName: string;
					companyId: number;
					companyNumber?: number;
					balance: number;
				}[];
				attributes: Attribute[];
				mediaId?: Array<{
					url: string;
					filename: string;
					picture_type: string;
					thumbnail_url: string;
				}>;
		  }
		| Attribute[];
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
				const response = await axiosClient.get<ColumnAttributeItem[]>(
					`/columnAttributesNew/${variantNumber}`,
				);

				// Transform array response to object format keyed by itemNumber
				const transformedData: ColumnAttributeResponse = {};

				response.data.forEach((item) => {
					// First object without itemNumber contains product-level attributes
					if (!item.itemNumber) {
						transformedData.productAttributes = item.attributes || [];
					} else {
						transformedData[item.itemNumber] = {
							productNumber: item.productNumber,
							itemNumber: item.itemNumber,
							itemName: item.itemName,
							itemCount: item.itemCount,
							inventory: item.inventory?.map((inv) => ({
								warehouseId: inv.wareHouseId,
								warehouseNumber: inv.wareHouseNumber,
								warehouseName: inv.wareHouseName,
								companyId: inv.companyId,
								companyNumber: inv.companyNumber,
								balance: inv.balance,
							})),
							attributes: item.attributes,
							mediaId: item.mediaId,
						};
					}
				});

				setData(transformedData);
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
