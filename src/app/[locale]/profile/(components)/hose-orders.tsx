// HoseOrders.tsx
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetAssets } from "@/hooks/useGetAssets";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import {
	Funnel,
	Paperclip,
	PlusIcon,
	Search,
	ShoppingCart,
	FileText,
	Printer,
	ChevronDown,
	Mail,
	Trash2,
	CreditCard,
	CheckSquare,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import { cn } from "@/lib/utils";

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
	const {
		assets = [],
		pagination,
		loading,
		fetchAssets,
	} = useGetAssets(profile?.customerNumbers?.[3]);
	const { warehouses = [] } = useGetWarehouses(true) || {};

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
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
	const ITEMS_PER_PAGE = 10;

	const transformedAssets: HoseOrder[] = (assets ?? []).map((asset: any) => ({
		id: asset?.hoseHeader?.hoseLineId?.toString?.() || "",
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

	const handleRowSelect = (orderId: string): void => {
		setSelectedRows((prev) =>
			prev.includes(orderId)
				? prev.filter((id) => id !== orderId)
				: [...prev, orderId],
		);
	};

	const allSelectedOnPage = React.useMemo(() => {
		if (!transformedAssets.length) return false;
		const ids = transformedAssets.map((a) => a.orderId);
		return ids.every((id) => selectedRows.includes(id));
	}, [transformedAssets, selectedRows]);

	const handleSelectAllOnPage = (checked: boolean) => {
		const ids = transformedAssets.map((a) => a.orderId);
		setSelectedRows((prev) =>
			checked
				? Array.from(new Set([...prev, ...ids]))
				: prev.filter((id) => !ids.includes(id)),
		);
	};

	const handleBulkAction = (action: string): void => {
		console.log(`Bulk action ${action} for rows:`, selectedRows);
	};

	const handlePageChange = (page: number) => {
		fetchAssets(page, ITEMS_PER_PAGE);
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
		const ids = transformedAssets.map((a) => a.orderId);
		setSelectedRows(checked ? ids : []);
	};

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
			key: "action",
			header: () => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className={cn(
								"inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
								selectedRows.length > 0
									? "border-[#0E7B34] bg-[#0E7B34] text-white hover:opacity-95"
									: "border-[#C1C4C2] bg-white text-[#5A615D] hover:bg-gray-50",
							)}>
							<span className="tracking-wide">HANDLING</span>
							<ChevronDown
								className={cn(
									"h-4 w-4",
									selectedRows.length > 0 ? "text-white" : "text-[#5A615D]",
								)}
							/>
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						className="w-[240px]">
						<div className="text-muted-foreground px-3 pt-1 pb-2 text-xs">
							Valgt: {selectedRows.length}
						</div>

						<DropdownMenuItem
							onClick={() => handleBulkAction("cart")}
							className="p-3">
							<ShoppingCart className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Legg til i handlekurv</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("support")}
							className="p-3">
							<Mail className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Kontakt TESS support</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("report")}
							className="p-3">
							<FileText className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Rapporter slangebytter</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("discard")}
							className="p-3">
							<Trash2 className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Kasser utstyr</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("print-cert")}
							className="p-3">
							<Printer className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Skriv ut TESS trykktest-sertifikat</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("print-id")}
							className="p-3">
							<Printer className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Skriv ut visuelle ID-merker (strekkode)</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("print-certs")}
							className="p-3">
							<Printer className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Skriv ut trykktest-sertifikater</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleBulkAction("export")}
							className="p-3">
							<CreditCard className="mr-3 h-4 w-4 text-[#005522]" />
							<span>Eksporter oversiktsdata til Excel</span>
						</DropdownMenuItem>

						{/* Select/Deselect all (entire dataset currently shown) */}
						<DropdownMenuItem
							onClick={() =>
								handleSelectAll(
									!(selectedRows.length === transformedAssets.length),
								)
							}
							className="border-t p-3">
							<CheckSquare className="mr-3 h-4 w-4 text-[#005522]" />
							<span>
								{selectedRows.length === transformedAssets.length
									? "Fjern alle"
									: "Velg alle"}
							</span>
						</DropdownMenuItem>
						{/* Select/Deselect this page */}
						<DropdownMenuItem
							onClick={() => handleSelectAllOnPage(!allSelectedOnPage)}
							className="p-3">
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
					onCheckedChange={() => handleRowSelect(String(order.orderId))}
				/>
			),
		},
	};

	// Build columns with Handling pinned to the end (if enabled)
	const activeColumns = useMemo(() => {
		const nonHandling = selectedColumns.filter((n) => n !== "Handling");
		const cols: Column<HoseOrder>[] = nonHandling
			.map((n) => allColumns[n])
			.filter(Boolean) as Column<HoseOrder>[];

		if (selectedColumns.includes("Handling")) {
			cols.push(allColumns["Handling"]); // always last
		}
		return cols;
	}, [selectedColumns, selectedRows]); // include selectedRows so checkbox state updates

	const handleColumnChange = (value: string): void => {
		setSelectedColumns((prev) =>
			prev.includes(value)
				? prev.filter((col) => col !== value)
				: [...prev, value],
		);
	};

	const handleFilterChange = (value: string): void => {
		setSelectedFilters((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);
	};

	const handleUpdateWarehouseForAllItems = async (warehouseNumber: string) => {
		try {
			console.log("Update warehouse for all items to:", warehouseNumber);
		} catch (e) {
			toast.error("Cart.warehouseUpdateError");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-6">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Slanger og utstyr</h1>
				</div>
				<div className="flex w-[240px] items-center gap-2">
					<p className="text-base font-normal text-[#5A615D]">Lokasjon:</p>
					<Select onValueChange={handleUpdateWarehouseForAllItems}>
						<SelectTrigger className="w-[170px] border-[#C1C4C2] bg-white font-medium text-[#0F1912]">
							<SelectValue placeholder="Lokasjon" />
						</SelectTrigger>
						<SelectContent>
							{warehouses.map((warehouse: { id: string; name: string }) => (
								<SelectItem
									key={warehouse.id}
									value={warehouse.id}>
									{warehouse.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="flex items-start justify-between space-y-6 p-6">
					<div className="relative flex w-full max-w-[480px]">
						<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
						<Input
							placeholder="Søk etter ID nummer, ordrenummer, fartøy eller utstyr..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-12 text-base text-[#5A615D]"
						/>
						<Button
							type="button"
							className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
							Søk
						</Button>
					</div>

					<div className="flex items-center space-x-4">
						{/* Add column */}
						<div className="flex items-center">
							<DropdownMenu>
								<DropdownMenuTrigger className="flex w-[200px] items-center justify-between rounded-md border border-[#C1C4C2] bg-white px-3 py-2 text-[#5A615D]">
									<div className="flex items-center gap-2">
										<PlusIcon size={16} />
										<span>Legg til kolonne</span>
									</div>
									<ChevronDown
										size={16}
										className="text-[#5A615D]"
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-[300px] rounded-2xl bg-white p-4 shadow-lg">
									<div className="space-y-2">
										{columnOptions.map((option) => (
											<DropdownMenuItem
												key={option}
												onSelect={(e) => {
													e.preventDefault();
													handleColumnChange(option);
												}}
												className="rounded-md p-0 focus:bg-gray-50">
												<div className="flex items-center space-x-2">
													<Checkbox
														checked={selectedColumns.includes(option)}
													/>
													<span className="text-gray-700">{option}</span>
												</div>
											</DropdownMenuItem>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Filter */}
						<div className="flex items-center">
							<div className="relative w-[160px]">
								<DropdownMenu>
									<DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border border-[#C1C4C2] bg-white px-3 py-2 text-[#5A615D]">
										<div className="flex items-center gap-2">
											<Funnel
												size={16}
												className="text-[#005522]"
											/>
											<span>Filter</span>
										</div>
										<ChevronDown
											size={16}
											className="text-[#5A615D]"
										/>
									</DropdownMenuTrigger>

									<DropdownMenuContent className="w-[300px] rounded-2xl bg-white p-4 shadow-lg">
										<div className="space-y-5 text-sm">
											{/* Inspeksjon */}
											<div>
												<h4 className="mb-2 font-semibold text-[#0F1912]">
													Inspeksjon
												</h4>
												<div className="space-y-2">
													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("underkjente");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes(
																	"underkjente",
																)}
															/>
															<span>Underkjente inspeksjoner</span>
														</div>
													</DropdownMenuItem>

													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("med_merknader");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes(
																	"med_merknader",
																)}
															/>
															<span>Med merknader</span>
														</div>
													</DropdownMenuItem>

													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("forfalt");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes("forfalt")}
															/>
															<span>Forfalt</span>
														</div>
													</DropdownMenuItem>
												</div>
											</div>

											{/* Slangebytte */}
											<div>
												<h4 className="mb-2 font-semibold text-[#0F1912]">
													Slangebytte
												</h4>
												<div className="space-y-2">
													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("aktive_midlertidige");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes(
																	"aktive_midlertidige",
																)}
															/>
															<span>Aktive midlertidige slangebytter</span>
														</div>
													</DropdownMenuItem>

													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("forfaller_6m");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes(
																	"forfaller_6m",
																)}
															/>
															<span>Forfaller om mindre enn 6 måneder</span>
														</div>
													</DropdownMenuItem>
												</div>
											</div>

											{/* Etter alder */}
											<div>
												<h4 className="mb-2 font-semibold text-[#0F1912]">
													Etter alder
												</h4>
												<div className="space-y-2">
													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("age_5_6");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes("age_5_6")}
															/>
															<span>Slanger 5–6 år gamle</span>
														</div>
													</DropdownMenuItem>

													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("age_7_8");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes("age_7_8")}
															/>
															<span>Slanger 7–8 år gamle</span>
														</div>
													</DropdownMenuItem>

													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("age_8_10");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes("age_8_10")}
															/>
															<span>Slanger 8–10 år gamle</span>
														</div>
													</DropdownMenuItem>

													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("age_over_10");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes(
																	"age_over_10",
																)}
															/>
															<span>Slanger eldre enn 10 år</span>
														</div>
													</DropdownMenuItem>
												</div>
											</div>

											{/* Nødslanger */}
											<div>
												<h4 className="mb-2 font-semibold text-[#0F1912]">
													Nødslanger
												</h4>
												<div className="space-y-2">
													<DropdownMenuItem
														className="rounded-md p-0 focus:bg-gray-50"
														onSelect={(e) => {
															e.preventDefault();
															handleFilterChange("nodslanger");
														}}>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={selectedFilters.includes("nodslanger")}
															/>
															<span>Nødslanger</span>
														</div>
													</DropdownMenuItem>
												</div>
											</div>
										</div>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				</div>

				<DataTable<HoseOrder>
					data={transformedAssets}
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
	);
}
