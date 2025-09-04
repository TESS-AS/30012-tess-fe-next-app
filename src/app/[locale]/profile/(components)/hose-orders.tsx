"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
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
import { useGetWarehouses } from "@/hooks/useGetWarehouse";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import {
	Funnel,
	MoreVertical,
	Paperclip,
	PlusIcon,
	Search,
	ShoppingCart,
	FileText,
	Printer,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

interface Column<T> {
	key: string;
	header: string | (() => React.ReactElement);
	cell: (row: T) => React.ReactElement;
	sortable?: boolean;
}

interface HoseOrder {
	id: string;
	orderId: string; // Required by DataTable
	kunde_id: string;
	beskrivelse: string;
	s1_anlegg: string;
	s2_utstyr: string;
	ordrenr: string;
	status: string;
	warehouse?: string;
	assetId?: number;
	dato?: string;
}

interface HoseOrdersProps {
	onOrderClick?: (orderId: string) => void;
}

export function HoseOrders({ onOrderClick }: HoseOrdersProps) {
	const { data: profile } = usePunchoutProfile();
	const { assets, pagination, loading, fetchAssets } = useGetAssets(
		profile?.customerNumbers[3],
	);
	const { warehouses } = useGetWarehouses(true);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("Alle");
	const [column, setColumn] = useState("Alle");
	const [filter, setFilter] = useState("");
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const ITEMS_PER_PAGE = 10;

	const handleRowSelect = (orderId: string) => {
		setSelectedRows((prev) =>
			prev.includes(orderId)
				? prev.filter((id) => id !== orderId)
				: [...prev, orderId],
		);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedRows(transformedAssets.map((asset) => asset.orderId));
		} else {
			setSelectedRows([]);
		}
	};

	const handleBulkAction = (action: string) => {
		switch (action) {
			case "cart":
				toast.info(`Adding ${selectedRows.length} items to cart`);
				break;
			case "support":
				toast.info("Contacting TESS support");
				break;
			case "report":
				toast.info("Generating report");
				break;
			case "print":
				toast.info("Preparing to print");
				break;
			default:
				break;
		}
	};

	const handlePageChange = (page: number) => {
		fetchAssets(page, ITEMS_PER_PAGE);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Transform assets to match HoseOrder type
	const transformedAssets = assets.map((asset) => ({
		id: asset.hoseHeader.hoseLineId.toString(),
		orderId: asset.hoseHeader.extDocSequenceId,
		kunde_id: asset.hoseHeader.customerNumber,
		beskrivelse: asset.hoseLine.itemDescription,
		status: asset.hoseLine.currentStatus,
		dato: asset.hoseHeader.requestDate,
		warehouse: asset.hoseHeader.department,
		assetId: asset.hoseHeader.assetId,
		s1_anlegg: asset.hoseLine.s1.s1Name,
		s2_utstyr: asset.hoseLine.s2.s2Name,
		ordrenr: asset.hoseHeader.tessOrderNumber,
	}));

	const statuses = ["Alle", "Underkjente inspeksjoner", "Filter 2", "Filter 3"];

	const columns: Column<HoseOrder>[] = [
		{
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
		{
			key: "id",
			header: "ID",
			cell: (order: HoseOrder) => <span>{order.id}</span>,
			sortable: true,
		},
		{
			key: "kunde_id",
			header: "KUNDE-ID",
			cell: (order: HoseOrder) => <span>{order.kunde_id}</span>,
			sortable: true,
		},
		{
			key: "beskrivelse",
			header: "BESKRIVELSE",
			cell: (order: HoseOrder) => <span>{order.beskrivelse}</span>,
			sortable: true,
		},
		{
			key: "s1_anlegg",
			header: "S1 ANLEGG, FARTØY, ENHET",
			cell: (order: HoseOrder) => <span>{order.s1_anlegg}</span>,
			sortable: true,
		},
		{
			key: "s2_utstyr",
			header: "S2 UTSTYR",
			cell: (order: HoseOrder) => <span>{order.s2_utstyr}</span>,
			sortable: true,
		},
		{
			key: "ordrenr",
			header: "ORDRENR (PO)",
			cell: (order: HoseOrder) => <span>{order.ordrenr}</span>,
			sortable: true,
		},
		{
			key: "select",
			header: () => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex cursor-pointer items-center gap-2">
							<Checkbox
								checked={selectedRows.length === transformedAssets.length}
								onCheckedChange={(checked) =>
									handleSelectAll(checked as boolean)
								}
							/>
							{selectedRows.length > 0 && <MoreVertical className="h-4 w-4" />}
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-[200px]">
						<DropdownMenuItem onClick={() => handleBulkAction("cart")}>
							<ShoppingCart className="mr-2 h-4 w-4" />
							Legg til handlekurv
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleBulkAction("support")}>
							<FileText className="mr-2 h-4 w-4" />
							Kontakt TESS support
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleBulkAction("report")}>
							<FileText className="mr-2 h-4 w-4" />
							Rapporter slangebytter
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleBulkAction("print")}>
							<Printer className="mr-2 h-4 w-4" />
							Skriv ut TESS trykktest-sertifikat
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			cell: (order: HoseOrder) => (
				<Checkbox
					checked={selectedRows.includes(order.orderId)}
					onCheckedChange={() => handleRowSelect(order.orderId)}
				/>
			),
		},
	];

	const handleColumnChange = (value: string) => {
		setColumn(value);
	};

	const handleFilterChange = (value: string) => {
		setFilter(value);
	};

	const updateWarehouseForAllItems = async (warehouseNumber: string) => {
		try {
			await updateWarehouseForAllItems(warehouseNumber);
		} catch {
			toast.error("Cart.warehouseUpdateError");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-6">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Slanger og utstyr</h1>
				</div>
				<div className="flex w-[200px] items-center gap-2">
					<p className="text-base font-normal text-[#5A615D]">Lokasjon:</p>
					<Select onValueChange={updateWarehouseForAllItems}>
						<SelectTrigger className="w-[100%] w-[170px] border-[#C1C4C2] bg-white font-medium text-[#0F1912]">
							<SelectValue placeholder="Lokasjon" />
						</SelectTrigger>
						<SelectContent>
							{warehouses.map((warehouse) => (
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
							type="submit"
							className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
							Søk
						</Button>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex w-[70%] items-center">
							<Select onValueChange={handleColumnChange}>
								<SelectTrigger className="w-[40%] w-[170px] border-[#C1C4C2] bg-white text-[#5A615D]">
									<PlusIcon size={16} />{" "}
									<SelectValue placeholder="Legg til kolonne" />
								</SelectTrigger>
								<SelectContent>
									{statuses.map((status) => (
										<SelectItem
											key={status}
											value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex w-[70%] items-center">
							<Select onValueChange={handleFilterChange}>
								<SelectTrigger className="w-[40%] w-[140px] border-[#C1C4C2] bg-white text-[#5A615D]">
									<Funnel size={16} /> <SelectValue placeholder={"Filter"} />
								</SelectTrigger>
								<SelectContent>
									{statuses.map((filter) => (
										<SelectItem
											key={filter}
											value={filter}>
											{filter}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<DataTable
					data={transformedAssets}
					columns={columns}
					currentPage={pagination.currentPage}
					totalPages={pagination.totalPages}
					totalItems={pagination.totalItems}
					itemsPerPage={pagination.pageSize}
					onPageChange={handlePageChange}
					isLoading={loading}
				/>
			</div>
		</div>
	);
}
