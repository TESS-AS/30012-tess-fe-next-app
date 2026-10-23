type DirectPurchaseFields = {
	ecom?: number | boolean | null;
	ecomEligible?: boolean | null;
};

/**
 * A hose cannot be ordered when ecom is 2 or 3, or when ecomEligible is false.
 * ecom 1 is orderable only while ecomEligible is not false.
 */
export function isDirectPurchaseBlocked(
	...sources: Array<DirectPurchaseFields | null | undefined>
): boolean {
	const ecomEligible = sources.find(
		(source) => source?.ecomEligible != null,
	)?.ecomEligible;
	if (ecomEligible === false) return true;

	const ecom = sources.find((source) => source?.ecom != null)?.ecom;
	const value = Number(ecom);
	return value === 2 || value === 3;
}
