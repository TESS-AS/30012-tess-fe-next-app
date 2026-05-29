"use client";

import { useEffect, useRef, useState } from "react";

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
import { useGetCompanies } from "@/hooks/useGetCompanies";
import { useGetCustomers } from "@/hooks/useGetCustomers";
import { profileKeys } from "@/hooks/useGetProfileData";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import { triggerProfileRefetch } from "@/hooks/usePunchoutProfile";
import { useCategories } from "@/lib/CategoriesProvider";
import axiosClient from "@/services/axiosClient";
import { ProfileUser } from "@/types/user.types";
import { useQueryClient } from "@tanstack/react-query";
import { UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface CustomerNumberSwitcherProps {
	profile: ProfileUser;
	forceOpen?: boolean;
	blockUntilComplete?: boolean;
	hideTrigger?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function CustomerNumberSwitcher({
	profile,
	forceOpen,
	blockUntilComplete,
	hideTrigger,
	open,
	onOpenChange,
}: CustomerNumberSwitcherProps) {
	const t = useTranslations();
	const { refetch: refetchCategories } = useCategories();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [internalCustomerModalOpen, setInternalCustomerModalOpen] =
		useState(false);
	const isControlled = open !== undefined;
	const isCustomerModalOpen = isControlled ? open : internalCustomerModalOpen;
	const setIsCustomerModalOpen = (next: boolean) => {
		if (isControlled) {
			onOpenChange?.(next);
		} else {
			setInternalCustomerModalOpen(next);
		}
	};
	const [newCustomerNumber, setNewCustomerNumber] = useState("");
	const [selectedWarehouse, setSelectedWarehouse] = useState("");
	const [selectedCompanyNumber, setSelectedCompanyNumber] = useState("");
	const [defaultCustomerNumber, setDefaultCustomerNumber] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const previousCompanyRef = useRef<string>("");
	const companyInitializedRef = useRef<boolean>(false);

	const missingRequiredDefaults =
		!profile?.defaultCompanyNumber ||
		!profile?.defaultCustomerNumber ||
		!profile?.defaultWarehouseNumber;
	const shouldBlock = Boolean(blockUntilComplete && missingRequiredDefaults);

	// Use selectedCompanyNumber or profile default for fetching filtered data
	const effectiveCompanyNumber =
		selectedCompanyNumber || profile?.defaultCompanyNumber;

	const { customers, refetch: refetchCustomers } = useGetCustomers(
		true,
		effectiveCompanyNumber,
	);
	const { warehouses, refetch: refetchWarehouses } = useGetWarehouses(
		true,
		effectiveCompanyNumber,
	);
	const { companies } = useGetCompanies(true);

	const isAdmin = profile.role === "admin";
	const warehouseDisplay =
		warehouses.find((w) => String(w.id) === String(selectedWarehouse)) ||
		warehouses.find(
			(w) => String(w.id) === String(profile?.defaultWarehouseNumber),
		);
	const companyDisplay =
		companies.find(
			(c) => String(c.companyNumber) === String(selectedCompanyNumber),
		) ||
		companies.find(
			(c) => String(c.companyNumber) === String(profile?.defaultCompanyNumber),
		);

	useEffect(() => {
		if (
			customers.length &&
			!newCustomerNumber &&
			profile?.defaultCustomerNumber
		) {
			setNewCustomerNumber(profile.defaultCustomerNumber);
			setDefaultCustomerNumber(profile.defaultCustomerNumber);
		}

		// Initialize company selection - only on first load
		if (
			companies.length &&
			profile?.defaultCompanyNumber &&
			!companyInitializedRef.current &&
			!selectedCompanyNumber
		) {
			// Compare both as numbers to handle leading zeros (e.g., "03" vs 3)
			const defaultCompanyNum = Number(profile.defaultCompanyNumber);
			const match = companies.find(
				(c) => Number(c.companyNumber) === defaultCompanyNum,
			);
			if (match) {
				setSelectedCompanyNumber(String(match.companyNumber));
				companyInitializedRef.current = true;
			}
		}
	}, [customers, companies, profile, newCustomerNumber, selectedCompanyNumber]);

	// Initialize previousCompanyRef with profile default
	useEffect(() => {
		if (profile?.defaultCompanyNumber && !previousCompanyRef.current) {
			previousCompanyRef.current = String(profile.defaultCompanyNumber);
		}
	}, [profile?.defaultCompanyNumber]);

	// Initialize company selection when companies load (separate effect for reliability)
	useEffect(() => {
		if (
			!companies.length ||
			!profile?.defaultCompanyNumber ||
			companyInitializedRef.current
		)
			return;

		// Only set on initial load if not already set
		if (!selectedCompanyNumber) {
			// Compare both as numbers to handle leading zeros (e.g., "03" vs 3)
			const defaultCompanyNum = Number(profile.defaultCompanyNumber);
			const match = companies.find(
				(c) => Number(c.companyNumber) === defaultCompanyNum,
			);
			if (match) {
				setSelectedCompanyNumber(String(match.companyNumber));
				companyInitializedRef.current = true;
			}
		}
	}, [companies, profile?.defaultCompanyNumber, selectedCompanyNumber]);

	// Set initial warehouse when warehouses first load (only if company matches profile default)
	useEffect(() => {
		if (!warehouses.length || selectedWarehouse) return;

		// Check if we're using the default company (either selectedCompanyNumber matches default, or it's empty and we use profile default)
		const currentCompanyMatchesDefault =
			!selectedCompanyNumber ||
			String(selectedCompanyNumber) === String(profile?.defaultCompanyNumber);

		if (currentCompanyMatchesDefault && profile?.defaultWarehouseNumber) {
			const defaultWarehouseExists = warehouses.some(
				(w) => String(w.id) === String(profile.defaultWarehouseNumber),
			);
			if (defaultWarehouseExists) {
				setSelectedWarehouse(String(profile.defaultWarehouseNumber));
				return;
			}
		}
	}, [
		warehouses,
		profile?.defaultWarehouseNumber,
		profile?.defaultCompanyNumber,
		selectedWarehouse,
		selectedCompanyNumber,
	]);

	// Reset warehouse when company changes - warehouses automatically refetch
	useEffect(() => {
		if (!selectedCompanyNumber || !warehouses.length) return;

		const currentCompanyStr = String(selectedCompanyNumber);
		const previousCompanyStr = previousCompanyRef.current;

		// If company hasn't changed, don't reset warehouse (unless it's invalid)
		if (previousCompanyStr && previousCompanyStr === currentCompanyStr) {
			// Only reset if current warehouse selection is invalid
			if (
				selectedWarehouse &&
				warehouses.find((w) => w.id === selectedWarehouse)
			) {
				return; // Valid warehouse, no need to reset
			}
		}

		// Company has changed - try to select default warehouse
		if (profile?.defaultWarehouseNumber) {
			const defaultWarehouseExists = warehouses.some(
				(w) => String(w.id) === String(profile.defaultWarehouseNumber),
			);
			if (defaultWarehouseExists) {
				setSelectedWarehouse(String(profile.defaultWarehouseNumber));
			} else {
				// Default warehouse doesn't exist for this company - clear selection
				setSelectedWarehouse("");
			}
		} else {
			// No default warehouse in profile - clear selection
			setSelectedWarehouse("");
		}

		// Update ref to track the current company
		previousCompanyRef.current = currentCompanyStr;
	}, [
		selectedCompanyNumber,
		warehouses,
		profile?.defaultWarehouseNumber,
		selectedWarehouse,
	]);

	useEffect(() => {
		if (!forceOpen && !shouldBlock) return;
		setIsCustomerModalOpen(true);
	}, [forceOpen, shouldBlock]);

	const handleSave = async () => {
		// Validate required fields
		if (!selectedWarehouse) {
			return; // Warehouse is required
		}

		setIsSaving(true);
		try {
			await axiosClient.post("/user/defaultVariables", {
				companyNumber: selectedCompanyNumber || profile.defaultCompanyNumber,
				customerNumber: newCustomerNumber,
				warehouseNumber: selectedWarehouse,
				assortmentNumber: profile.defaultAssortmentNumber,
			});
			setDefaultCustomerNumber(newCustomerNumber);

			// Invalidate and refetch all product and price queries since company/customer/warehouse context changed
			// This ensures prices and products are immediately refetched with the new context
			await Promise.all([
				// Invalidate profile query to get updated default values
				queryClient.invalidateQueries({
					queryKey: profileKeys.all,
					refetchType: "active",
				}),
				// Trigger punchout profile refetch if applicable
				Promise.resolve(triggerProfileRefetch()),
				queryClient.invalidateQueries({
					queryKey: ["productPrice"],
					refetchType: "active", // Immediately refetch active queries
				}),
				queryClient.invalidateQueries({
					queryKey: ["product"],
					refetchType: "active",
				}),
				queryClient.invalidateQueries({
					queryKey: ["products"],
					refetchType: "active",
				}),
				refetchCategories(),
			]);

			setIsCustomerModalOpen(false);
			router.push("/");
		} catch (err) {
			console.error("Failed to update default customer number", err);
		} finally {
			setIsSaving(false);
		}
	};
	return (
		<>
			{!hideTrigger && (
				<button
					onClick={() => setIsCustomerModalOpen(true)}
					className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-gray-700 transition-colors outline-none">
					<span>Bytt handlekonto</span>
				</button>
			)}

			<Modal
				open={isCustomerModalOpen}
				onOpenChange={setIsCustomerModalOpen}>
				<ModalHeader>
					<ModalTitle>{t("CustomerSwitcher.title")}</ModalTitle>
				</ModalHeader>
				<div className="space-y-4 py-4">
					<p className="font-gray-500 text-sm font-normal">
						Priser, lager og utvalg oppdateres basert på dine valg.
					</p>
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
						<Label
							htmlFor="warehouseSelect"
							className={
								!isAdmin && warehouses.length <= 1
									? "text-base font-normal text-gray-500"
									: undefined
							}>
							{t("CustomerSwitcher.selectWarehouseLabel")}
						</Label>
						{!isAdmin && warehouses.length <= 1 ? (
							<p
								id="warehouseSelect"
								className="text-base font-medium text-gray-700">
								{warehouseDisplay
									? `${warehouseDisplay.name} (${warehouseDisplay.id})`
									: (profile?.defaultWarehouseNumber ?? "—")}
							</p>
						) : (
							<>
								<Select
									value={selectedWarehouse}
									onValueChange={setSelectedWarehouse}
									disabled={warehouses.length === 0}
									required>
									<SelectTrigger
										id="warehouseSelect"
										className={`w-full ${
											!selectedWarehouse && selectedCompanyNumber
												? "border-red-500 focus:border-red-500"
												: ""
										}`}>
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
												{warehouses.map((warehouse) => (
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
								{selectedCompanyNumber &&
									!selectedWarehouse &&
									warehouses.length > 0 && (
										<p className="text-sm text-red-600">
											Lager er påkrevd. Vennligst velg et lager.
										</p>
									)}
							</>
						)}
					</div>

					<div className="space-y-2">
						<Label
							htmlFor="companySelect"
							className={
								!isAdmin && companies.length <= 1
									? "text-base font-normal text-gray-500"
									: undefined
							}>
							{t("CustomerSwitcher.selectCompanyLabel")}
						</Label>
						{!isAdmin && companies.length <= 1 ? (
							<p
								id="companySelect"
								className="text-base font-medium text-gray-700">
								{companyDisplay
									? `${companyDisplay.companyName} (${companyDisplay.companyNumber})`
									: (profile?.defaultCompanyNumber ?? "—")}
							</p>
						) : (
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
											{companies.map((company) => (
												<SelectItem
													key={company.companyNumber}
													value={String(company.companyNumber)}>
													{company.companyName} ({company.companyNumber})
												</SelectItem>
											))}
										</>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					</div>

					<Button
						variant="greenSolid"
						className="w-full"
						disabled={isSaving || !selectedWarehouse}
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
