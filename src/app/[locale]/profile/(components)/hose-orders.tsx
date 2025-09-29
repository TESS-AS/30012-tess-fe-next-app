"use client";

import * as React from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/ui/data-table";
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
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useAppContext } from "@/lib/appContext";
import { cn } from "@/lib/utils";
import { postCartKit } from "@/services/carts.service";
import {
	Funnel,
	Paperclip,
	ShoppingCart,
	FileText,
	Printer,
	ChevronDown,
	Mail,
	Trash2,
	CreditCard,
	CheckSquare,
	MapPin,
	X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { SupportDialog } from "@/components/ui/dialogs/support-dialog";
import { CartAddedModal } from "./cart-added-modal";
import { HoseSearchBar } from "./hose-search-bar";
import { HoseColumnsDropdown } from "./hose-columns-dropdown";
import { HoseFiltersDropdown } from "./hose-filters-dropdown";

export interface HoseOrder {
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

interface HoseOrdersProps {
	onOrderClick?: (orderId: string) => void;
}

export function HoseOrders({ onOrderClick }: HoseOrdersProps) {
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
	const { setIsCartChanging } = useAppContext();

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
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedColumns, setSelectedColumns] = useState<string[]>([
		"Vedlegg",
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
	const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
	const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
	const ITEMS_PER_PAGE = 10;

	const transformedAssets: HoseOrder[] = assets.map((asset: any) => ({
		id: asset?.hoseLine?.hexagonId?.toString?.() || "",
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

	const selectedItems = useMemo(() => {
		const set = new Set(selectedRows);
		return transformedAssets.filter((a) => set.has(String(a.orderId)));
	}, [selectedRows, transformedAssets]);

	const allSelectedOnPage = useMemo(() => {
		if (!transformedAssets.length) return false;
		const ids = transformedAssets.map((a) => String(a.orderId));
		return ids.every((id) => selectedRows.includes(id));
	}, [transformedAssets, selectedRows]);

	const handleSelectRow = (key: string, checked: boolean | "indeterminate") => {
		const on = checked === true;
		setSelectedRows((prev) => {
			const newSelection = on
				? prev.includes(key)
					? prev
					: [...prev, key]
				: prev.filter((id) => id !== key);
			localStorage.setItem("selectedHoseRows", JSON.stringify(newSelection));
			return newSelection;
		});
	};

	const handleBulkSelect = (ids: string[], checked: boolean) => {
		setSelectedRows((prev) => {
			const newSelection = checked
				? Array.from(new Set([...prev, ...ids]))
				: prev.filter((id) => !ids.includes(id));
			localStorage.setItem("selectedHoseRows", JSON.stringify(newSelection));
			return newSelection;
		});
	};

	const handleSelectAllOnPage = (checked: boolean) => {
		const ids = transformedAssets.map((a) => String(a.orderId));
		handleBulkSelect(ids, checked);
	};

	const handleRemoveSelectedId = (id: string) => {
		setSelectedRows((prev) => {
			const next = prev.filter((x) => x !== id);
			localStorage.setItem("selectedHoseRows", JSON.stringify(next));
			return next;
		});
	};

	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [cartModalOpen, setCartModalOpen] = useState(false);
	const [supportOpen, setSupportOpen] = useState(false);
	const [showAllItems, setShowAllItems] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const router = useRouter();

	const handleBulkAction = async (action: string): Promise<void> => {
		if (action === "cart") {
			if (selectedItems.length === 0) {
				toast.error("Vennligst velg elementer å legge til i handlekurven");
				return;
			}

			const handleAddToCart = async () => {
				setIsAddingToCart(true);
				try {
					const cartItems = selectedItems.map((asset) => ({
						hexagonId: Number(asset.id),
						quantity: 1,
						warehouseNumber: "L01",
						companyNumber: "1",
					}));

					await postCartKit(cartItems);
					setCartModalOpen(true);
					toast.success("Elementer lagt til i handlekurven");
					setIsNavigating(true);
					setIsCartChanging(true);
					router.push("/cart");
				} catch (error) {
					toast.error("Kunne ikke legge til elementer i handlekurven");
				} finally {
					setIsAddingToCart(false);
					setSelectedRows([]);
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
		"Vedlegg",
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

	const handleSelectAll = (checked: boolean) => {
		const ids = transformedAssets.map((a) => String(a.orderId));
		const newSelection = checked ? ids : [];
		setSelectedRows(newSelection);
		localStorage.setItem("selectedHoseRows", JSON.stringify(newSelection));
	};

	console.log(selectedRows, "selectedRows");

	const allColumns: Record<string, Column<HoseOrder>> = {
		Vedlegg: {
			key: "vedlegg",
			header: "VEDLEGG",
			cell: () => (
				<div className="flex items-center gap-2">
					<span className="cursor-pointer">
						<Image
							width={16}
							height={20}
							src="/icons/profile/wifi.svg"
							alt="Wifi"
						/>
					</span>
					<span className="cursor-pointer">
						<Paperclip />
					</span>
				</div>
			),
		},
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className={cn(
								"group inline-flex h-[52px] w-full cursor-pointer items-center gap-2 rounded-tr-md px-3 py-2 text-sm font-medium transition-colors",
								selectedRows.length > 0
									? "border-[#0E7B34] bg-[#005522] text-white"
									: "border-[#C1C4C2] text-[#5A615D] data-[state=open]:bg-[#003D1A] data-[state=open]:text-white",
							)}>
							<span className="tracking-wide">HANDLING</span>
							<ChevronDown
								className={cn(
									"h-4 w-4 transition-colors",
									selectedRows.length > 0
										? "text-white"
										: "text-[#5A615D] group-data-[state=open]:text-white",
								)}
							/>
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						className="w-[300px]">
						<div className="text-muted-foreground px-3 pt-1 pb-2 text-xs">
							Valgt: {selectedRows.length}
						</div>

						<DropdownMenuItem
							onClick={() => setCartModalOpen(true)}
							disabled={selectedRows.length === 0 || isAddingToCart}
							className={cn("", {
								"cursor-not-allowed opacity-50":
									selectedRows.length === 0 || isAddingToCart,
							})}>
							<ShoppingCart className="mr-3 h-4 w-4 text-[#005522]" />
							<span>
								{isAddingToCart ? "Legger til..." : "Legg til i handlekurv"}
							</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => {
								if (selectedRows.length === 0) {
									toast.error("Vennligst velg elementer å kontakte om");
									return;
								}
								setSupportOpen(true);
							}}
							className={cn("", {
								"cursor-not-allowed opacity-50": selectedRows.length === 0,
							})}
							disabled={selectedRows.length === 0}>
							<Mail className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Kontakt TESS support</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled
							onClick={() => handleBulkAction("report")}
							className="">
							<FileText className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Rapporter slangebytter</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled
							onClick={() => handleBulkAction("discard")}
							className="">
							<Trash2 className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Kasser utstyr</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled
							onClick={() => handleBulkAction("print-cert")}
							className="">
							<Printer className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Skriv ut TESS trykktest-sertifikat</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled
							onClick={() => handleBulkAction("print-id")}
							className="">
							<Printer className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Skriv ut visuelle ID-merker (strekkode)</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled
							onClick={() => handleBulkAction("print-certs")}
							className="">
							<Printer className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Skriv ut trykktest-sertifikater</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							disabled
							onClick={() => handleBulkAction("export")}
							className="">
							<CreditCard className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Eksporter oversiktsdata til Excel</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() =>
								handleSelectAll(
									!(selectedRows.length === transformedAssets.length),
								)
							}
							className="rounded-none border-t">
							<CheckSquare className="mr-3 h-4 w-4 text-[#005522]" />
							<span>
								{selectedRows.length === transformedAssets.length
									? "Fjern alle"
									: "Velg alle"}
							</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => handleSelectAllOnPage(!allSelectedOnPage)}
							className="">
							<CheckSquare className="mr-3 h-4 w-4 text-[#005522]" />
							<span>
								{allSelectedOnPage
									? "Fjern alle på denne siden"
									: "Velg alle på denne siden"}
							</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			cell: (order: HoseOrder) => (
				<Checkbox
					checked={selectedRows.includes(String(order.orderId))}
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

		if (selectedColumns.includes("Handling")) {
			cols.push(allColumns["Handling"]);
		}
		return cols;
	}, [selectedColumns, selectedRows]);

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
				}}
			/>

			<SupportDialog
				open={supportOpen}
				onOpenChange={setSupportOpen}
				selectedIds={selectedRows}
				onRemoveId={handleRemoveSelectedId}
				onSubmit={async ({ subject, message, file, ids }) => {
					// TODO: integrate with backend endpoint for support tickets
					console.log("Support submit", { subject, message, file, ids });
					toast.success("Meldingen ble sendt til TESS support");
				}}
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
											);
										}
									}}>
									{(s1Codes || []).map((s1) => (
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
									className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
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
											className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
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
								localStorage.removeItem("selectedHoseRows");
								setSelectedFilters([]);
								setSelectedAgeRanges([]);
								fetchAssets({ page: 1, pageSize: ITEMS_PER_PAGE });
							}}
						/>

						<div className="flex items-center space-x-4">
							<HoseColumnsDropdown
								options={columnOptions}
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
					/>
				</div>
			</div>
		</>
	);
}
