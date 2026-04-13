import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DiscardEquipmentDialog } from "@/components/ui/dialogs/discard-equipment-dialog";
import { PrintCertificatesDialog } from "@/components/ui/dialogs/print-certificates-dialog";
import { PrintTagsDialog } from "@/components/ui/dialogs/print-tags-dialog";
import { RFQRequestDialog } from "@/components/ui/dialogs/rfq-request-dialog";
import { SupportDialog } from "@/components/ui/dialogs/support-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { FilterOptions, useGetAssets } from "@/hooks/useGetAssets";
import { useAppContext } from "@/lib/appContext";
import { cn } from "@/lib/utils";
import { postCartKit } from "@/services/carts.service";
import { ProfileUser } from "@/types/user.types";
import { Mail, MapPin, MoreHorizontal, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { CartAddedModal } from "./cart-added-modal";
import { HoseActionsDropdown } from "./hose-actions-dropdown";
import { HoseColumnsDropdown } from "./hose-columns-dropdown";
import { HoseFiltersDropdown } from "./hose-filters-dropdown";
import { HoseSearchBar } from "./hose-search-bar";

export interface HoseOrder {
	hexagonId: string;
	orderId: string;
	id: string;
	kunde_id: string;
	beskrivelse: string;
	status: "Processed" | "Pending" | "Failed" | string;
	ecom?: number | boolean;
	dato: string;
	warehouse: string;
	assetId: string;
	s1_anlegg: string;
	s2_utstyr: string;
	ordrenr: string;
	installasjonsdato?: string;
	produksjonsdato?: string;
	pafyllingsdato?: string;
	neste_inspeksjonsdato?: string;
}

interface HosesAndEquipmentsProps {
	goToHose?: (hoseId: string) => void;
	profile: ProfileUser;
}

export function HosesAndEquipments({
	goToHose,
	profile,
}: HosesAndEquipmentsProps) {
	const t = useTranslations("HosesAndEquipments");
	const tHoseActions = useTranslations("HoseActionsDropdown");
	const router = useRouter();
	const { setIsCartChanging, isCartChanging } = useAppContext();

	const HOSE_COLUMNS_ORDER_KEY = "hosesAndEquipments_columnsOrder";

	const S1_CODE_TROLL_A = "1391731";
	const S1_CODE_GUDRUN = "1291619";

	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [cartModalOpen, setCartModalOpen] = useState(false);
	const [supportOpen, setSupportOpen] = useState(false);
	const [rfqOpen, setRfqOpen] = useState(false);
	const [discardOpen, setDiscardOpen] = useState(false);
	const [printOpen, setPrintOpen] = useState(false);
	const [printTagsOpen, setPrintTagsOpen] = useState(false);
	const [showAllItems, setShowAllItems] = useState(false);
	const [addedToCartItems, setAddedToCartItems] = useState<string[]>([]);
	const [unavailableForPurchaseItems, setUnavailableForPurchaseItems] =
		useState<string[]>([]);
	const [customerNumber, setCustomerNumber] = useState<string>("");
	const [selectedS1Code, setSelectedS1Code] = useState<string | undefined>(
		() => {
			if (typeof window !== "undefined") {
				return localStorage.getItem("selectedS1Code") || profile?.defaultCustomerNumber === SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER ? S1_CODE_TROLL_A : "";
			}
			return undefined;
		},
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const stored = localStorage.getItem("selectedS1Code");
		if (!stored) {
			localStorage.setItem("selectedS1Code", profile?.defaultCustomerNumber === SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER ? S1_CODE_TROLL_A : "");
		}
	}, []);

	const effectiveCustomerNumber =
		profile?.defaultCustomerNumber === SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
			? profile.defaultCustomerNumber
			: customerNumber;

	const [shouldInitAssets, setShouldInitAssets] = useState(false);

	const {
		assets,
		pagination,
		loading,
		fetchAssets,
		s1Codes,
		s1CodesPagination,
		fetchS1Codes,
	} = useGetAssets(
		effectiveCustomerNumber,
		selectedS1Code,
		profile?.defaultCustomerNumber,
		{
			initAssets: shouldInitAssets,
			initS1Codes: true,
			s2Filter: false,
		},
	);
	console.log(s1Codes,"s1Codes");

	const [searchQuery, setSearchQuery] = useState(() => {
		if (typeof window === "undefined") return "";
		return window.localStorage.getItem("searchQuery") ?? "";
	});

	const [selectedRows, setSelectedRows] = useState<string[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("selectedHoseRows");
			return saved ? JSON.parse(saved) : [];
		}
		return [];
	});

	const [allAcrossPages, setAllAcrossPages] = useState(false);
	const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());

	const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
	const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
	const ITEMS_PER_PAGE = 10;
	const HOSE_TABLE_PAGE_KEY = "hosesAndEquipments_page";
	const didInitAssetsRef = useRef(false);
	const currentPageRef = useRef<number>(1);

	const transformedAssets: HoseOrder[] = assets.map((asset: any) => ({
		id: asset?.hoseLine?.hexagonId?.toString?.() || "",
		hexagonId: asset?.hoseLine?.hexagonId?.toString?.() || "",
		orderId: asset?.hoseHeader?.extDocSequenceId ?? "",
		kunde_id: asset?.hoseHeader?.customerNumber ?? "",
		beskrivelse: asset?.hoseLine?.itemDescription ?? "",
		status: asset?.hoseLine?.currentStatus ?? "",
		ecom: asset?.hoseLine?.ecom,
		dato: asset?.hoseHeader?.requestDate ?? "",
		warehouse: asset?.hoseHeader?.department ?? "",
		assetId: asset?.hoseHeader?.assetId?.toString?.() || "",
		s1_anlegg: asset?.hoseLine?.s1?.s1Name ?? "",
		s2_utstyr: asset?.hoseLine?.s2?.s2Name ?? "",
		ordrenr: asset?.hoseHeader?.customerOrderNumber ?? "",
		installasjonsdato: asset?.hoseLine?.installationDate ?? undefined,
		produksjonsdato: asset?.hoseLine?.productionDate ?? undefined,
		pafyllingsdato: asset?.hoseLine?.refillDate ?? undefined,
		neste_inspeksjonsdato: asset?.hoseLine?.nextInspectionDate ?? undefined,
	}));

	useEffect(() => {
		if (
			profile?.defaultCustomerNumber &&
			profile.defaultCustomerNumber !==
				SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
		) {
			setCustomerNumber(profile.defaultCustomerNumber);
		}
	}, [profile?.defaultCustomerNumber]);

	// Keep a ref to always have the latest transformed assets
	const transformedAssetsRef = useRef(transformedAssets);
	const assetsByHexagonIdRef = useRef(
		new Map<string, Pick<HoseOrder, "ecom">>(),
	);
	useEffect(() => {
		transformedAssetsRef.current = transformedAssets;
		for (const asset of transformedAssets) {
			if (!asset?.hexagonId) continue;
			assetsByHexagonIdRef.current.set(asset.hexagonId, { ecom: asset.ecom });
		}
	}, [transformedAssets]);

	const isRowSelected = (hexagonId: string) => {
		if (allAcrossPages) return !deselectedIds.has(hexagonId);
		return selectedRows.includes(hexagonId);
	};

	const isEcomBlocked = (row: HoseOrder) => Number(row.ecom) === 3;

	const selectedCount = allAcrossPages
		? Math.max(0, (pagination?.totalItems ?? 0) - deselectedIds.size)
		: selectedRows.length;

	const allSelectedOnPage = useMemo(() => {
		if (!transformedAssets.length) return false;
		const purchasableAssets = transformedAssets.filter(
			(a) => !isEcomBlocked(a),
		);
		if (purchasableAssets.length === 0) return false;
		if (allAcrossPages) {
			return purchasableAssets.every((a) => !deselectedIds.has(a.hexagonId));
		}
		const set = new Set(selectedRows);
		return purchasableAssets.every((a) => set.has(a.hexagonId));
	}, [transformedAssets, selectedRows, allAcrossPages, deselectedIds]);

	const someSelectedOnPage = useMemo(() => {
		if (!transformedAssets.length) return false;
		const purchasableAssets = transformedAssets.filter(
			(a) => !isEcomBlocked(a),
		);
		if (purchasableAssets.length === 0) return false;
		if (allAcrossPages) {
			const selectedOnPageCount = purchasableAssets.filter(
				(a) => !deselectedIds.has(a.hexagonId),
			).length;
			return (
				selectedOnPageCount > 0 &&
				selectedOnPageCount < purchasableAssets.length
			);
		}
		const set = new Set(selectedRows);
		const selectedOnPageCount = purchasableAssets.filter((a) =>
			set.has(a.hexagonId),
		).length;
		return (
			selectedOnPageCount > 0 && selectedOnPageCount < purchasableAssets.length
		);
	}, [transformedAssets, selectedRows, allAcrossPages, deselectedIds]);

	const allSelectedGlobally = allAcrossPages && selectedCount > 0;

	const handleSelectRow = (key: string, checked: boolean | "indeterminate") => {
		const on = checked === true;
		if (allAcrossPages) {
			setDeselectedIds((prev) => {
				const next = new Set(prev);
				if (on) next.delete(key);
				else next.add(key);
				return next;
			});
			return;
		}

		setSelectedRows((prev) => {
			const next = on
				? prev.includes(key)
					? prev
					: [...prev, key]
				: prev.filter((id) => id !== key);
			localStorage.setItem("selectedHoseRows", JSON.stringify(next));
			return next;
		});
	};

	const handleBulkSelect = useCallback(
		(ids: string[], checked: boolean) => {
			if (allAcrossPages) {
				setDeselectedIds((prev) => {
					const next = new Set(prev);
					for (const id of ids) {
						if (checked) next.delete(id);
						else next.add(id);
					}
					return next;
				});
				return;
			}

			setSelectedRows((prev) => {
				const next = checked
					? Array.from(new Set([...prev, ...ids]))
					: prev.filter((id) => !ids.includes(id));
				localStorage.setItem("selectedHoseRows", JSON.stringify(next));
				return next;
			});
		},
		[allAcrossPages],
	);

	const handleSelectAllOnPage = useCallback(() => {
		const ids = transformedAssets
			.filter((a) => !isEcomBlocked(a))
			.map((a) => a.hexagonId);

		if (ids.length === 0) {
			return;
		}

		// Calculate current selection state directly to avoid stale closure
		let currentlyAllSelected: boolean;
		if (allAcrossPages) {
			currentlyAllSelected = ids.every((id) => !deselectedIds.has(id));
		} else {
			const set = new Set(selectedRows);
			currentlyAllSelected = ids.every((id) => set.has(id));
		}

		const shouldSelect = !currentlyAllSelected;
		handleBulkSelect(ids, shouldSelect);
	}, [
		transformedAssets,
		allAcrossPages,
		deselectedIds,
		selectedRows,
		handleBulkSelect,
	]);

	const handleSelectAllGlobally = (on: boolean) => {
		if (on) {
			setAllAcrossPages(true);
			setDeselectedIds(new Set());
			setSelectedRows([]);
			localStorage.setItem("selectedHoseRows", JSON.stringify([]));
		} else {
			setAllAcrossPages(false);
			setDeselectedIds(new Set());
			setSelectedRows([]);
			localStorage.setItem("selectedHoseRows", JSON.stringify([]));
		}
	};

	const handleRemoveSelectedId = (id: string) => {
		if (allAcrossPages) {
			setDeselectedIds((prev) => {
				const next = new Set(prev);
				next.add(id);
				return next;
			});
			return;
		}
		setSelectedRows((prev) => {
			const next = prev.filter((x) => x !== id);
			localStorage.setItem("selectedHoseRows", JSON.stringify(next));
			return next;
		});
	};

	const clearSelection = () => {
		setSelectedRows([]);
		setAllAcrossPages(false);
		setDeselectedIds(new Set());
		if (typeof window !== "undefined") {
			window.localStorage.setItem("selectedHoseRows", JSON.stringify([]));
		}
	};

	const selectSingleRow = (hexagonId: string) => {
		setAllAcrossPages(false);
		setDeselectedIds(new Set());
		setSelectedRows([hexagonId]);
		localStorage.setItem("selectedHoseRows", JSON.stringify([hexagonId]));
	};

	const handleAddSingleToCart = async (order: HoseOrder) => {
		if (isEcomBlocked(order)) return;
		setIsAddingToCart(true);
		try {
			const cartItems = [
				{
					hexagonId: Number(order.hexagonId),
					quantity: 1,
					warehouseNumber: profile?.defaultWarehouseNumber,
					companyNumber: profile?.defaultCompanyNumber,
				},
			];

			await postCartKit(cartItems);
			setAddedToCartItems([order.hexagonId]);
			setUnavailableForPurchaseItems([]);
			toast.success("Element lagt til i handlekurven");
			setIsCartChanging(!isCartChanging);
			setCartModalOpen(true);
		} catch (error) {
			toast.error("Kunne ikke legge til element i handlekurven");
		} finally {
			setIsAddingToCart(false);
		}
	};

	const handleBulkAction = async (action: string): Promise<void> => {
		if (action === "cart") {
			if (selectedCount === 0) {
				toast.error("Vennligst velg elementer å legge til i handlekurven");
				return;
			}

			const handleAddToCart = async () => {
				setIsAddingToCart(true);
				try {
					const currentAssets = transformedAssetsRef.current;
					const selectedAssets: Array<Pick<HoseOrder, "hexagonId" | "ecom">> =
						allAcrossPages
							? currentAssets.filter((a) => !deselectedIds.has(a.hexagonId))
							: selectedRows.map((hexagonId) => {
									const meta = assetsByHexagonIdRef.current.get(hexagonId);
									return { hexagonId, ecom: meta?.ecom };
								});

					const unavailable = selectedAssets
						.filter((a) => Number(a.ecom) === 3)
						.map((a) => a.hexagonId);
					const available = selectedAssets
						.filter((a) => Number(a.ecom) !== 3)
						.map((a) => a.hexagonId);

					setAddedToCartItems(available);
					setUnavailableForPurchaseItems(unavailable);

					if (available.length > 0) {
						const cartItems = available.map((hexagonId) => ({
							hexagonId: Number(hexagonId),
							quantity: 1,
							warehouseNumber: profile?.defaultWarehouseNumber,
							companyNumber: profile?.defaultCompanyNumber,
						}));

						await postCartKit(cartItems);
						toast.success("Elementer lagt til i handlekurven");
						setIsCartChanging(!isCartChanging);
					}

					setCartModalOpen(true);
				} catch (error) {
					toast.error("Kunne ikke legge til elementer i handlekurven");
				} finally {
					setIsAddingToCart(false);
				}
			};

			handleAddToCart();
		}
	};

	const getActiveFilters = (opts?: {
		selectedFilters?: string[];
		selectedAgeRanges?: string[];
	}) => {
		const filters: Record<string, any> = {};
		const f = opts?.selectedFilters ?? selectedFilters;
		const ages = opts?.selectedAgeRanges ?? selectedAgeRanges;

		if (ages.length > 0) filters.ageSize = ages.join(",");
		if (f.includes("approved")) filters.approved = "true";
		if (f.includes("overdue")) filters.overdue = "true";
		if (f.includes("replacementDue")) filters.replacementDue = "true";
		if (f.includes("spareSet")) filters.spareSet = "true";
		if (f.includes("rejected")) filters.rejected = "true";

		return filters;
	};

	const handlePageChange = (page: number) => {
		currentPageRef.current = page;
		const filters: FilterOptions = {
			page,
			pageSize: ITEMS_PER_PAGE,
			...getActiveFilters(),
			...(searchQuery ? { search: searchQuery } : {}),
		};
		fetchAssets(filters);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(HOSE_TABLE_PAGE_KEY, String(page));
		}
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleHoseClick = (hoseId: string) => {
		if (typeof window !== "undefined") {
			const pageToPersist = currentPageRef.current || pagination.currentPage;
			window.localStorage.setItem(HOSE_TABLE_PAGE_KEY, String(pageToPersist));
		}
		goToHose?.(hoseId);
	};

	useEffect(() => {
		if (didInitAssetsRef.current) return;
		if (!effectiveCustomerNumber) return;
		if (typeof window === "undefined") return;

		didInitAssetsRef.current = true;
		const storedPage = window.localStorage.getItem(HOSE_TABLE_PAGE_KEY);
		const page = Number(storedPage);
		const nextPage = Number.isFinite(page) && page > 0 ? page : 1;
		currentPageRef.current = nextPage;
		fetchAssets({
			page: nextPage,
			pageSize: ITEMS_PER_PAGE,
			...getActiveFilters(),
			...(searchQuery ? { search: searchQuery } : {}),
		});
		setShouldInitAssets(true);
	}, [effectiveCustomerNumber]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const storedPage = window.localStorage.getItem(HOSE_TABLE_PAGE_KEY);
		if (!storedPage) return;
		const page = Number(storedPage);
		if (!Number.isFinite(page) || page <= 0) return;
		if (page === pagination.currentPage) return;

		const filters: FilterOptions = {
			page,
			pageSize: ITEMS_PER_PAGE,
			...getActiveFilters(),
			...(searchQuery ? { search: searchQuery } : {}),
		};
		fetchAssets(filters);
	}, []);

	const columnOptions = [
		"id",
		"customerId",
		"description",
		"s1Location",
		"s2Equipment",
		"orderNumber",
		"actions",
		"installationDate",
		"productionDate",
		"fillingDate",
		"nextInspectionDate",
	];

	const [selectedColumns, setSelectedColumns] = useState<string[]>([
		"id",
		"customerId",
		"description",
		"s1Location",
		"s2Equipment",
		"orderNumber",
		"actions",
	]);

	const [columnOrder, setColumnOrder] = useState<string[]>(() => {
		if (typeof window === "undefined") return [...columnOptions];
		try {
			const raw = window.localStorage.getItem(HOSE_COLUMNS_ORDER_KEY);
			if (!raw) return [...columnOptions];
			const parsed = JSON.parse(raw) as unknown;
			if (!Array.isArray(parsed)) return [...columnOptions];
			const next = parsed.filter((x): x is string => typeof x === "string");
			const allowed = new Set(columnOptions);
			const cleaned = next.filter((k) => allowed.has(k));
			for (const k of columnOptions) {
				if (!cleaned.includes(k)) cleaned.push(k);
			}
			return cleaned;
		} catch {
			return [...columnOptions];
		}
	});

	const allColumns: Record<string, Column<HoseOrder>> = {
		id: {
			key: "id",
			header: t("columns.id"),
			cell: (o) => <span>{o.id}</span>,
			sortable: true,
		},
		customerId: {
			key: "kunde_id",
			header: t("columns.customerId"),
			cell: (o) => <span>{o.kunde_id}</span>,
			sortable: true,
		},
		description: {
			key: "beskrivelse",
			header: t("columns.description"),
			cell: (o) => (
				<button
					type="button"
					disabled={isEcomBlocked(o)}
					className={cn(
						"w-full text-left underline-offset-2",
						!isEcomBlocked(o) &&
							"cursor-pointer text-[#003D1A] decoration-[#003D1A]",
						!isEcomBlocked(o) && "hover:underline focus-visible:underline",
						isEcomBlocked(o) && "cursor-not-allowed",
					)}
					onClick={(e) => {
						e.stopPropagation();
						if (isEcomBlocked(o)) return;
						handleHoseClick(o.hexagonId);
					}}>
					{o.beskrivelse}
				</button>
			),
			sortable: true,
		},
		s1Location: {
			key: "s1_anlegg",
			header: t("columns.s1Location"),
			cell: (o) => <span>{o.s1_anlegg}</span>,
			sortable: true,
		},
		s2Equipment: {
			key: "s2_utstyr",
			header: t("columns.s2Equipment"),
			cell: (o) => <span>{o.s2_utstyr}</span>,
			sortable: true,
		},
		orderNumber: {
			key: "ordrenr",
			header: t("columns.orderNumber"),
			cell: (o) => <span>{o.ordrenr}</span>,
			sortable: true,
		},
		installationDate: {
			key: "installasjonsdato",
			header: t("columns.installationDate"),
			cell: (o) => <span>{o.installasjonsdato ?? "-"}</span>,
			sortable: true,
		},
		productionDate: {
			key: "produksjonsdato",
			header: t("columns.productionDate"),
			cell: (o) => <span>{o.produksjonsdato ?? "-"}</span>,
			sortable: true,
		},
		fillingDate: {
			key: "pafyllingsdato",
			header: t("columns.fillingDate"),
			cell: (o) => <span>{o.pafyllingsdato ?? "-"}</span>,
			sortable: true,
		},
		nextInspectionDate: {
			key: "neste_inspeksjonsdato",
			header: t("columns.nextInspectionDate"),
			cell: (o) => <span>{o.neste_inspeksjonsdato ?? "-"}</span>,
			sortable: true,
		},
		actions: {
			key: "handling",
			header: () => {
				const selectableCount = transformedAssets.filter(
					(a) => !isEcomBlocked(a),
				).length;
				const checked: boolean | "indeterminate" = allSelectedOnPage
					? true
					: someSelectedOnPage
						? "indeterminate"
						: false;
				return (
					<Checkbox
						onClick={(e) => e.stopPropagation()}
						disabled={selectableCount === 0}
						checked={checked}
						aria-label={tHoseActions("selectAllOnPage")}
						onCheckedChange={() => {
							handleSelectAllOnPage();
						}}
					/>
				);
			},
			cell: (order: HoseOrder) => (
				<Checkbox
					onClick={(e) => e.stopPropagation()}
					disabled={isEcomBlocked(order)}
					checked={isRowSelected(order.hexagonId)}
					onCheckedChange={(val) => {
						if (isEcomBlocked(order)) return;
						handleSelectRow(order.hexagonId, val);
					}}
				/>
			),
		},
		rowActions: {
			key: "action",
			header: t("columns.handlinger"),
			// header: () => (
			// 	<HoseActionsDropdown
			// 		selectedCount={selectedCount}
			// 		isAddingToCart={isAddingToCart}
			// 		onAddToCart={async () => {
			// 			setCartModalOpen(true);
			// 			await handleBulkAction("cart");
			// 			localStorage.setItem("selectedHoseRows", JSON.stringify([]));
			// 		}}
			// 		onContactSupport={() => {
			// 			if (selectedCount === 0) {
			// 				toast.error(t("errors.selectItemsFirst"));
			// 				return;
			// 			}
			// 			setSupportOpen(true);
			// 		}}
			// 		onReportReplacement={() => {
			// 			if (selectedCount === 0) return;
			// 			setRfqOpen(true);
			// 		}}
			// 		onDiscardEquipment={() => {
			// 			if (selectedCount === 0) return;
			// 			setDiscardOpen(true);
			// 		}}
			// 		onPrintCertificate={() => handleBulkAction("print-cert")}
			// 		onPrintTags={() => {
			// 			if (selectedCount === 0) return;
			// 			setPrintTagsOpen(true);
			// 		}}
			// 		onPrintTestCertificates={() => {
			// 			if (selectedCount === 0) return;
			// 			setPrintOpen(true);
			// 		}}
			// 		onExport={() => handleBulkAction("export")}
			// 		onSelectAll={() => handleSelectAllGlobally(!allAcrossPages)}
			// 		onSelectAllOnPage={handleSelectAllOnPage}
			// 		allSelected={allSelectedGlobally}
			// 		allSelectedOnPage={allSelectedOnPage}
			// 	/>
			// ),
			cell: (order: HoseOrder) => (
				<div
					className="flex items-center justify-center gap-2"
					onClick={(e) => e.stopPropagation()}>
					<Button
						variant="ghost"
						size="icon"
						disabled={isEcomBlocked(order) || isAddingToCart}
						className="h-10 w-10 rounded-full text-[#0F1912] hover:bg-[#E5E7E6] focus-visible:ring-4 focus-visible:ring-[#C1C4C2] focus-visible:outline-hidden"
						onClick={() => void handleAddSingleToCart(order)}>
						<ShoppingCart
							className={
								isEcomBlocked(order)
									? "h-5 w-5 text-[#5A615D]"
									: "h-5 w-5 text-[#0F1912]"
							}
						/>
					</Button>

					{/* <DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-10 w-10 rounded-full text-[#0F1912] hover:bg-[#E5E7E6] focus-visible:ring-4 focus-visible:ring-[#C1C4C2] focus-visible:outline-hidden">
								<MoreHorizontal className="h-5 w-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-[300px]">
							<DropdownMenuItem
								disabled={isEcomBlocked(order) || isAddingToCart}
								className="flex items-center gap-3"
								onClick={() => void handleAddSingleToCart(order)}>
								<ShoppingCart className="h-4 w-4 text-[#005522]" />
								<span>Legg til handlekurv</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="flex items-center gap-3"
								onClick={() => {
									selectSingleRow(order.hexagonId);
									setSupportOpen(true);
								}}>
								<Mail className="h-4 w-4 text-[#005522]" />
								<span>Kontakt TESS support</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="flex items-center gap-3"
								onClick={() => {
									selectSingleRow(order.hexagonId);
									setRfqOpen(true);
								}}>
								<Mail className="h-4 w-4 text-[#005522]" />
								<span>Send forespørsel om tilbud (RFQ)</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu> */}
				</div>
			),
		},
	};

	const activeColumns = useMemo(() => {
		const selectedSet = new Set(selectedColumns);
		const cols: Column<HoseOrder>[] = [];

		if (selectedSet.has("actions")) {
			cols.push(allColumns["actions"]);
		}

		for (const key of columnOrder) {
			if (key === "actions") continue;
			if (!selectedSet.has(key)) continue;
			const col = allColumns[key];
			if (!col) continue;
			cols.push(col);
		}

		cols.push(allColumns["rowActions"]);
		return cols;
	}, [
		selectedColumns,
		columnOrder,
		transformedAssets,
		allSelectedOnPage,
		someSelectedOnPage,
		handleSelectAllOnPage,
		selectedRows,
		allAcrossPages,
		deselectedIds,
		selectedCount,
	]);

	const handleColumnChange = (value: string): void => {
		setSelectedColumns((prev) =>
			prev.includes(value)
				? prev.filter((col) => col !== value)
				: [...prev, value],
		);
	};

	const handleReorderColumns = (nextOrder: string[]) => {
		setColumnOrder(nextOrder);
		if (typeof window === "undefined") return;
		window.localStorage.setItem(
			HOSE_COLUMNS_ORDER_KEY,
			JSON.stringify(nextOrder),
		);
	};

	const columnLabels = useMemo<Record<string, string>>(
		() => ({
			id: t("columns.id"),
			customerId: t("columns.customerId"),
			description: t("columns.description"),
			s1Location: t("columns.s1Location"),
			s2Equipment: t("columns.s2Equipment"),
			orderNumber: t("columns.orderNumber"),
			actions: t("columns.handlinger"),
			installationDate: t("columns.installationDate"),
			productionDate: t("columns.productionDate"),
			fillingDate: t("columns.fillingDate"),
			nextInspectionDate: t("columns.nextInspectionDate"),
		}),
		[t],
	);

	const handleFilterChange = async (
		value: string,
		checked?: boolean,
	): Promise<void> => {
		setSelectedFilters((prev) => {
			const next =
				checked === undefined
					? prev.includes(value)
						? prev.filter((v) => v !== value)
						: [...prev, value]
					: checked
						? [...new Set([...prev, value])]
						: prev.filter((v) => v !== value);

			fetchAssets({
				page: 1,
				pageSize: pagination.pageSize,
				...getActiveFilters({ selectedFilters: next }),
				...(searchQuery ? { search: searchQuery } : {}),
			});
			return next;
		});
	};

	const filteredS1Codes = profile?.defaultCustomerNumber === SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER ? (s1Codes || [])
	.filter((s1) => s1.S1Code && s1.S1Name)
	.filter(
		(s1) =>
			s1.S1Code === S1_CODE_TROLL_A ||
			s1.S1Code === S1_CODE_GUDRUN,
	)
	.map((s1) => (
		<SelectItem
			key={s1.S1Code}
			value={s1.S1Code}>
			{s1.S1Name}
		</SelectItem>
	)) :(s1Codes || [])
	.filter((s1) => s1.S1Code && s1.S1Name)
	.map((s1) => (
		<SelectItem
			key={s1.S1Code}
			value={s1.S1Code}>
			{s1.S1Name}
		</SelectItem>
	))

	return (
		<>
			<CartAddedModal
				open={cartModalOpen}
				onOpenChange={(open) => {
					setCartModalOpen(open);
					setAddedToCartItems([]);
					setUnavailableForPurchaseItems([]);
					setSelectedRows([]);
					setAllAcrossPages(false);
					setDeselectedIds(new Set());
				}}
				selectedItems={addedToCartItems}
				unavailableItems={unavailableForPurchaseItems}
				showAllItems={showAllItems}
				setShowAllItems={setShowAllItems}
				onConfirm={async () => {
					setCartModalOpen(false);
					if (addedToCartItems.length > 0) {
						router.push("/cart");
					} else {
						setRfqOpen(true);
					}
					setAddedToCartItems([]);
					setUnavailableForPurchaseItems([]);
					setSelectedRows([]);
					setAllAcrossPages(false);
					setDeselectedIds(new Set());
					localStorage.removeItem("hosesAndEquipments_page");
				}}
			/>

			<SupportDialog
				open={supportOpen}
				onOpenChange={setSupportOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(a.hexagonId))
								.map((a) => a.hexagonId)
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async () => {
					toast.success(t("success.supportMessageSent"));
				}}
			/>

			<RFQRequestDialog
				open={rfqOpen}
				onOpenChange={setRfqOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(a.hexagonId))
								.map((a) => a.hexagonId)
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async () => {
					toast.success(t("success.requestSent"));
				}}
			/>

			<DiscardEquipmentDialog
				open={discardOpen}
				onOpenChange={setDiscardOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(a.hexagonId))
								.map((a) => a.hexagonId)
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async () => {
					toast.success(t("success.equipmentDiscarded"));
				}}
			/>

			<PrintTagsDialog
				open={printTagsOpen}
				onOpenChange={setPrintTagsOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(a.hexagonId))
								.map((a) => a.hexagonId)
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				previewUrl="/images/presentation.png"
			/>

			<PrintCertificatesDialog
				open={printOpen}
				onOpenChange={setPrintOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(a.hexagonId))
								.map((a) => a.hexagonId)
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				pdfUrl="https://www.orimi.com/pdf-test.pdf"
			/>

			<div className="space-y-6">
				<div className="flex items-baseline space-x-4">
					<div className="flex items-center">
						<h1 className="text-2xl font-semibold">{t("title")}</h1>
					</div>

					<div className="flex w-[280px] items-center gap-3">
						<p className="text-base font-normal text-[#5A615D]">
							{t("location")}:
						</p>
						<div className="relative">
							<Select
								value={selectedS1Code || ""}
								onValueChange={(value) => {
									if (!value) {
										setSelectedS1Code("");
										localStorage.removeItem("selectedS1Code");
									} else {
										setSelectedS1Code(value);
										localStorage.setItem("selectedS1Code", value);
									}
								}}>
								<SelectTrigger className="relative w-[200px] border-[#C1C4C2] bg-white pr-8 font-medium text-[#0F1912]">
									<div className="flex items-center gap-2 overflow-hidden">
										<MapPin className="h-4 w-4 shrink-0 text-[#0F1912]" />
										<SelectValue
											className="truncate"
											placeholder={t("selectS1Location")}
										/>
									</div>
								</SelectTrigger>
								<SelectContent
									className="max-h-[300px] overflow-y-auto"
									onScroll={(e) => {
										const target = e.target as HTMLDivElement;
										if (
											target.scrollTop + target.clientHeight >=
												target.scrollHeight - 20 &&
											!loading &&
											s1CodesPagination.currentPage <
												s1CodesPagination.totalPages
										) {
											fetchS1Codes(
												s1CodesPagination.currentPage + 1,
												s1CodesPagination.pageSize,
												false,
											);
										}
									}}>
									{filteredS1Codes}
									{loading && s1CodesPagination.currentPage > 1 && (
										<div className="py-2 text-center text-sm text-gray-500">
											{t("loadingMore")}
										</div>
									)}
								</SelectContent>
							</Select>
							{selectedS1Code && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setSelectedS1Code("");
										localStorage.removeItem("selectedS1Code");
									}}
									className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none">
									<X className="h-4 w-4 text-[#5A615D]" />
									<span className="sr-only">{t("removeLocation")}</span>
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-[#C1C4C2] bg-white">
					<div className="flex items-start justify-between space-y-6 p-6">
						<HoseSearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={() => {
								fetchAssets({
									page: 1,
									pageSize: ITEMS_PER_PAGE,
									search: searchQuery,
									...getActiveFilters(),
								});
								localStorage.setItem("searchQuery", searchQuery);
							}}
							onClear={() => {
								setSearchQuery("");
								setSelectedRows([]);
								setAllAcrossPages(false);
								setDeselectedIds(new Set());
								localStorage.removeItem("selectedHoseRows");
								setSelectedFilters([]);
								setSelectedAgeRanges([]);
								fetchAssets({ page: 1, pageSize: ITEMS_PER_PAGE });
								localStorage.removeItem("searchQuery");
							}}
						/>

						<div className="flex items-center space-x-4">
							<HoseColumnsDropdown
								options={columnOrder}
								selected={selectedColumns}
								onToggle={handleColumnChange}
								onReorder={handleReorderColumns}
								labels={columnLabels}
							/>

							<HoseFiltersDropdown
								selectedFilters={selectedFilters}
								selectedAgeRanges={selectedAgeRanges}
								onToggleFilter={(value) => handleFilterChange(value)}
								onToggleAgeRange={async (value) => {
									const newRanges = selectedAgeRanges.includes(value)
										? selectedAgeRanges.filter((r) => r !== value)
										: [...selectedAgeRanges, value];
									setSelectedAgeRanges(newRanges);
									await fetchAssets({
										page: 1,
										pageSize: pagination.pageSize,
										ageSize: newRanges.join(","),
										...getActiveFilters(),
										...(searchQuery ? { search: searchQuery } : {}),
									});
								}}
								profile={profile}
							/>
						</div>
					</div>

					{selectedCount > 0 && (
						<div className="flex items-center justify-between gap-4 bg-[#DCF7E0] px-6 py-3">
							<div className="flex items-center gap-3">
								<div className="text-sm font-medium text-[#0F1912]">
									{selectedCount} enheter valgt
								</div>
								<Button
									onClick={async () => {
										setCartModalOpen(true);
										await handleBulkAction("cart");
										localStorage.removeItem("selectedHoseRows");
									}}
									disabled={isAddingToCart}
									className="h-9 bg-[#009640] px-4 text-sm font-medium text-white hover:bg-[#003D1A]">
									<ShoppingCart className="mr-2 h-4 w-4" />
									Legg til {selectedCount} enheter
								</Button>
								<HoseActionsDropdown
									selectedCount={selectedCount}
									isAddingToCart={isAddingToCart}
									onAddToCart={async () => {
										setCartModalOpen(true);
										await handleBulkAction("cart");
									}}
									onContactSupport={() => {
										if (selectedCount === 0) {
											toast.error(t("errors.selectItemsFirst"));
											return;
										}
										setSupportOpen(true);
									}}
									onReportReplacement={() => {
										if (selectedCount === 0) return;
										setRfqOpen(true);
									}}
									onDiscardEquipment={() => {
										if (selectedCount === 0) return;
										setDiscardOpen(true);
									}}
									onPrintCertificate={() => handleBulkAction("print-cert")}
									onPrintTags={() => {
										if (selectedCount === 0) return;
										setPrintTagsOpen(true);
									}}
									onPrintTestCertificates={() => {
										if (selectedCount === 0) return;
										setPrintOpen(true);
									}}
									onExport={() => handleBulkAction("export")}
									onSelectAll={() => handleSelectAllGlobally(!allAcrossPages)}
									onSelectAllOnPage={handleSelectAllOnPage}
									allSelected={allSelectedGlobally}
									allSelectedOnPage={allSelectedOnPage}
									align="start"
									triggerButton={
										<Button
											variant="outline"
											className="h-9 border-[#C1C4C2] bg-white px-4 text-sm font-medium text-[#0F1912] hover:bg-[#F8F9F8]">
											<MoreHorizontal className="h-4 w-4" />
											Flere handlinger
										</Button>
									}
								/>
							</div>
							<Button
								variant="outlineGrey"
								onClick={clearSelection}
								className="h-9 gap-2 border-[#C1C4C2] bg-white px-3 text-sm font-medium text-[#0F1912] hover:border-[#C1C4C2] hover:bg-white">
								<X className="h-4 w-4" />
								Fjern valg
							</Button>
						</div>
					)}

					<DataTable<HoseOrder>
						data={loading ? [] : transformedAssets}
						columns={activeColumns}
						currentPage={pagination.currentPage}
						totalPages={pagination.totalPages}
						totalItems={pagination.totalItems}
						itemsPerPage={pagination.pageSize}
						onPageChange={handlePageChange}
						isLoading={loading}
						selectedIds={selectedRows}
						selectedRowBgClass="bg-[#DCF7E0]"
						isRowDisabled={(row) => Number(row.ecom) === 3}
					/>
				</div>
			</div>
		</>
	);
}
