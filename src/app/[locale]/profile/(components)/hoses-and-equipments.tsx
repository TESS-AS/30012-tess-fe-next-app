import React, { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DiscardEquipmentDialog } from "@/components/ui/dialogs/discard-equipment-dialog";
import { PrintCertificatesDialog } from "@/components/ui/dialogs/print-certificates-dialog";
import { PrintTagsDialog } from "@/components/ui/dialogs/print-tags-dialog";
import { RFQRequestDialog } from "@/components/ui/dialogs/rfq-request-dialog";
import { SupportDialog } from "@/components/ui/dialogs/support-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { FilterOptions, useGetAssets } from "@/hooks/useGetAssets";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useAppContext } from "@/lib/appContext";
import { postCartKit } from "@/services/carts.service";
import { MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
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
}

export function HosesAndEquipments({ goToHose }: HosesAndEquipmentsProps) {
	const { data: profile } = usePunchoutProfile();
	const [customerNumber, setCustomerNumber] = useState<string>("");
	const [selectedS1Code, setSelectedS1Code] = useState<string | undefined>(
		() => {
			if (typeof window !== "undefined") {
				return localStorage.getItem("selectedS1Code") || undefined;
			}
			return undefined;
		},
	);

	const { setIsCartChanging, isCartChanging } = useAppContext();

	const {
		assets,
		setAssets,
		pagination,
		loading,
		setLoading,
		fetchAssets,
		s1Codes,
		s1CodesPagination,
		fetchS1Codes,
	} = useGetAssets(
		profile?.defaultCustomerNumber === SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
			? profile?.defaultCustomerNumber
			: customerNumber,
		selectedS1Code,
		{ initAssets: true, initS1Codes: true, s2Filter: false },
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedColumns, setSelectedColumns] = useState<string[]>([
		"ID",
		"Kunde-ID",
		"Beskrivelse",
		"S1 anlegg, fartøy, enhet",
		"S2 utstyr",
		"Ordrenummer (PO)",
		"Handling",
	]);

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

	const transformedAssets: HoseOrder[] = assets.map((asset: any) => ({
		id: asset?.hoseLine?.hexagonId?.toString?.() || "",
		hexagonId: asset?.hoseLine?.hexagonId?.toString?.() || "",
		orderId: String(asset?.hoseHeader?.extDocSequenceId ?? ""),
		kunde_id: asset?.hoseHeader?.customerNumber ?? "",
		beskrivelse: asset?.hoseLine?.itemDescription ?? "",
		status: asset?.hoseLine?.currentStatus ?? "",
		dato: asset?.hoseHeader?.requestDate ?? "",
		warehouse: asset?.hoseHeader?.department ?? "",
		assetId: asset?.hoseHeader?.assetId?.toString?.() || "",
		s1_anlegg: asset?.hoseLine?.s1?.s1Name ?? "",
		s2_utstyr: asset?.hoseLine?.s2?.s2Name ?? "",
		ordrenr: asset?.hoseHeader?.tessOrderNumber ?? "",
		installasjonsdato: asset?.hoseLine?.installationDate ?? undefined,
		produksjonsdato: asset?.hoseLine?.productionDate ?? undefined,
		pafyllingsdato: asset?.hoseLine?.refillDate ?? undefined,
		neste_inspeksjonsdato: asset?.hoseLine?.nextInspectionDate ?? undefined,
	}));

	// === selection derived ===
	const isRowSelected = (id: string) => {
		if (allAcrossPages) return !deselectedIds.has(id);
		return selectedRows.includes(id);
	};

	const selectedCount = allAcrossPages
		? Math.max(0, (pagination?.totalItems ?? 0) - deselectedIds.size)
		: selectedRows.length;

	const selectedItems = useMemo(() => {
		const set = new Set(selectedRows);
		// NOTE: when allAcrossPages = true, selectedItems may not include off-page items.
		// Use selectedCount for counts and pass only visible "selectedItems" to actions that need concrete IDs from the page.
		return transformedAssets.filter((a) =>
			allAcrossPages
				? !deselectedIds.has(String(a.orderId))
				: set.has(String(a.orderId)),
		);
	}, [selectedRows, transformedAssets, allAcrossPages, deselectedIds]);

	const allSelectedOnPage = useMemo(() => {
		if (!transformedAssets.length) return false;
		if (allAcrossPages) {
			return transformedAssets.every(
				(a) => !deselectedIds.has(String(a.orderId)),
			);
		}
		const set = new Set(selectedRows);
		return transformedAssets.every((a) => set.has(String(a.orderId)));
	}, [transformedAssets, selectedRows, allAcrossPages, deselectedIds]);

	const allSelectedGlobally = allAcrossPages && selectedCount > 0;

	// === handlers ===
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

	const handleBulkSelect = (ids: string[], checked: boolean) => {
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
	};

	const handleSelectAllOnPage = (checked: boolean) => {
		const ids = transformedAssets.map((a) => String(a.orderId));
		handleBulkSelect(ids, checked);
	};

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

	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [cartModalOpen, setCartModalOpen] = useState(false);
	const [supportOpen, setSupportOpen] = useState(false);
	const [rfqOpen, setRfqOpen] = useState(false);
	const [discardOpen, setDiscardOpen] = useState(false);
	const [printOpen, setPrintOpen] = useState(false);
	const [printTagsOpen, setPrintTagsOpen] = useState(false);
	const [showAllItems, setShowAllItems] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const router = useRouter();

	const handleBulkAction = async (action: string): Promise<void> => {
		if (action === "cart") {
			if (selectedCount === 0) {
				toast.error("Vennligst velg elementer å legge til i handlekurven");
				return;
			}

			const handleAddToCart = async () => {
				setIsAddingToCart(true);
				try {
					// If allAcrossPages, you'd normally send a server-side query representing the current filters
					// plus exclusions (deselectedIds) instead of explicit IDs. Here, we only map visible items.
					const rowsToUse = allAcrossPages
						? transformedAssets.filter(
								(a) => !deselectedIds.has(String(a.orderId)),
							)
						: transformedAssets.filter((a) =>
								selectedRows.includes(String(a.orderId)),
							);

					const cartItems = rowsToUse.map((asset) => ({
						hexagonId: Number(asset.id),
						quantity: 1,
						warehouseNumber: "L01",
						companyNumber: "1",
					}));

					await postCartKit(cartItems);
					setCartModalOpen(true);
					toast.success("Elementer lagt til i handlekurven");
					setIsNavigating(true);
					setIsCartChanging(!isCartChanging);
					router.push("/cart");
				} catch (error) {
					toast.error("Kunne ikke legge til elementer i handlekurven");
				} finally {
					setIsAddingToCart(false);
					setSelectedRows([]);
					setAllAcrossPages(false);
					setDeselectedIds(new Set());
				}
			};

			handleAddToCart();
		} else {
			console.log(`Bulk action ${action} for rows:`, selectedRows);
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
		const filters: FilterOptions = {
			page,
			pageSize: ITEMS_PER_PAGE,
			...getActiveFilters(),
		};
		fetchAssets(filters);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const columnOptions = [
		"ID",
		"Kunde-ID",
		"Beskrivelse",
		"S1 anlegg, fartøy, enhet",
		"S2 utstyr",
		"Ordrenummer (PO)",
		"Handling",
		"Installasjonsdato",
		"Produksjonsdato",
		"Påfyllingsdato",
		"Neste inspeksjonsdato",
	];

	const allColumns: Record<string, Column<HoseOrder>> = {
		ID: {
			key: "id",
			header: "ID",
			cell: (o) => <span>{o.id}</span>,
			sortable: true,
		},
		"Kunde-ID": {
			key: "kunde_id",
			header: "KUNDE-ID",
			cell: (o) => <span>{o.kunde_id}</span>,
			sortable: true,
		},
		Beskrivelse: {
			key: "beskrivelse",
			header: "BESKRIVELSE",
			cell: (o) => <span>{o.beskrivelse}</span>,
			sortable: true,
		},
		"S1 anlegg, fartøy, enhet": {
			key: "s1_anlegg",
			header: "S1 ANLEGG, FARTØY, ENHET",
			cell: (o) => <span>{o.s1_anlegg}</span>,
			sortable: true,
		},
		"S2 utstyr": {
			key: "s2_utstyr",
			header: "S2 UTSTYR",
			cell: (o) => <span>{o.s2_utstyr}</span>,
			sortable: true,
		},
		"Ordrenummer (PO)": {
			key: "ordrenr",
			header: "ORDRENUMMER (PO)",
			cell: (o) => <span>{o.ordrenr}</span>,
			sortable: true,
		},
		Installasjonsdato: {
			key: "installasjonsdato",
			header: "INSTALLASJONSDATO",
			cell: (o) => <span>{o.installasjonsdato ?? "-"}</span>,
			sortable: true,
		},
		Produksjonsdato: {
			key: "produksjonsdato",
			header: "PRODUKSJONSDATO",
			cell: (o) => <span>{o.produksjonsdato ?? "-"}</span>,
			sortable: true,
		},
		Påfyllingsdato: {
			key: "pafyllingsdato",
			header: "PÅFYLLINGSDATO",
			cell: (o) => <span>{o.pafyllingsdato ?? "-"}</span>,
			sortable: true,
		},
		"Neste inspeksjonsdato": {
			key: "neste_inspeksjonsdato",
			header: "NESTE INSPEKSJONSDATO",
			cell: (o) => <span>{o.neste_inspeksjonsdato ?? "-"}</span>,
			sortable: true,
		},
		Handling: {
			key: "handling",
			header: () => (
				<HoseActionsDropdown
					selectedCount={selectedCount}
					isAddingToCart={isAddingToCart}
					onAddToCart={() => setCartModalOpen(true)}
					onContactSupport={() => {
						if (selectedCount === 0) {
							toast.error("Vennligst velg elementer å kontakte om");
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
					onSelectAllOnPage={() => handleSelectAllOnPage(!allSelectedOnPage)}
					allSelected={allSelectedGlobally}
					allSelectedOnPage={allSelectedOnPage}
				/>
			),
			cell: (order: HoseOrder) => (
				<Checkbox
					checked={isRowSelected(String(order.orderId))}
					onCheckedChange={(val) => handleSelectRow(String(order.orderId), val)}
				/>
			),
		},
	};

	const activeColumns = useMemo(() => {
		const nonHandling = selectedColumns.filter((n) => n !== "Handling");
		const cols: Column<HoseOrder>[] = nonHandling
			.map((n) => allColumns[n])
			.filter(Boolean) as Column<HoseOrder>[];
		if (selectedColumns.includes("Handling")) cols.push(allColumns["Handling"]);
		return cols;
	}, [
		selectedColumns,
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

	return (
		<>
			<CartAddedModal
				open={cartModalOpen}
				onOpenChange={setCartModalOpen}
				selectedItems={selectedItems}
				showAllItems={showAllItems}
				setShowAllItems={setShowAllItems}
				isNavigating={isNavigating}
				onConfirm={async () => {
					setCartModalOpen(false);
					await handleBulkAction("cart");
					localStorage.setItem("selectedHoseRows", JSON.stringify([]));
				}}
			/>

			<SupportDialog
				open={supportOpen}
				onOpenChange={setSupportOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(String(a.orderId)))
								.map((a) => String(a.orderId))
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async () => {
					toast.success("Meldingen ble sendt til TESS support");
				}}
			/>

			<RFQRequestDialog
				open={rfqOpen}
				onOpenChange={setRfqOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(String(a.orderId)))
								.map((a) => String(a.orderId))
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async () => {
					toast.success("Forespørselen ble sendt");
				}}
			/>

			<DiscardEquipmentDialog
				open={discardOpen}
				onOpenChange={setDiscardOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(String(a.orderId)))
								.map((a) => String(a.orderId))
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async () => {
					toast.success("Utstyr utrangert");
				}}
			/>

			<PrintTagsDialog
				open={printTagsOpen}
				onOpenChange={setPrintTagsOpen}
				selectedIds={
					allAcrossPages
						? transformedAssets
								.filter((a) => !deselectedIds.has(String(a.orderId)))
								.map((a) => String(a.orderId))
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
								.filter((a) => !deselectedIds.has(String(a.orderId)))
								.map((a) => String(a.orderId))
						: selectedRows
				}
				onRemoveId={handleRemoveSelectedId}
				pdfUrl="https://www.orimi.com/pdf-test.pdf"
			/>

			<div className="space-y-6">
				<div className="flex items-baseline space-x-4">
					<div className="flex items-center">
						<h1 className="text-2xl font-semibold">Slanger og utstyr</h1>
					</div>

					<div className="flex w-[280px] items-center gap-3">
						<p className="text-base font-normal text-[#5A615D]">Lokasjon:</p>
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
											placeholder="Velg S1 anlegg"
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
									{(s1Codes || [])
										.filter((s1) => s1.S1Code && s1.S1Name)
										.map((s1) => (
											<SelectItem
												key={s1.S1Code}
												value={s1.S1Code}>
												{s1.S1Name}
											</SelectItem>
										))}
									{loading && s1CodesPagination.currentPage > 1 && (
										<div className="py-2 text-center text-sm text-gray-500">
											Laster flere...
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
									<span className="sr-only">Fjern lokasjon</span>
								</button>
							)}
						</div>
					</div>

					{profile?.defaultCustomerNumber &&
						profile.defaultCustomerNumber !==
							SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER && (
							<div className="flex w-[280px] items-center gap-3">
								<p className="text-base font-normal text-[#5A615D]">
									Customer:
								</p>
								<div className="relative">
									<Select
										value={customerNumber || ""}
										onValueChange={(value) => {
											if (!value) setCustomerNumber("");
											setCustomerNumber(value);
										}}>
										<SelectTrigger className="relative w-[200px] border-[#C1C4C2] bg-white pr-8 font-medium text-[#0F1912]">
											<SelectValue
												className="truncate"
												placeholder="Velg customer"
											/>
										</SelectTrigger>
										<SelectContent className="max-h-[300px] overflow-y-auto">
											{(profile?.customerNumbers || []).map((num) => (
												<SelectItem
													key={num}
													value={num}>
													{num}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{customerNumber && (
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												setCustomerNumber("");
											}}
											className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none">
											<X className="h-4 w-4 text-[#5A615D]" />
											<span className="sr-only">Fjern customer</span>
										</button>
									)}
								</div>
							</div>
						)}
				</div>

				<div className="rounded-lg border border-[#C1C4C2] bg-white">
					<div className="flex items-start justify-between space-y-6 p-6">
						<HoseSearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={() =>
								fetchAssets({
									page: 1,
									pageSize: ITEMS_PER_PAGE,
									search: searchQuery,
									...getActiveFilters(),
								})
							}
							onClear={() => {
								setSearchQuery("");
								setSelectedRows([]);
								setAllAcrossPages(false);
								setDeselectedIds(new Set());
								localStorage.removeItem("selectedHoseRows");
								setSelectedFilters([]);
								setSelectedAgeRanges([]);
								fetchAssets({ page: 1, pageSize: ITEMS_PER_PAGE });
							}}
						/>

						<div className="flex items-center space-x-4">
							<HoseColumnsDropdown
								options={[...columnOptions]}
								selected={selectedColumns}
								onToggle={handleColumnChange}
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
							/>
						</div>
					</div>

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
						onHoseClick={goToHose}
					/>
				</div>
			</div>
		</>
	);
}
