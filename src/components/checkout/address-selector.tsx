import { useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SavedAddress } from "../../types/address";

interface AddressSelectorProps {
	savedAddresses: SavedAddress[];
	onAddressSelect: (address: SavedAddress) => void;
	onAddNewClick: () => void;
}

export const AddressSelector = ({
	savedAddresses,
	onAddressSelect,
	onAddNewClick,
}: AddressSelectorProps) => {
	const t = useTranslations("Checkout.modals.address.selector");
	const [open, setOpen] = useState(false);
	return (
		<Select
			open={open}
			onOpenChange={setOpen}
			onValueChange={(value) => {
				const selectedAddress = savedAddresses.find(
					(addr) => addr.id === value,
				);
				if (selectedAddress) {
					onAddressSelect(selectedAddress);
				}
			}}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={t("placeholder")} />
			</SelectTrigger>
			<SelectContent className="p-2">
				<div className="flex items-center justify-between px-1 py-2 text-sm font-medium text-[#009640]">
					<span>{t("user")}</span>
				</div>
				{savedAddresses
					.filter((addr) => addr.type === "bruker")
					.map((addr, index) => (
						<SelectItem
							key={`${addr.type}-${addr.id}-${addr.street}-${addr.houseNumber}-${index}`}
							value={addr.id}
							className="relative pr-24 pl-6">
							<span className="block truncate">
								{addr.name} - {addr.street} {addr.houseNumber}
							</span>
							{open && (
								<span className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[#DEF7EC] px-2 py-0.5 text-xs font-medium text-[#005522]">
									{t("user")}
								</span>
							)}
						</SelectItem>
					))}

				{/* <div className="mt-2 flex items-center justify-between border-t px-1 py-2 text-sm font-medium text-[#009640]">
					<span>{t("customer")}</span>
				</div>
				{savedAddresses
					.filter((addr) => addr.type === "kunde")
					.map((addr, index) => (
						<SelectItem
							key={`${addr.type}-${addr.id}-${addr.street}-${addr.houseNumber}-${index}`}
							value={addr.id}
							className="relative pr-24 pl-6">
							<span className="block truncate">
								{addr.name} - {addr.street} {addr.houseNumber}
							</span>
							{open && (
								<span className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[#DEF7EC] px-2 py-0.5 text-xs font-medium text-[#005522]">
									{t("customer")}
								</span>
							)}
						</SelectItem>
					))}

				<div className="mt-2 flex items-center justify-between border-t px-1 py-2 text-sm font-medium text-[#009640]">
					<span>{t("organization")}</span>
				</div>
				{savedAddresses
					.filter((addr) => addr.type === "organisasjon")
					.map((addr, index) => (
						<SelectItem
							key={`${addr.type}-${addr.id}-${addr.street}-${addr.houseNumber}-${index}`}
							value={addr.id}
							className="relative pr-32 pl-6">
							<span className="block truncate">
								{addr.name} - {addr.street} {addr.houseNumber}
							</span>
							{open && (
								<span className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[#DEF7EC] px-2 py-0.5 text-xs font-medium text-[#005522]">
									{t("organization")}
								</span>
							)}
						</SelectItem>
					))} */}
			</SelectContent>
		</Select>
	);
};
