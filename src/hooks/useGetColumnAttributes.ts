import { useEffect, useRef, useState } from "react";

import axiosClient from "@/services/axiosClient";

interface Attribute {
	attributeIdentifier: string;
	name: string;
	language: string;
	dataType: string;
	valueDef: string;
	valueMax?: string;
	nameKeyLanguage?: string;
	contentUnit?: string;
	unspsc?: string;
	valueVector?: string;
}

interface InventoryItem {
	wareHouseId: number;
	wareHouseNumber: string;
	wareHouseName: string;
	companyId: number;
	companyNumber: number;
	balance: number;
}

interface MediaItem {
	url: string;
	filename: string;
	picture_type: string;
	thumbnail_url: string;
}

interface VariantItemData {
	itemName: string;
	SDS?: string;
	GTIN?: string | null;
	itemCount?: number | string;
	inventory: InventoryItem[];
	attributes: Attribute[];
	mediaId: MediaItem[];
	relatedProducts?: Array<Record<string, unknown>>;
}

interface VariantData {
	itemNumber: string;
	itemData: VariantItemData;
}

interface ProductData {
	campaign?: string;
	multiple?: string;
	countryOfOrigin?: string;
	hsCode?: string;
	status?: string;
	salesCatGroup?: string;
	productNameEn?: string;
	productNameNo?: string;
	usersEn?: string;
	usersNo?: string;
	remarksEn?: string;
	remarksNo?: string;
	shortDescEn?: string;
	shortDescNo?: string;
	longDescEn?: string;
	longDescNo?: string;
	uspEn?: Record<string, string>;
	uspNo?: Record<string, string>;
	bvp?: string;
	mediaId?: MediaItem;
	defaultAttributes?: Array<{
		name: string;
		attributeIdentifier: string;
	}>;
	attributes: Attribute[];
}

interface ColumnAttributeApiResponse {
	productNumber: string;
	productData: ProductData;
	variantData: VariantData[];
}

export type ColumnAttributeResponse = {
	productAttributes?: Attribute[]; // Product-level attributes
	productData?: ProductData; // Full product-level object with shortDesc, longDesc, etc.
} & {
	[itemNumber: string]:
		| {
				productNumber: string;
				itemNumber: string;
				itemName?: string;
				itemCount?: number | string;
				SDS?: string;
				GTIN?: string | null;
				inventory?: {
					warehouseId: number;
					warehouseNumber?: string;
					warehouseName: string;
					companyId: number;
					companyNumber?: number;
					balance: number;
				}[];
				attributes: Attribute[];
				mediaId?: MediaItem[];
				relatedProducts?: Array<Record<string, unknown>>;
		  }
		| Attribute[]
		| undefined;
};

export function useGetColumnAttributes(variantNumber?: string) {
	const [data, setData] = useState<ColumnAttributeResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const hasReceivedDataRef = useRef(false);

	useEffect(() => {
		if (!variantNumber) return;

		const fetchAttributes = async () => {
			const isInitialLoad = !hasReceivedDataRef.current;
			// Stale-while-revalidate: only show full loading on initial load so the table doesn't flash when refetching on variant change (e.g. for itemRelatedProducts)
			if (isInitialLoad) {
				setIsLoading(true);
			} else {
				setIsFetching(true);
			}

			try {
				const params = new URLSearchParams();
				params.append("itemNumber", variantNumber);
				const response = await axiosClient.get<ColumnAttributeApiResponse>(
					`/columnAttributes?${params.toString()}`,
				);

				// Transform new response structure to expected format
				const transformedData: ColumnAttributeResponse = {};

				// Store product-level data
				if (response.data.productData) {
					transformedData.productData = response.data.productData;
					transformedData.productAttributes =
						response.data.productData.attributes || [];
				}

				// Normalize mediaId: API may return array or single object (product-level is object, variant can be either)
				const toMediaArray = (raw: unknown): MediaItem[] => {
					if (Array.isArray(raw)) return raw as MediaItem[];
					if (raw && typeof raw === "object" && "url" in (raw as object))
						return [raw as MediaItem];
					return [];
				};

				// Transform variant data array to object format keyed by itemNumber
				if (
					response.data.variantData &&
					Array.isArray(response.data.variantData)
				) {
					response.data.variantData.forEach((variant) => {
						const { itemNumber, itemData } = variant;

						transformedData[itemNumber] = {
							productNumber: response.data.productNumber,
							itemNumber: itemNumber,
							itemName: itemData.itemName,
							itemCount: itemData.itemCount,
							SDS: itemData.SDS,
							GTIN: itemData.GTIN ?? null,
							inventory: itemData.inventory?.map((inv) => ({
								warehouseId: inv.wareHouseId,
								warehouseNumber: inv.wareHouseNumber,
								warehouseName: inv.wareHouseName,
								companyId: inv.companyId,
								companyNumber: inv.companyNumber,
								balance: inv.balance,
							})),
							attributes: itemData.attributes || [],
							mediaId: toMediaArray(itemData.mediaId),
							relatedProducts: itemData.relatedProducts ?? [],
						};
					});
				}

				hasReceivedDataRef.current = true;
				setData(transformedData);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
				setIsFetching(false);
			}
		};

		fetchAttributes();
	}, [variantNumber]);

	return { data, isLoading, isFetching, error };
}
