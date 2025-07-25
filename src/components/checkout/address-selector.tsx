import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

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
	return (
		<Select
			onValueChange={(value) => {
				const selectedAddress = savedAddresses.find(
					(addr) => addr.id === value,
				);
				if (selectedAddress) {
					onAddressSelect(selectedAddress);
				}
			}}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Velg en lagret adresse" />
			</SelectTrigger>
			<SelectContent className="p-2">
				<div className="flex items-center justify-between px-1 py-2 text-sm font-medium text-[#009640]">
					<span>Bruker</span>
				</div>
				{savedAddresses
					.filter((addr) => addr.type === "bruker")
					.map((addr) => (
						<SelectItem
							key={addr.id}
							value={addr.id}
							className="relative pr-24 pl-6">
							<span className="block truncate">
								{addr.name} - {addr.street} {addr.houseNumber}
							</span>
							<span className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[#DEF7EC] px-2 py-0.5 text-xs font-medium text-[#005522]">
								Bruker
							</span>
						</SelectItem>
					))}

				<button
					type="button"
					className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium text-[#009640] transition-colors hover:bg-[#E6F3EC]"
					onClick={(e) => {
						e.preventDefault();
						onAddNewClick();
					}}>
					<Plus className="h-4 w-4" />
					<span>Legg til adresse</span>
				</button>

				<div className="mt-2 flex items-center justify-between border-t px-1 py-2 text-sm font-medium text-[#009640]">
					<span>Kunde</span>
				</div>
				{savedAddresses
					.filter((addr) => addr.type === "kunde")
					.map((addr) => (
						<SelectItem
							key={addr.id}
							value={addr.id}
							className="relative pr-24 pl-6">
							<span className="block truncate">
								{addr.name} - {addr.street} {addr.houseNumber}
							</span>
							<span className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[#DEF7EC] px-2 py-0.5 text-xs font-medium text-[#005522]">
								Kunde
							</span>
						</SelectItem>
					))}

				<div className="mt-2 flex items-center justify-between border-t px-1 py-2 text-sm font-medium text-[#009640]">
					<span>Organisasjon</span>
				</div>
				{savedAddresses
					.filter((addr) => addr.type === "organisasjon")
					.map((addr) => (
						<SelectItem
							key={addr.id}
							value={addr.id}
							className="relative pr-32 pl-6">
							<span className="block truncate">
								{addr.name} - {addr.street} {addr.houseNumber}
							</span>
							<span className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-[#DEF7EC] px-2 py-0.5 text-xs font-medium text-[#005522]">
								Organisasjon
							</span>
						</SelectItem>
					))}
			</SelectContent>
		</Select>
	);
};
