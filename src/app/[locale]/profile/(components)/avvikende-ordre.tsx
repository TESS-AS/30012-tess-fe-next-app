"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGetOpenConfirmations } from "@/hooks/useGetOpenConfirmations";
import { cn } from "@/lib/utils";
import { OpenOrderConfirmation } from "@/types/orders.types";
import { Check, X } from "lucide-react";
import { Search } from "lucide-react";

export function AvvikendeOrdre({
	onOrderClick,
}: {
	onOrderClick?: (orderId: string) => void;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
		null,
	);
	const ITEMS_PER_PAGE = 10;

	const { data: orders, isLoading } = useGetOpenConfirmations();

	const statuses = ["Alle", "Venter godkjenning", "Godkjent", "Avvist"];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Venter godkjenning":
				return "bg-[#FDF6B2] text-[#723B13]";
			case "Godkjent":
				return "bg-[#009640] text-white";
			case "Avvist":
				return "bg-[#FDE8E8] text-[#9B1C1C]";
			default:
				return "bg-gray-100 text-gray-600";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "Godkjent":
				return <Check className="h-3 w-3" />;
			case "Avvist":
				return <X className="h-3 w-3" />;
			default:
				return null;
		}
	};

	// Handle sorting
	const handleSort = (columnKey: string) => {
		if (sortColumn === columnKey) {
			// Toggle direction: asc -> desc -> null
			if (sortDirection === "asc") {
				setSortDirection("desc");
			} else if (sortDirection === "desc") {
				setSortColumn(null);
				setSortDirection(null);
			}
		} else {
			setSortColumn(columnKey);
			setSortDirection("asc");
		}
		setCurrentPage(1); // Reset to first page when sorting
	};

	// Filter orders based on search and status
	const filteredOrders = (orders || []).filter((order: OpenOrderConfirmation) => {
		const matchesSearch =
			!searchQuery ||
			order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
			order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			selectedStatus === "Alle" || order.status === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	// Sort filtered orders
	const sortedOrders = [...filteredOrders].sort((a, b) => {
		if (!sortColumn || !sortDirection) return 0;

		let aValue: string | number;
		let bValue: string | number;

		switch (sortColumn) {
			case "orderId":
				// Extract numeric part for proper numeric sorting
				aValue = parseInt(a.orderId.replace(/\D/g, "")) || 0;
				bValue = parseInt(b.orderId.replace(/\D/g, "")) || 0;
				break;
			case "supplier":
				aValue = a.supplier.toLowerCase();
				bValue = b.supplier.toLowerCase();
				break;
			case "date":
				// Parse date string (DD.MM.YYYY, HH:mm format)
				const parseDate = (dateStr: string) => {
					const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2})/);
					if (match) {
						const [, day, month, year, hour, minute] = match;
						return new Date(
							parseInt(year),
							parseInt(month) - 1,
							parseInt(day),
							parseInt(hour),
							parseInt(minute),
						).getTime();
					}
					return 0;
				};
				aValue = parseDate(a.date);
				bValue = parseDate(b.date);
				break;
			case "deviation":
				aValue = a.deviation;
				bValue = b.deviation;
				break;
			case "status":
				// Sort by status priority: Venter godkjenning < Avvist < Godkjent
				const statusPriority: Record<string, number> = {
					"Venter godkjenning": 1,
					Avvist: 2,
					Godkjent: 3,
				};
				aValue = statusPriority[a.status] || 0;
				bValue = statusPriority[b.status] || 0;
				break;
			case "handled":
				aValue = a.handled || "";
				bValue = b.handled || "";
				break;
			default:
				return 0;
		}

		if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
		if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	// Calculate counts for each status (based on all orders, not filtered)
	const statusCounts = {
		Alle: orders?.length || 0,
		"Venter godkjenning":
			orders?.filter((o) => o.status === "Venter godkjenning").length || 0,
		Godkjent: orders?.filter((o) => o.status === "Godkjent").length || 0,
		Avvist: orders?.filter((o) => o.status === "Avvist").length || 0,
	};

	// Pagination
	const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedOrders = sortedOrders.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE,
	);

	const columns = [
		{
			key: "orderId",
			header: "ORDRE-ID",
			cell: (order: OpenOrderConfirmation) => (
				<span className="">#{order.orderId}</span>
			),
			sortable: true,
		},
		{
			key: "supplier",
			header: "LEVERANDØR",
			cell: (order: OpenOrderConfirmation) => <span>{order.supplier}</span>,
			sortable: true,
		},
		{
			key: "date",
			header: "DATO",
			cell: (order: OpenOrderConfirmation) => <span>{order.date}</span>,
			sortable: true,
		},
		{
			key: "deviation",
			header: "AVVIK",
			cell: (order: OpenOrderConfirmation) => (
				<span>{order.deviation} avvik</span>
			),
			sortable: true,
		},
		{
			key: "status",
			header: "STATUS",
			cell: (order: OpenOrderConfirmation) => (
				<span
					className={cn(
						"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
						getStatusColor(order.status),
					)}>
					{getStatusIcon(order.status)}
					{order.status}
				</span>
			),
			sortable: true,
		},
		{
			key: "handled",
			header: "BEHANDLET",
			cell: (order: OpenOrderConfirmation) => (
				<span>{order.handled || "-"}</span>
			),
			sortable: true,
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-baseline justify-between">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Avvikende ordre</h1>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="space-y-6 p-6">
					<div className="relative flex w-full max-w-[480px]">
						<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
						<Input
							placeholder="Søk på ordrenummer, leverandør eller vare..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-12 text-base text-[#5A615D]"
						/>
						<Button
							type="button"
							onClick={() => {
								/* optional manual trigger; filtering is instant */
							}}
							className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
							Søk
						</Button>
					</div>

					<div className="flex items-center gap-3 border-t border-[#C1C4C2] pt-6">
						<p className="text-sm font-bold text-[#0F1912]">Status:</p>
						<RadioGroup
							value={selectedStatus}
							onValueChange={setSelectedStatus}
							className="flex flex-wrap gap-3">
							{statuses.map((status) => (
								<div
									key={status}
									className="flex items-center space-x-2">
									<RadioGroupItem
										value={status}
										id={status}
										className={cn(
											"h-5 w-5 cursor-pointer",
											selectedStatus === status
												? "border-[#1C6D2C] text-[#1C6D2C]"
												: "border-[#C1C4C2]",
										)}
									/>
									<Label
										htmlFor={status}
										className="cursor-pointer text-sm font-medium text-[#0F1912]">
										{status} ({statusCounts[status as keyof typeof statusCounts]})
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				</div>
				<DataTable
					data={paginatedOrders}
					columns={columns}
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={sortedOrders.length}
					itemsPerPage={ITEMS_PER_PAGE}
					onPageChange={(page) => {
						setCurrentPage(page);
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
					isLoading={isLoading}
					onOrderClick={onOrderClick}
					sortColumn={sortColumn}
					sortDirection={sortDirection}
					onSort={handleSort}
				/>
			</div>
		</div>
	);
}
