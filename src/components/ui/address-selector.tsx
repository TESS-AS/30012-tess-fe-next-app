import React from "react";

import { Plus } from "lucide-react";

import { Button } from "./button";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { SavedAddressData } from "../checkout/edit-address-modal";

interface AddressSelectorProps {
	savedAddresses: SavedAddressData[];
	onAddressSelect: (address: SavedAddressData) => void;
	onAddNewClick: () => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
	savedAddresses,
	onAddressSelect,
	onAddNewClick,
}) => {
	return (
		<div className="space-y-4">
			{savedAddresses.length > 0 && (
				<RadioGroup
					className="flex flex-col gap-3"
					onValueChange={(value) => {
						const selectedAddress = savedAddresses.find(
							(addr) => addr.id === value,
						);
						if (selectedAddress) {
							onAddressSelect(selectedAddress);
						}
					}}>
					{savedAddresses.map((address) => (
						<div
							key={address.id}
							className="flex items-center space-x-3">
							<RadioGroupItem
								value={address.id || ""}
								id={address.id || ""}
							/>
							<Label
								htmlFor={address.id || ""}
								className="font-normal">
								{address.addressName} - {address.street} {address.houseNumber},{" "}
								{address.postalCode} {address.city}
							</Label>
						</div>
					))}
				</RadioGroup>
			)}

			<Button
				variant="outline"
				onClick={onAddNewClick}
				className="text-foreground border-[#C1C4C2] text-sm font-medium">
				<Plus className="mr-2 h-4 w-4" />
				Legg til ny adresse
			</Button>
		</div>
	);
};
