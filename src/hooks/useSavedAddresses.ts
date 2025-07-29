// hooks/useSavedAddresses.ts
import { useGetUserAdresses } from "@/hooks/useGetUserAdresses";
import { useGetBusinessAddresses } from "@/hooks/useGetBusinessAddresses";
import { useGetOrganizationAddresses } from "@/hooks/useGetOrganizationAddresses";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useMemo } from "react";
import { SavedAddress } from "@/types/address";

export const useSavedAddresses = () => {
	const { data: profile } = useGetProfileData();
	const { data: personalAddresses } = useGetUserAdresses();
	const { data: businessAddresses } = useGetBusinessAddresses(profile?.customerNumbers?.[0], true);
	const { data: orgAddresses } = useGetOrganizationAddresses("980386996");

	const savedAddresses: SavedAddress[] = useMemo(() => {
		return [
			...(personalAddresses?.map((address) => ({
				id: String(address.addressId),
				type: "bruker" as const,
				name: address.addressName,
				street: address.addressLine1,
				houseNumber: address.addressLine2,
				postalCode: address.postalCode,
				city: address.city,
				extraInfo: address.addressLine3 || "",
			})) ?? []),

			...(businessAddresses?.map((address) => ({
				id: String(address.addressId),
				type: "kunde" as const,
				name: address.addressName,
				street: address.addressLine1,
				houseNumber: address.addressLine2,
				postalCode: address.postalCode,
				city: address.city,
				extraInfo: address.addressLine3 || "",
			})) ?? []),

			...(orgAddresses?.map((address) => ({
				id: String(address.addressId),
				type: "organisasjon" as const,
				name: address.addressName,
				street: address.addressLine1,
				houseNumber: address.addressLine2,
				postalCode: address.postalCode,
				city: address.city,
				extraInfo: address.addressLine3 || "",
			})) ?? []),
		];
	}, [personalAddresses, businessAddresses, orgAddresses]);

	return savedAddresses;
};
