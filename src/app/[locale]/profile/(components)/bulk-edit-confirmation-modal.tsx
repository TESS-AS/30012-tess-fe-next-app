"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MultiSelectWithTags } from "@/components/ui/multi-select";
import { RadioSelect } from "@/components/ui/radio-select";
import { useFetchUserDataBrukere } from "@/hooks/useFetchUserDataBrukere";
import { User } from "@/types/user.types";
import { X, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface BulkEditConfirmationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedUsers: User[];
	onConfirm: (changes: BulkEditChanges) => void;
	removeUser?: (user: User) => void;
}

export interface BulkEditChanges {
	customerAccess?: string[];
	catalogs?: string[];
	warehouses?: { warehouseNumber: string; companyNumber: string }[];
	company?: string;
}

function mergePageItems<T, K extends keyof T>(
	previous: T[],
	pageItems: T[],
	key: K,
	isFirstPage: boolean,
): T[] {
	if (isFirstPage) return pageItems;
	const existingKeys = new Set(
		previous.map((item) => item[key] as unknown as string | number | undefined),
	);
	const nextItems = pageItems.filter(
		(item) =>
			!existingKeys.has(item[key] as unknown as string | number | undefined),
	);
	return [...previous, ...nextItems];
}

export function BulkEditConfirmationModal({
	open,
	onOpenChange,
	selectedUsers,
	onConfirm,
	removeUser,
}: BulkEditConfirmationModalProps) {
	const t = useTranslations("BulkEditConfirmationModal");
	const [showWarning, setShowWarning] = useState(true);

	const isNumericId = (value: string) => /^\d+$/.test(value.trim());

	const [customerSearch, setCustomerSearch] = useState("");
	const [assortmentSearch, setAssortmentSearch] = useState("");
	const [warehouseSearch, setWarehouseSearch] = useState("");
	const [customerPage, setCustomerPage] = useState(1);
	const [assortmentPage, setAssortmentPage] = useState(1);
	const [warehousePage, setWarehousePage] = useState(1);
	const [companyPage, setCompanyPage] = useState(1);
	const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
	const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);
	const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
	const [selectedCompany, setSelectedCompany] = useState<string>("");
	const pageSize = 10;

	const { data: customersData } = useFetchUserDataBrukere(
		"customer",
		customerPage,
		pageSize,
		customerSearch,
		true,
	);
	const { data: assortmentData } = useFetchUserDataBrukere(
		"assortment",
		assortmentPage,
		pageSize,
		assortmentSearch,
		true,
	);
	const { data: wareHouseData } = useFetchUserDataBrukere(
		"warehouse",
		warehousePage,
		pageSize,
		warehouseSearch,
		true,
	);
	const { data: companyData } = useFetchUserDataBrukere(
		"company",
		companyPage,
		pageSize,
		"",
		true,
	);

	const [customers, setCustomers] = useState<
		{
			customerId?: number;
			customerNumber?: string;
			customerName?: string;
		}[]
	>([]);
	const [assortments, setAssortments] = useState<
		{
			assortmentId?: number;
			assortmentNumber?: string;
			assortmentName?: string;
			nameEn?: string;
			nameNo?: string;
		}[]
	>([]);
	const [warehouses, setWarehouses] = useState<
		{
			warehouseId?: number;
			warehouseNumber?: string;
			warehouseName?: string;
			companyNumber?: string;
		}[]
	>([]);
	const [companies, setCompanies] = useState<
		{
			companyId?: number;
			companyNumber?: string;
			companyName?: string;
		}[]
	>([]);

	const customersPageItems = customersData?.result ?? [];
	const assortmentsPageItems = assortmentData?.result ?? [];
	const warehousesPageItems = wareHouseData?.result ?? [];
	const companiesPageItems = companyData?.result ?? [];

	useEffect(() => {
		if (!customersData) return;
		setCustomers((prev) =>
			mergePageItems(
				prev,
				customersPageItems,
				"customerNumber",
				customerPage === 1,
			),
		);
	}, [customersData, customerPage, customersPageItems]);

	useEffect(() => {
		if (!assortmentData) return;
		setAssortments((prev) =>
			mergePageItems(
				prev,
				assortmentsPageItems,
				"assortmentNumber",
				assortmentPage === 1,
			),
		);
	}, [assortmentData, assortmentPage, assortmentsPageItems]);

	useEffect(() => {
		if (!wareHouseData) return;
		setWarehouses((prev) =>
			mergePageItems(
				prev,
				warehousesPageItems.map((w) => ({
					warehouseId: w.warehouseId,
					warehouseNumber: w.warehouseNumber,
					warehouseName: w.warehouseName,
					companyNumber:
						w.companyNumber != null ? String(w.companyNumber) : undefined,
				})),
				"warehouseId",
				warehousePage === 1,
			),
		);
	}, [wareHouseData, warehousePage, warehousesPageItems]);

	useEffect(() => {
		if (!companyData) return;
		setCompanies((prev) =>
			mergePageItems(
				prev,
				companiesPageItems.map((c) => ({
					companyId: c.companyId,
					companyNumber:
						c.companyNumber != null ? String(c.companyNumber) : undefined,
					companyName: c.companyName,
				})),
				"companyId",
				companyPage === 1,
			),
		);
	}, [companyData, companyPage, companiesPageItems]);

	const normalizeCustomerNumbers = (values: string[]) => {
		const nameToNumber = new Map<string, string>();
		customers.forEach((c) => {
			if (c.customerName && c.customerNumber) {
				nameToNumber.set(c.customerName, c.customerNumber);
			}
		});

		const normalized = values
			.map((v) => {
				const trimmed = v.trim();
				if (!trimmed) return "";
				if (isNumericId(trimmed)) return trimmed;
				return nameToNumber.get(trimmed) ?? trimmed;
			})
			.filter((v) => v);

		return Array.from(new Set(normalized));
	};

	const warehouseNumberToCompanyNumber = new Map<string, string>();
	warehouses.forEach((w) => {
		if (w.warehouseNumber && w.companyNumber != null) {
			warehouseNumberToCompanyNumber.set(
				w.warehouseNumber,
				String(w.companyNumber),
			);
		}
	});

	const normalizeAssortmentNumbers = (values: string[]) => {
		const nameToNumber = new Map<string, string>();
		assortments.forEach((a) => {
			if (a.assortmentName && a.assortmentNumber) {
				nameToNumber.set(a.assortmentName, a.assortmentNumber);
			}
		});

		const normalized = values
			.map((v) => {
				const trimmed = v.trim();
				if (!trimmed) return "";
				if (isNumericId(trimmed)) return trimmed;
				return nameToNumber.get(trimmed) ?? trimmed;
			})
			.filter((v) => v);

		return Array.from(new Set(normalized));
	};

	useEffect(() => {
		if (!open || selectedUsers.length === 0) return;

		const customerAccessSet = new Set<string>();
		const catalogSet = new Set<string>();
		const warehouseSet = new Set<string>();

		selectedUsers.forEach((user) => {
			user.customerAccess?.forEach((customer) => {
				if (customer) customerAccessSet.add(customer);
			});
			user.catalog?.forEach((catalog) => {
				if (catalog) catalogSet.add(catalog);
			});
			user.warehouse?.forEach((warehouse) => {
				if (warehouse) warehouseSet.add(warehouse);
			});
		});

		setSelectedCustomers(
			normalizeCustomerNumbers(Array.from(customerAccessSet)),
		);
		setSelectedCatalogs(normalizeAssortmentNumbers(Array.from(catalogSet)));
		setSelectedWarehouses(Array.from(warehouseSet));

		const firstUserCompanies = selectedUsers[0]?.company ?? [];
		const commonCompany = firstUserCompanies.find((company) =>
			selectedUsers.every((user) => user.company?.includes(company)),
		);
		setSelectedCompany(commonCompany ?? "");
	}, [open, selectedUsers]);

	useEffect(() => {
		if (!open) return;
		setSelectedCustomers((prev) => normalizeCustomerNumbers(prev));
	}, [customers, open]);

	useEffect(() => {
		if (!open) return;
		setSelectedCatalogs((prev) => normalizeAssortmentNumbers(prev));
	}, [assortments, open]);

	const handleConfirm = () => {
		const warehousesPayload = selectedWarehouses
			.filter((warehouseNumber) => warehouseNumber.trim())
			.map((warehouseNumber) => ({
				warehouseNumber,
				companyNumber:
					warehouseNumberToCompanyNumber.get(warehouseNumber) ??
					selectedCompany,
			}));

		const changes: BulkEditChanges = {
			customerAccess: selectedCustomers.filter(Boolean),
			catalogs: selectedCatalogs.filter(Boolean),
			warehouses: warehousesPayload,
			company: selectedCompany,
		};

		onConfirm(changes);
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-[680px] overflow-y-auto p-0">
				<DialogHeader className="border-b border-[#E5E7E6] px-6 py-4">
					<div className="flex items-start justify-between">
						<DialogTitle className="text-xl font-semibold text-[#0F1912]">
							{t("title")}
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className="space-y-6 px-6 py-2">
					<div>
						<h3 className="mb-3 font-bold text-[#0F1912]">
							{t("selectedUsers", { count: selectedUsers.length })}
						</h3>
						<div className="flex flex-col gap-2 rounded-lg border border-[#C1C4C2] p-2.5">
							<p className="text-xs text-[#0F1912]">{t("changesWillApply")}</p>
							<div className="flex flex-wrap gap-2">
								{selectedUsers.map((user) => (
									<Badge
										key={user.userId}
										variant="secondary"
										className="h-[22px] gap-1 rounded-md bg-[#E8EAE9] px-2 py-0 text-xs font-normal text-[#0F1912] hover:bg-[#E8EAE9]">
										{user.firstName + " " + user.lastName}
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												removeUser?.(user);
											}}
											className="ml-1 rounded-sm hover:bg-[#C1C4C2]"
											aria-label={`Remove ${user.firstName + " " + user.lastName}`}>
											<X className="h-3 w-3 cursor-pointer" />
										</button>
									</Badge>
								))}
							</div>
						</div>
					</div>

					{showWarning && (
						<div className="rounded-lg bg-[#F0FCF2] p-4 text-[#005522]">
							<div className="flex items-start gap-3">
								<Info className="mt-0.5 h-5 w-5" />
								<div className="flex-1">
									<div className="text-sm">
										<p className="mb-2 font-semibold">{t("warning.title")}</p>
										<p className="mb-1 text-xs">{t("warning.subtitle")}</p>
										<p className="mb-1 text-xs">{t("warning.howItWorks")}</p>
										<ul className="ml-4 list-disc space-y-1 text-xs">
											<li>{t("warning.point1")}</li>
											<li>{t("warning.point2")}</li>
										</ul>
									</div>
								</div>
								<button
									onClick={() => setShowWarning(false)}
									className="text-[#5A615D] hover:text-[#0F1912]">
									<X className="h-4 w-4" />
								</button>
							</div>
						</div>
					)}

					<div>
						<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
							{t("access")}
						</h3>
						<div className="mb-4 grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="kundetilgang">{t("customerAccess")}</Label>
								<MultiSelectWithTags
									options={customers.map((customer) => {
										const name = customer.customerName ?? "";
										const number = customer.customerNumber ?? "";
										const label = number
											? `${name} (${number})`
											: name || number;
										return {
											value: customer.customerNumber ?? "",
											label,
										};
									})}
									selected={selectedCustomers}
									onChange={(value) => {
										setSelectedCustomers(normalizeCustomerNumbers(value));
									}}
									onSearchChange={(value) => {
										setCustomerSearch(value);
										setCustomerPage(1);
									}}
									page={customerPage}
									onPrevPage={
										customerPage > 1
											? () => setCustomerPage((p) => p - 1)
											: undefined
									}
									onNextPage={
										customers.length >= pageSize
											? () => setCustomerPage((p) => p + 1)
											: undefined
									}
									canPrevPage={customerPage > 1}
									canNextPage={customers.length >= pageSize}
									placeholder={t("customerAccessPlaceholder", {
										count: selectedCustomers.length,
									})}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="kundekatalog">{t("catalog")}</Label>
								<MultiSelectWithTags
									options={assortments.map((assortment) => {
										return {
											value: assortment.assortmentNumber ?? "",
											label: assortment.assortmentName ?? "",
										};
									})}
									selected={selectedCatalogs}
									onChange={(value) => {
										setSelectedCatalogs(normalizeAssortmentNumbers(value));
									}}
									onSearchChange={(value) => {
										setAssortmentSearch(value);
										setAssortmentPage(1);
									}}
									page={assortmentPage}
									onPrevPage={
										assortmentPage > 1
											? () => setAssortmentPage((p) => p - 1)
											: undefined
									}
									onNextPage={
										assortments.length >= pageSize
											? () => setAssortmentPage((p) => p + 1)
											: undefined
									}
									canPrevPage={assortmentPage > 1}
									canNextPage={assortments.length >= pageSize}
									placeholder={t("catalogPlaceholder")}
								/>
							</div>
						</div>
						<div className="mb-4 grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="standardTessLager">
									{t("standardWarehouse")}
								</Label>
								<MultiSelectWithTags
									options={warehouses.map((warehouse) => {
										return {
											value:
												warehouse.warehouseNumber ??
												String(warehouse.warehouseId),
											label: warehouse.warehouseName ?? "",
										};
									})}
									selected={selectedWarehouses}
									onChange={setSelectedWarehouses}
									onSearchChange={(value) => {
										setWarehouseSearch(value);
										setWarehousePage(1);
									}}
									page={warehousePage}
									onPrevPage={
										warehousePage > 1
											? () => setWarehousePage((p) => p - 1)
											: undefined
									}
									onNextPage={
										warehouses.length >= pageSize
											? () => setWarehousePage((p) => p + 1)
											: undefined
									}
									canPrevPage={warehousePage > 1}
									canNextPage={warehouses.length >= pageSize}
									placeholder={t("warehousePlaceholder", {
										count: selectedWarehouses.length,
									})}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tessFirma">{t("tessCompany")}</Label>
								<RadioSelect
									options={companies.map((item) => {
										return {
											value: String(item.companyNumber),
											label: item.companyName ?? "",
										};
									})}
									value={selectedCompany}
									onChange={setSelectedCompany}
									placeholder={t("companyPlaceholder")}
									searchable={false}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-3 border-t border-[#E5E7E6] px-6 py-4">
					<Button
						variant="greenSolid"
						className="flex-1"
						onClick={handleConfirm}>
						{t("updateUsers", { count: selectedUsers.length })}
					</Button>
					<Button
						variant="outline"
						className="flex-1 border-[#C1C4C2]"
						onClick={() => onOpenChange(false)}>
						{t("close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
