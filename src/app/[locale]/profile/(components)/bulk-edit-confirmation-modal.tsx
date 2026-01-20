"use client";

import { useEffect, useMemo, useState } from "react";

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
import { useFetchUserDataBrukere } from "@/hooks/useFetchUserDataBrukere";
import { useMergedPagedItems } from "@/hooks/useMergedPagedItems";
import {
	BulkEditChanges,
	BulkEditConfirmationModalProps,
	User,
} from "@/types/user.types";
import { buildSelectOptions, normalizeValuesWithMap } from "@/utils/bulkEdit";
import { X, Info } from "lucide-react";
import { useTranslations } from "next-intl";

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
	const [companySearch, setCompanySearch] = useState("");
	const [customerPage, setCustomerPage] = useState(1);
	const [assortmentPage, setAssortmentPage] = useState(1);
	const [warehousePage, setWarehousePage] = useState(1);
	const [companyPage, setCompanyPage] = useState(1);
	const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
	const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);
	const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
	const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
	const pageSize = 10;

	const { data: customersData, isLoading: isLoadingCustomers } =
		useFetchUserDataBrukere(
			"customer",
			customerPage,
			pageSize,
			customerSearch,
			true,
		);
	const { data: assortmentData, isLoading: isLoadingAssortments } =
		useFetchUserDataBrukere(
			"assortment",
			assortmentPage,
			pageSize,
			assortmentSearch,
			true,
		);
	const { data: wareHouseData, isLoading: isLoadingWarehouses } =
		useFetchUserDataBrukere(
			"warehouse",
			warehousePage,
			pageSize,
			warehouseSearch,
			true,
		);
	const { data: companyData, isLoading: isLoadingCompanies } =
		useFetchUserDataBrukere(
			"company",
			companyPage,
			pageSize,
			companySearch,
			true,
		);

	const customersPageItems = customersData?.result ?? [];
	const assortmentsPageItems = assortmentData?.result ?? [];
	const warehousesPageItems = wareHouseData?.result ?? [];
	const companiesPageItems = companyData?.result ?? [];

	const warehousesPageItemsNormalized = useMemo(
		() =>
			warehousesPageItems.map((w) => ({
				warehouseId: w.warehouseId,
				warehouseNumber: w.warehouseNumber,
				warehouseName: w.warehouseName,
				companyNumber:
					w.companyNumber != null ? String(w.companyNumber) : undefined,
			})),
		[warehousesPageItems],
	);

	const companiesPageItemsNormalized = useMemo(
		() =>
			companiesPageItems.map((c) => ({
				companyId: c.companyId,
				companyNumber:
					c.companyNumber != null ? String(c.companyNumber) : undefined,
				companyName: c.companyName,
			})),
		[companiesPageItems],
	);

	const customers = useMergedPagedItems(
		customersPageItems,
		"customerNumber",
		customerPage === 1,
	);
	const assortments = useMergedPagedItems(
		assortmentsPageItems,
		"assortmentNumber",
		assortmentPage === 1,
	);
	const warehouses = useMergedPagedItems(
		warehousesPageItemsNormalized,
		"warehouseId",
		warehousePage === 1,
	);
	const companies = useMergedPagedItems(
		companiesPageItemsNormalized,
		"companyId",
		companyPage === 1,
	);

	const customerNameToNumber = useMemo(() => {
		const map = new Map<string, string>();
		customers.forEach((c) => {
			if (c.customerName && c.customerNumber) {
				map.set(c.customerName, c.customerNumber);
			}
		});
		return map;
	}, [customers]);

	const customerOptions = useMemo(() => {
		const base = customers.map((customer) => ({
			value: customer.customerNumber ?? "",
			label: customer.customerName ?? "",
		}));
		const extra = selectedUsers.flatMap((user) =>
			(user.customerAccess ?? [])
				.filter((c) => c?.number && c?.name)
				.map((c) => ({ value: c.number, label: c.name })),
		);
		return buildSelectOptions(base, extra);
	}, [customers, selectedUsers]);

	const warehouseNumberToCompanyNumber = useMemo(() => {
		const map = new Map<string, string>();
		warehouses.forEach((w) => {
			if (w.warehouseNumber && w.companyNumber != null) {
				map.set(w.warehouseNumber, String(w.companyNumber));
			}
		});
		return map;
	}, [warehouses]);

	const assortmentNameToNumber = useMemo(() => {
		const map = new Map<string, string>();
		assortments.forEach((a) => {
			if (a.assortmentName && a.assortmentNumber) {
				map.set(a.assortmentName, a.assortmentNumber);
			}
		});
		return map;
	}, [assortments]);

	const companyNumberToName = useMemo(() => {
		const map = new Map<string, string>();
		companies.forEach((c) => {
			if (c.companyName && c.companyNumber) {
				map.set(c.companyName, c.companyNumber);
			}
		});
		return map;
	}, [assortments]);

	const assortmentOptions = useMemo(() => {
		const base = assortments.map((assortment) => ({
			value: assortment.assortmentNumber ?? "",
			label: assortment.assortmentName ?? "",
		}));
		const extra = selectedUsers.flatMap((user) =>
			(user.catalog ?? [])
				.filter((c) => c?.number && c?.name)
				.map((c) => ({ value: c.number, label: c.name })),
		);
		return buildSelectOptions(base, extra);
	}, [assortments, selectedUsers]);

	const warehouseOptions = useMemo(() => {
		const base = warehouses.map((warehouse) => ({
			value: warehouse.warehouseNumber ?? String(warehouse.warehouseId),
			label: warehouse.warehouseName ?? "",
		}));
		const extra = selectedUsers.flatMap((user) =>
			(user.warehouse ?? [])
				.filter((w) => w?.number && w?.name)
				.map((w) => ({ value: w.number, label: w.name })),
		);
		return buildSelectOptions(base, extra);
	}, [selectedUsers, warehouses]);

	const companyOptions = useMemo(() => {
		const base = companies.map((item) => ({
			value: String(item.companyNumber),
			label: item.companyName ?? "",
		}));
		const extra = selectedUsers.flatMap((user) =>
			(user.company ?? [])
				.filter((c) => c?.number && c?.name)
				.map((c) => ({ value: c.number, label: c.name })),
		);
		return buildSelectOptions(base, extra);
	}, [companies, selectedUsers]);

	useEffect(() => {
		if (!open || selectedUsers.length === 0) return;

		const customerAccessSet = new Set<string>();
		const catalogSet = new Set<string>();
		const warehouseSet = new Set<string>();
		const companySet = new Set<string>();

		selectedUsers.forEach((user) => {
			user.customerAccess?.forEach((customer) => {
				if (customer?.number) customerAccessSet.add(customer.number);
			});
			user.catalog?.forEach((catalog) => {
				if (catalog?.number) catalogSet.add(catalog.number);
			});
			user.warehouse?.forEach((warehouse) => {
				if (warehouse?.number) warehouseSet.add(warehouse.number);
			});
			user.company?.forEach((company) => {
				if (company?.number) companySet.add(company.number);
			});
		});

		setSelectedCustomers(
			normalizeCustomerNumbers(Array.from(customerAccessSet)),
		);
		setSelectedCatalogs(normalizeAssortmentNumbers(Array.from(catalogSet)));
		setSelectedWarehouses(Array.from(warehouseSet));
		setSelectedCompanies(normalizeCompanyNumbers(Array.from(companySet)));
	}, [open, selectedUsers]);

	useEffect(() => {
		if (!open) return;
		setSelectedCustomers((prev) => normalizeCustomerNumbers(prev));
	}, [customers, open]);

	useEffect(() => {
		if (!open) return;
		setSelectedCatalogs((prev) => normalizeAssortmentNumbers(prev));
	}, [assortments, open]);

	useEffect(() => {
		if (!open) return;
		setSelectedCompanies((prev) => normalizeCompanyNumbers(prev));
	}, [companies, open]);

	const normalizeCustomerNumbers = (values: string[]) => {
		return normalizeValuesWithMap(values, isNumericId, customerNameToNumber);
	};

	const normalizeAssortmentNumbers = (values: string[]) => {
		return normalizeValuesWithMap(values, isNumericId, assortmentNameToNumber);
	};

	const normalizeCompanyNumbers = (values: string[]) => {
		return normalizeValuesWithMap(values, isNumericId, companyNumberToName);
	};

	const handleConfirm = () => {
		const warehousesPayload = selectedWarehouses
			.filter((warehouseNumber) => warehouseNumber.trim())
			.map((warehouseNumber) => ({
				warehouseNumber,
				companyNumber:
					warehouseNumberToCompanyNumber.get(warehouseNumber) ?? "",
			}));

		const changes: BulkEditChanges = {
			customerAccess: selectedCustomers.filter(Boolean),
			catalogs: selectedCatalogs.filter(Boolean),
			warehouses: warehousesPayload,
			companies: selectedCompanies.filter(Boolean),
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
									options={customerOptions}
									selected={selectedCustomers}
									onChange={(value) => {
										setSelectedCustomers(normalizeCustomerNumbers(value));
									}}
									onSearchChange={(value) => {
										setCustomerSearch(value);
										setCustomerPage(1);
									}}
									page={customerPage}
									isLoading={isLoadingCustomers}
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
									options={assortmentOptions}
									selected={selectedCatalogs}
									onChange={(value) => {
										setSelectedCatalogs(normalizeAssortmentNumbers(value));
									}}
									onSearchChange={(value) => {
										setAssortmentSearch(value);
										setAssortmentPage(1);
									}}
									page={assortmentPage}
									isLoading={isLoadingAssortments}
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
									options={warehouseOptions}
									selected={selectedWarehouses}
									onChange={setSelectedWarehouses}
									onSearchChange={(value) => {
										setWarehouseSearch(value);
										setWarehousePage(1);
									}}
									page={warehousePage}
									isLoading={isLoadingWarehouses}
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
								<MultiSelectWithTags
									options={companyOptions}
									selected={selectedCompanies}
									onChange={(values) => {
										setSelectedCompanies(normalizeCompanyNumbers(values));
									}}
									onSearchChange={(value) => {
										setCompanySearch(value);
										setCompanyPage(1);
									}}
									page={companyPage}
									isLoading={isLoadingCompanies}
									onPrevPage={
										companyPage > 1
											? () => setCompanyPage((p) => p - 1)
											: undefined
									}
									onNextPage={
										companies.length >= pageSize
											? () => setCompanyPage((p) => p + 1)
											: undefined
									}
									canPrevPage={companyPage > 1}
									canNextPage={companies.length >= pageSize}
									placeholder={t("companyPlaceholder")}
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
