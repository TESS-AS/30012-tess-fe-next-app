import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetAssortments } from "@/hooks/useGetAssortments";
import { useGetCustomers } from "@/hooks/useGetCustomers";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";
import { UserRoundCog } from "lucide-react";

interface CustomerNumberSwitcherProps {
	profile: ProfileUser;
}

export default function CustomerNumberSwitcher({
	profile,
}: CustomerNumberSwitcherProps) {
	const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
	const [newCustomerNumber, setNewCustomerNumber] = useState("");
	const [selectedWarehouse, setSelectedWarehouse] = useState("");
	const [selectedAssortment, setSelectedAssortment] = useState("");
	const [defaultCustomerNumber, setDefaultCustomerNumber] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const { customers } = useGetCustomers(true);
	const { warehouses } = useGetWarehouses(true);
	const { assortments } = useGetAssortments(true);

	useEffect(() => {
		if (
			customers.length &&
			!newCustomerNumber &&
			profile?.defaultCustomerNumber
		) {
			setNewCustomerNumber(profile.defaultCustomerNumber);
			setDefaultCustomerNumber(profile.defaultCustomerNumber);
			setSelectedWarehouse(profile.defaultWarehouseNumber);
		}
		if (
			assortments.length &&
			!selectedAssortment &&
			profile?.defaultAssortmentNumber
		) {
			const match = assortments.find(
				(a) => a.assortmentnumber === profile.defaultAssortmentNumber,
			);
			if (match) {
				setSelectedAssortment(match.assortmentnumber);
			}
		}
	}, [customers, assortments, profile]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await axiosClient.post("/user/defaultVariables", {
				companyNumber: profile.defaultCompanyNumber,
				customerNumber: newCustomerNumber,
				warehouseNumber: selectedWarehouse,
				assortmentId: selectedAssortment,
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
				className="hidden text-sm text-[#0F1912] md:flex">
				<UserRoundCog /> Velg kunde/lager/sortilog
				{/* {defaultCustomerNumber} */}
			</Button>

			<Modal
				open={isCustomerModalOpen}
				onOpenChange={setIsCustomerModalOpen}>
				<ModalHeader>
					<ModalTitle>Customer Info</ModalTitle>
				</ModalHeader>
				<div className="space-y-4 p-4">
					<div className="space-y-2">
						<Label htmlFor="customerSelect">Customers</Label>
						<Select
							value={newCustomerNumber}
							onValueChange={setNewCustomerNumber}>
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
										{customers.map((customer) => (
											<SelectItem
												key={customer.customerNumber}
												value={customer.customerNumber}>
												{customer.customerName} ({customer.customerNumber})
											</SelectItem>
										))}
									</>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="warehouseSelect">Warehouses</Label>
						<Select
							value={selectedWarehouse}
							onValueChange={setSelectedWarehouse}
							disabled={warehouses.length === 0}>
							<SelectTrigger
								id="warehouseSelect"
								className="w-full">
								<SelectValue
									placeholder={
										warehouses.length === 0
											? "No warehouse available"
											: "Select warehouse"
									}
								/>
							</SelectTrigger>
							<SelectContent className="z-[9999]">
								<SelectGroup>
									<>
										{warehouses.length > 0 &&
											warehouses.map((warehouse) => (
												<SelectItem
													key={warehouse.id}
													value={warehouse.id}>
													{warehouse.name} ({warehouse.id})
												</SelectItem>
											))}
									</>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="assortmentSelect">Assortments</Label>
						<Select
							value={selectedAssortment}
							disabled={assortments.length === 0}
							onValueChange={setSelectedAssortment}>
							<SelectTrigger
								id="assortmentSelect"
								className="w-full">
								<SelectValue
									placeholder={
										assortments.length === 0
											? "No assortments available"
											: "Select assortment"
									}
								/>
							</SelectTrigger>
							<SelectContent className="z-[9999]">
								<SelectGroup>
									<>
										{assortments.map((a) => (
											<SelectItem
												key={a.assortmentnumber}
												value={a.assortmentnumber}>
												{a.assortmentname} ({a.assortmentnumber})
											</SelectItem>
										))}
									</>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<Button
						className="w-full"
						disabled={isSaving}
						onClick={handleSave}>
						{isSaving ? "Saving..." : "Save"}
					</Button>
				</div>
			</Modal>
		</>
	);
}
