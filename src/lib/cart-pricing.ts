import { calculateItemPrice } from "@/services/product.service";

/**
 * The BE pricing endpoint takes a single (customerNumber, companyNumber) per
 * call, but a cart can hold items from warehouses in different companies. This
 * helper buckets requests by company and fires one price call per bucket in
 * parallel, then flattens the results.
 */

export interface PricingRequestWithCompany {
	itemNumber: string;
	quantity: number;
	warehouseNumber: string;
	companyNumber: string;
}

export async function priceItemsByCompany(
	requests: PricingRequestWithCompany[],
	customerNumber: string,
	fallbackCompanyNumber: string,
) {
	if (requests.length === 0) return [];

	const byCompany = new Map<
		string,
		Array<{ itemNumber: string; quantity: number; warehouseNumber: string }>
	>();
	for (const req of requests) {
		const company = req.companyNumber || fallbackCompanyNumber;
		const bucket = byCompany.get(company);
		const stripped = {
			itemNumber: req.itemNumber,
			quantity: req.quantity,
			warehouseNumber: req.warehouseNumber,
		};
		if (bucket) bucket.push(stripped);
		else byCompany.set(company, [stripped]);
	}

	const perCompanyResults = await Promise.all(
		Array.from(byCompany.entries()).map(([company, reqs]) =>
			calculateItemPrice(reqs, customerNumber, company),
		),
	);
	return perCompanyResults.flat();
}
