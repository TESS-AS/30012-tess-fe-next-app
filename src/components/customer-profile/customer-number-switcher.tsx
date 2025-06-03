import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";

interface CustomerNumberSwitcherProps {
	profile: ProfileUser;
}

export default function CustomerNumberSwitcher({
	profile,
}: CustomerNumberSwitcherProps) {
	const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
	const [newCustomerNumber, setNewCustomerNumber] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [defaultCustomerNumber, setDefaultCustomerNumber] = useState("");

	useEffect(() => {
		if (profile?.defaultCustomerNumber) {
			setDefaultCustomerNumber(profile.defaultCustomerNumber);
		}
		if (profile?.customerNumbers?.length && !newCustomerNumber) {
			setNewCustomerNumber(profile.customerNumbers[0]);
		}
	}, [profile]);

	if (!profile?.defaultCustomerNumber) return null;

	const handleSave = async () => {
		if (!newCustomerNumber || !profile?.orgNumbers?.[0]) return;

		setIsSaving(true);
		try {
			await axiosClient.post("/user/defaultVariables", {
				companyNumber: profile.orgNumbers[0],
				customerNumber: newCustomerNumber,
				warehouseNumber: profile.defaultWarehouseId,
			});
			setDefaultCustomerNumber(newCustomerNumber);
			setIsCustomerModalOpen(false);
		} catch (err) {
			console.error("Failed to update default customer number", err);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setIsCustomerModalOpen(true)}
				className="hidden text-sm md:flex">
				Customer #: {defaultCustomerNumber}
			</Button>

			<Modal
				open={isCustomerModalOpen}
				onOpenChange={setIsCustomerModalOpen}>
				<ModalContent className="sm:max-w-md">
					<ModalHeader>
						<ModalTitle>Customer Info</ModalTitle>
					</ModalHeader>
					<div className="space-y-4 p-4">
						<div className="space-y-2">
							<Label htmlFor="customerSelect">Select customer number</Label>
							<Select
								value={newCustomerNumber}
								onValueChange={(val) => setNewCustomerNumber(val)}>
								<SelectTrigger
									id="customerSelect"
									className="w-full">
									<SelectValue placeholder="Select customer number" />
								</SelectTrigger>
								<SelectContent
									position="popper"
									className="z-[9999]">
									<SelectGroup>
										<>
											{profile.customerNumbers.map((number) => (
												<SelectItem
													key={number}
													value={number}>
													{number}
												</SelectItem>
											))}
										</>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						{profile.defaultWarehouseId && profile.defaultWarehosueName && (
							<div className="space-y-2">
								<Label htmlFor="warehouseSelect">Select warehouse</Label>
								<Select
									value={profile.defaultWarehouseId}
									disabled>
									<SelectTrigger
										id="warehouseSelect"
										className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value={profile.defaultWarehouseId}>
												{profile.defaultWarehosueName} (
												{profile.defaultWarehouseId})
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						)}

						<Button
							className="w-full"
							disabled={isSaving}
							onClick={handleSave}>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</div>
				</ModalContent>
			</Modal>
		</>
	);
}
