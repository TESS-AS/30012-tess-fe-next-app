"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	AddressFormValues,
	addressSchema,
} from "@/lib/validation/addressSchema";
import { UserAddress } from "@/types/user.types";
import { getDefaultAddressFormValues } from "@/utils/addressFormDefaults";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface AddressModalProps {
	open: boolean;
	onClose: () => void;
	address: UserAddress | null;
	onSave: (updatedAddress: UserAddress) => void;
	defaultType: "personal" | "business";
}

export default function AddressModal({
	open,
	onClose,
	address,
	onSave,
	defaultType,
}: AddressModalProps) {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<AddressFormValues>({
		resolver: zodResolver(addressSchema),
		defaultValues: getDefaultAddressFormValues(address, defaultType),
	});

	useEffect(() => {
		if (open) {
			reset(getDefaultAddressFormValues(address, defaultType));
		}
	}, [open, address, defaultType, reset]);

	const onSubmit = (data: AddressFormValues) => {
		const newAddress: UserAddress = {
			...(address ?? {
				addressId: Math.floor(Math.random() * 1000000),
				deliveryCode: "",
				condition: "",
			}),
			...data,
			addressLine2: data.addressLine2 ?? "",
			addressLine3: data.addressLine3 ?? "",
		};

		onSave(newAddress);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{address ? "Edit Address" : "Add Address"}</DialogTitle>
					<DialogDescription>
						{address
							? "Update the address details."
							: "Fill in the form to add a new address."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="grid gap-4 py-4">
					{[
						"addressName",
						"addressLine1",
						"addressLine2",
						"addressLine3",
						"postalCode",
						"city",
					].map((field) => (
						<div key={field}>
							<Label htmlFor={field}>{field.replace(/([A-Z])/g, " $1")}</Label>
							<Input
								id={field}
								{...register(field as keyof AddressFormValues)}
							/>
							{errors[field as keyof AddressFormValues] && (
								<p className="text-sm text-red-600">
									{errors[field as keyof AddressFormValues]?.message}
								</p>
							)}
						</div>
					))}

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="secondary"
							onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">{address ? "Save" : "Add"}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
