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
import { useGetCompanies } from "@/hooks/useGetCompanies";
import { useGetCustomers } from "@/hooks/useGetCustomers";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import { useCategories } from "@/lib/CategoriesProvider";
import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";
import { UserRoundCog } from "lucide-react";
import { useTranslations } from "next-intl";

interface CustomerNumberSwitcherProps {
	profile: ProfileUser;
}

export default function CustomerNumberSwitcher({
	profile,
}: CustomerNumberSwitcherProps) {
	const t = useTranslations();
	const { refetch: refetchCategories } = useCategories();

	const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
	const [newCustomerNumber, setNewCustomerNumber] = useState("");
	const [selectedWarehouse, setSelectedWarehouse] = useState("");
	const [selectedAssortment, setSelectedAssortment] = useState("");
	const [selectedCompanyNumber, setSelectedCompanyNumber] = useState("");
	const [defaultCustomerNumber, setDefaultCustomerNumber] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const { customers } = useGetCustomers(true);
	const { warehouses } = useGetWarehouses(true);
	const { assortments } = useGetAssortments(true);
	const { companies } = useGetCompanies(true);

	useEffect(() => {
		// Preselect default customer, warehouse, and assortment
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

		if (!selectedCompanyNumber && profile?.defaultCompanyNumber) {
			setSelectedCompanyNumber(profile.defaultCompanyNumber);
		}
	}, [customers, assortments, profile, companies]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await axiosClient.post("/user/defaultVariables", {
				companyNumber: selectedCompanyNumber || profile.defaultCompanyNumber,
				customerNumber: newCustomerNumber,
				warehouseNumber: selectedWarehouse,
				assortmentNumber: selectedAssortment,
			});
			setDefaultCustomerNumber(newCustomerNumber);
			await refetchCategories();
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
					<ModalTitle>{t("CustomerSwitcher.title")}</ModalTitle>
				</ModalHeader>
				<div className="space-y-4 p-4">
					<div className="space-y-2">
						<Label htmlFor="customerSelect">
							{t("CustomerSwitcher.selectCustomerLabel")}
						</Label>
						<Select
							value={newCustomerNumber}
							onValueChange={setNewCustomerNumber}>
							<SelectTrigger
								id="customerSelect"
								className="w-full">
								<SelectValue
									placeholder={t("CustomerSwitcher.selectCustomerPlaceholder")}
								/>
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
						<Label htmlFor="warehouseSelect">
							{t("CustomerSwitcher.selectWarehouseLabel")}
						</Label>
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
											? t("CustomerSwitcher.noWarehousesAvailable")
											: t("CustomerSwitcher.selectWarehousePlaceholder")
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
						<Label htmlFor="assortmentSelect">
							{t("CustomerSwitcher.selectAssortmentLabel")}
						</Label>
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
											? t("CustomerSwitcher.noAssortmentsAvailable")
											: t("CustomerSwitcher.selectAssortmentPlaceholder")
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

					<div className="space-y-2">
						<Label htmlFor="companySelect">
							{t("CustomerSwitcher.selectCompanyLabel")}
						</Label>
						<Select
							value={selectedCompanyNumber}
							onValueChange={setSelectedCompanyNumber}
							disabled={companies.length === 0}>
							<SelectTrigger
								id="companySelect"
								className="w-full">
								<SelectValue
									placeholder={
										companies.length === 0
											? t("CustomerSwitcher.noCompaniesAvailable")
											: t("CustomerSwitcher.selectCompanyPlaceholder")
									}
								/>
							</SelectTrigger>
							<SelectContent className="z-[9999]">
								<SelectGroup>
									<>
										{companies.length > 0 ? (
											companies.map((company) => (
												<SelectItem
													key={company.companyNumber}
													value={String(company.companyNumber)}>
													{company.companyName} ({company.companyNumber})
												</SelectItem>
											))
										) : (
											<SelectItem
												key={profile.defaultCompanyNumber}
												value={profile.defaultCompanyNumber}
												disabled>
												{`${profile.defaultCompanyName} (${profile.defaultCompanyNumber})`}
											</SelectItem>
										)}
									</>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>

					<Button
						className="w-full"
						disabled={isSaving}
						onClick={handleSave}>
						{isSaving
							? t("CustomerSwitcher.saving")
							: t("CustomerSwitcher.save")}
					</Button>
				</div>
			</Modal>
		</>
	);
}
