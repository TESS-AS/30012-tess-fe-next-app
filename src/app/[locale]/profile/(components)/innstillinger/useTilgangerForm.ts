"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useFetchUserDataBrukere } from "@/hooks/useFetchUserDataBrukere";
import { useMergedPagedItems } from "@/hooks/useMergedPagedItems";
import { fetchUserDataBrukere } from "@/services/user.service";
import { User } from "@/types/user.types";
import { buildSelectOptions, normalizeValuesWithMap } from "@/utils/bulkEdit";

import { TILGANGER_PAGE_SIZE } from "./constants";

const isNumericId = (value: string) => /^\d+$/.test(value.trim());

export interface TilgangerOptions {
	customerOptions: { value: string; label: string }[];
	assortmentOptions: { value: string; label: string }[];
	warehouseOptions: { value: string; label: string }[];
	companyOptions: { value: string; label: string }[];
}

export interface TilgangerSelected {
	customers: string[];
	catalogs: string[];
	warehouses: string[];
	companies: string[];
}

export interface TilgangerFormState extends TilgangerSelected {
	customerSearch: string;
	assortmentSearch: string;
	warehouseSearch: string;
	companySearch: string;
	customerPage: number;
	assortmentPage: number;
	warehousePage: number;
	companyPage: number;
}

export interface UseTilgangerFormReturn {
	options: TilgangerOptions;
	selected: TilgangerSelected;
	state: TilgangerFormState;
	setSelectedCustomers: (v: string[] | ((prev: string[]) => string[])) => void;
	setSelectedCatalogs: (v: string[] | ((prev: string[]) => string[])) => void;
	setSelectedWarehouses: (v: string[] | ((prev: string[]) => string[])) => void;
	setSelectedCompanies: (v: string[] | ((prev: string[]) => string[])) => void;
	setCustomerSearch: (v: string) => void;
	setAssortmentSearch: (v: string) => void;
	setWarehouseSearch: (v: string) => void;
	setCompanySearch: (v: string) => void;
	setCustomerPage: (v: number | ((p: number) => number)) => void;
	setAssortmentPage: (v: number | ((p: number) => number)) => void;
	setWarehousePage: (v: number | ((p: number) => number)) => void;
	setCompanyPage: (v: number | ((p: number) => number)) => void;
	normalizeCustomerNumbers: (values: string[]) => string[];
	normalizeAssortmentNumbers: (values: string[]) => string[];
	normalizeCompanyNumbers: (values: string[]) => string[];
	buildWarehousesPayload: () => { warehouseNumber: string; companyNumber: string; isDefault: false }[];
	isLoading: boolean;
	/** Whether the form has been initialized with data from currentUser. */
	isInitialized: boolean;
	/** Whether the user has made changes since initialization. */
	isDirty: boolean;
	/** Reset dirty state (e.g. after a successful save). */
	resetDirty: () => void;
	/** Lengths of merged option lists (for pagination canNextPage). */
	listLengths: { customers: number; assortments: number; warehouses: number; companies: number };
}

export function useTilgangerForm(currentUser: User | null): UseTilgangerFormReturn {
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
	const [extraWarehouseCompanyMap, setExtraWarehouseCompanyMap] = useState(
		() => new Map<string, string>(),
	);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const initRef = useRef(false);
	const resetDirty = useCallback(() => setIsDirty(false), []);

	const { data: customersData, isLoading: isLoadingCustomers } =
		useFetchUserDataBrukere(
			"customer",
			customerPage,
			TILGANGER_PAGE_SIZE,
			customerSearch,
			true,
		);
	const { data: assortmentData, isLoading: isLoadingAssortments } =
		useFetchUserDataBrukere(
			"assortment",
			assortmentPage,
			TILGANGER_PAGE_SIZE,
			assortmentSearch,
			true,
		);
	const { data: wareHouseData, isLoading: isLoadingWarehouses } =
		useFetchUserDataBrukere(
			"warehouse",
			warehousePage,
			TILGANGER_PAGE_SIZE,
			warehouseSearch,
			true,
		);
	const { data: companyData, isLoading: isLoadingCompanies } =
		useFetchUserDataBrukere(
			"company",
			companyPage,
			TILGANGER_PAGE_SIZE,
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
				warehouseKey:
					w.warehouseNumber && w.companyNumber != null
						? `${w.warehouseNumber}|${String(w.companyNumber)}`
						: String(w.warehouseId ?? w.warehouseNumber ?? ""),
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
		"warehouseKey",
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

	const warehouseNumberToCompanyNumber = useMemo(() => {
		const map = new Map<string, string>();
		warehouses.forEach((w) => {
			if (w.warehouseNumber && w.companyNumber != null) {
				map.set(w.warehouseNumber, String(w.companyNumber));
			}
		});
		return map;
	}, [warehouses]);

	const missingWarehouseNumbers = useMemo(() => {
		const normalized = selectedWarehouses
			.map((w) => w.trim())
			.filter(Boolean)
			.map((value) => value.split("|")[0])
			.filter(Boolean);
		return Array.from(new Set(normalized)).filter(
			(warehouseNumber) =>
				warehouseNumber.length > 0 &&
				!warehouseNumberToCompanyNumber.has(warehouseNumber) &&
				!extraWarehouseCompanyMap.has(warehouseNumber),
		);
	}, [
		selectedWarehouses,
		warehouseNumberToCompanyNumber,
		extraWarehouseCompanyMap,
	]);

	useEffect(() => {
		if (missingWarehouseNumbers.length === 0) return;
		let cancelled = false;
		(async () => {
			try {
				const results = await Promise.all(
					missingWarehouseNumbers.map((warehouseNumber) =>
						fetchUserDataBrukere(
							"warehouse",
							1,
							TILGANGER_PAGE_SIZE,
							warehouseNumber,
						),
					),
				);
				if (cancelled) return;
				setExtraWarehouseCompanyMap((prev) => {
					const next = new Map(prev);
					results.forEach((res) => {
						(res?.result ?? []).forEach((w) => {
							if (w.warehouseNumber && w.companyNumber != null) {
								next.set(String(w.warehouseNumber), String(w.companyNumber));
							}
						});
					});
					return next;
				});
			} catch {
				// no-op
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [missingWarehouseNumbers]);

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
	}, [companies]);

	const selectedUsersForOptions = useMemo(
		() => (currentUser ? [currentUser] : []),
		[currentUser],
	);

	const customerOptions = useMemo(() => {
		const base = customers.map((customer) => ({
			value: customer.customerNumber ?? "",
			label: customer.customerName ?? "",
		}));
		const extra = selectedUsersForOptions.flatMap((user) =>
			(user.customerAccess ?? [])
				.filter((c) => c?.number && c?.name)
				.map((c) => ({ value: c.number, label: c.name })),
		);
		return buildSelectOptions(base, extra);
	}, [customers, selectedUsersForOptions]);

	const assortmentOptions = useMemo(() => {
		const base = assortments.map((assortment) => ({
			value: assortment.assortmentNumber ?? "",
			label: assortment.assortmentName ?? "",
		}));
		const extra = selectedUsersForOptions.flatMap((user) =>
			(user.catalog ?? [])
				.filter((c) => c?.number && c?.name)
				.map((c) => ({ value: c.number, label: c.name })),
		);
		return buildSelectOptions(base, extra);
	}, [assortments, selectedUsersForOptions]);

	const warehouseOptions = useMemo(() => {
		const base = warehouses.map((warehouse) => ({
			value:
				warehouse.warehouseNumber && warehouse.companyNumber
					? `${warehouse.warehouseNumber}|${warehouse.companyNumber}`
					: (warehouse.warehouseNumber ?? String(warehouse.warehouseId)),
			label: warehouse.warehouseName ?? "",
		}));
		const baseWarehouseNumbers = new Set(
			warehouses
				.map((w) => w.warehouseNumber)
				.filter((w): w is string => Boolean(w)),
		);
		const baseValues = new Set(base.map((o) => o.value));
		const extra = selectedUsersForOptions.flatMap((user) =>
			(user.warehouse ?? [])
				.filter((w) => w?.number && w?.name)
				.flatMap((w) => {
					const resolvedCompany =
						(w.companyNumber ? String(w.companyNumber) : undefined) ??
						extraWarehouseCompanyMap.get(w.number) ??
						warehouseNumberToCompanyNumber.get(w.number);
					const value = resolvedCompany
						? `${w.number}|${resolvedCompany}`
						: w.number;
					if (resolvedCompany && baseValues.has(value)) return [];
					if (!resolvedCompany && baseWarehouseNumbers.has(w.number)) return [];
					return [{ value, label: w.name }];
				}),
		);
		return buildSelectOptions(base, extra);
	}, [
		selectedUsersForOptions,
		warehouses,
		extraWarehouseCompanyMap,
		warehouseNumberToCompanyNumber,
	]);

	const companyOptions = useMemo(() => {
		const base = companies.map((item) => ({
			value: String(item.companyNumber),
			label: item.companyName ?? "",
		}));
		const extra = selectedUsersForOptions.flatMap((user) =>
			(user.company ?? [])
				.filter((c) => c?.number && c?.name)
				.map((c) => ({ value: c.number, label: c.name })),
		);
		return buildSelectOptions(base, extra);
	}, [companies, selectedUsersForOptions]);

	useEffect(() => {
		if (!currentUser) {
			if (initRef.current) {
				setIsInitialized(false);
				initRef.current = false;
			}
			return;
		}
		const customerAccessSet = new Set<string>();
		const catalogSet = new Set<string>();
		const warehouseSet = new Set<string>();
		const companySet = new Set<string>();
		currentUser.customerAccess?.forEach((c) => {
			if (c?.number) customerAccessSet.add(c.number);
		});
		currentUser.catalog?.forEach((c) => {
			if (c?.number) catalogSet.add(c.number);
		});
		currentUser.warehouse?.forEach((w) => {
			if (!w?.number) return;
			if (w.companyNumber) {
				warehouseSet.add(`${w.number}|${String(w.companyNumber)}`);
				return;
			}
			warehouseSet.add(w.number);
		});
		currentUser.company?.forEach((c) => {
			if (c?.number) companySet.add(c.number);
		});
		const normCustomer = (v: string[]) =>
			normalizeValuesWithMap(v, isNumericId, customerNameToNumber);
		const normAssortment = (v: string[]) =>
			normalizeValuesWithMap(v, isNumericId, assortmentNameToNumber);
		const normCompany = (v: string[]) =>
			normalizeValuesWithMap(v, isNumericId, companyNumberToName);
		setSelectedCustomers(normCustomer(Array.from(customerAccessSet)));
		setSelectedCatalogs(normAssortment(Array.from(catalogSet)));
		setSelectedWarehouses(Array.from(warehouseSet));
		setSelectedCompanies(normCompany(Array.from(companySet)));
		setIsInitialized(true);
		setIsDirty(false);
		initRef.current = true;
	}, [currentUser]);

	const normalizeCustomerNumbers = (values: string[]) =>
		normalizeValuesWithMap(values, isNumericId, customerNameToNumber);
	const normalizeAssortmentNumbers = (values: string[]) =>
		normalizeValuesWithMap(values, isNumericId, assortmentNameToNumber);
	const normalizeCompanyNumbers = (values: string[]) =>
		normalizeValuesWithMap(values, isNumericId, companyNumberToName);

	const buildWarehousesPayload = () =>
		selectedWarehouses
			.filter((v) => v.trim())
			.map((warehouseValue) => {
				const trimmed = warehouseValue.trim();
				const [warehouseNumber, companyNumberFromValue] = trimmed.split("|");
				const companyNumber =
					companyNumberFromValue ??
					extraWarehouseCompanyMap.get(warehouseNumber) ??
					warehouseNumberToCompanyNumber.get(warehouseNumber) ??
					"";
				return {
					warehouseNumber,
					companyNumber,
					isDefault: false as const,
				};
			});

	const isLoading =
		isLoadingCustomers ||
		isLoadingAssortments ||
		isLoadingWarehouses ||
		isLoadingCompanies;

	return {
		listLengths: {
			customers: customers.length,
			assortments: assortments.length,
			warehouses: warehouses.length,
			companies: companies.length,
		},
		options: {
			customerOptions,
			assortmentOptions,
			warehouseOptions,
			companyOptions,
		},
		selected: {
			customers: selectedCustomers,
			catalogs: selectedCatalogs,
			warehouses: selectedWarehouses,
			companies: selectedCompanies,
		},
		state: {
			customers: selectedCustomers,
			catalogs: selectedCatalogs,
			warehouses: selectedWarehouses,
			companies: selectedCompanies,
			customerSearch,
			assortmentSearch,
			warehouseSearch,
			companySearch,
			customerPage,
			assortmentPage,
			warehousePage,
			companyPage,
		},
		setSelectedCustomers,
		setSelectedCatalogs,
		setSelectedWarehouses,
		setSelectedCompanies,
		setCustomerSearch,
		setAssortmentSearch,
		setWarehouseSearch,
		setCompanySearch,
		setCustomerPage: setCustomerPage as (v: number | ((p: number) => number)) => void,
		setAssortmentPage: setAssortmentPage as (v: number | ((p: number) => number)) => void,
		setWarehousePage: setWarehousePage as (v: number | ((p: number) => number)) => void,
		setCompanyPage: setCompanyPage as (v: number | ((p: number) => number)) => void,
		normalizeCustomerNumbers,
		normalizeAssortmentNumbers,
		normalizeCompanyNumbers,
		buildWarehousesPayload,
		isLoading,
		isInitialized,
		isDirty,
		resetDirty,
	};
}
