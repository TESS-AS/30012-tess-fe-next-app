import type { Rekvisisjon, RequisitionStatus } from "@/hooks/useRequisitions";
import type { PlacerAddress } from "@/types/requisitions";

export const formatPlacerAddress = (address: PlacerAddress): string =>
	[
		address.addressLine1,
		address.addressLine2,
		address.addressLine3,
		[address.postalCode, address.city].filter(Boolean).join(" "),
		address.countryCode,
	]
		.filter(Boolean)
		.join(", ");

export const getStatusCount = (
	status: RequisitionStatus,
	rekvisisjoner: Rekvisisjon[],
) => {
	if (status === "Alle") return rekvisisjoner.length;
	return rekvisisjoner.filter((r) => r.status === status).length;
};
