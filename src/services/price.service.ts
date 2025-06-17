import { PriceResponse } from "@/types/search.types";

export const getProductPrice = async (
	companyId: string,
	branchId: string,
	productNumber: string,
): Promise<PriceResponse[]> => {
	const response = await fetch(
		`/api/price/${companyId}/${branchId}/product/${productNumber}`,
	);
	if (!response.ok) {
		throw new Error("Failed to fetch product price");
	}
	return response.json();
};

export const calculateItemPrice = async (
	items: {
		itemNumber: string;
		quantity: number;
		warehouseNumber: string;
	}[],
	companyId: string,
	branchId: string,
): Promise<PriceResponse[]> => {
	const response = await fetch(
		`/api/price/${companyId}/${branchId}/calculate`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(items),
		},
	);
	if (!response.ok) {
		throw new Error("Failed to calculate item prices");
	}
	return response.json();
};
