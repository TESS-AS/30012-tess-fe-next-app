"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { PlacerAddress } from "@/types/requisitions";
import { useTranslations } from "next-intl";

interface PlacerAddressPickerProps {
	placerName: string;
	addresses: PlacerAddress[];
	selectedAddressId: number | null;
	onSelect: (addressId: number) => void;
}

const formatLine = (a: PlacerAddress): string =>
	[
		a.addressLine1,
		a.addressLine2,
		[a.postalCode, a.city].filter(Boolean).join(" "),
	]
		.filter(Boolean)
		.join(", ");

export function PlacerAddressPicker({
	placerName,
	addresses,
	selectedAddressId,
	onSelect,
}: PlacerAddressPickerProps) {
	const t = useTranslations("Checkout.placerPicker");

	if (addresses.length <= 1) return null;

	return (
		<div className="rounded-lg border border-[#C1C4C2] bg-white p-4">
			<label className="mb-2 block text-sm font-medium text-[#0F1912]">
				{t("label", { name: placerName })}
			</label>
			<Select
				value={selectedAddressId != null ? String(selectedAddressId) : ""}
				onValueChange={(value) => onSelect(Number(value))}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("placeholder")} />
				</SelectTrigger>
				<SelectContent>
					{addresses.map((a) => (
						<SelectItem
							key={a.addressId}
							value={String(a.addressId)}>
							{formatLine(a)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
