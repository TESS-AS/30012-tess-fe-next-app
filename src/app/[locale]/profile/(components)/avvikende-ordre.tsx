"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Search } from "lucide-react";

type AvvikendeOrdre = {
	orderId: string;
	supplier: string;
	date: string;
	deviation: number;
	status: "Venter godkjenning" | "Godkjent" | "Avvist";
	handled: string | null;
};

// Mock data
const mockOrders: AvvikendeOrdre[] = [
	{
		orderId: "100296071",
		supplier: "Leverandør 1",
		date: "19.11.2025, 11:33",
		deviation: 8,
		status: "Venter godkjenning",
		handled: null,
	},
	{
		orderId: "100296072",
		supplier: "Leverandør 2",
		date: "19.11.2025, 12:15",
		deviation: 1,
		status: "Venter godkjenning",
		handled: null,
	},
	{
		orderId: "100296073",
		supplier: "Leverandør 3",
		date: "19.11.2025, 13:45",
		deviation: 3,
		status: "Venter godkjenning",
		handled: null,
	},
	{
		orderId: "100296074",
		supplier: "Leverandør 1",
		date: "18.11.2025, 10:20",
		deviation: 2,
		status: "Godkjent",
		handled: "01.01.2026, 12:00",
	},
	{
		orderId: "100296075",
		supplier: "Leverandør 2",
		date: "18.11.2025, 14:30",
		deviation: 5,
		status: "Godkjent",
		handled: "01.01.2026, 12:00",
	},
	{
		orderId: "100296076",
		supplier: "Leverandør 4",
		date: "17.11.2025, 09:15",
		deviation: 1,
		status: "Godkjent",
		handled: "01.01.2026, 12:00",
	},
	{
		orderId: "100296077",
		supplier: "Leverandør 3",
		date: "16.11.2025, 16:45",
		deviation: 4,
		status: "Avvist",
		handled: "01.01.2026, 12:00",
	},
	{
		orderId: "100296078",
		supplier: "Leverandør 1",
		date: "15.11.2025, 11:20",
		deviation: 7,
		status: "Avvist",
		handled: "01.01.2026, 12:00",
	},
	{
		orderId: "100296079",
		supplier: "Leverandør 5",
		date: "14.11.2025, 13:10",
		deviation: 2,
		status: "Avvist",
		handled: "01.01.2026, 12:00",
	},
];

export function AvvikendeOrdre({
	onOrderClick,
}: {
	onOrderClick?: (orderId: string) => void;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 10;

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

	// Filter orders based on search and status
	const filteredOrders = mockOrders.filter((order) => {
		const matchesSearch =
			!searchQuery ||
			order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
			order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			selectedStatus === "Alle" || order.status === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	// Calculate counts for each status (based on all orders, not filtered)
	const statusCounts = {
		Alle: mockOrders.length,
		"Venter godkjenning": mockOrders.filter((o) => o.status === "Venter godkjenning").length,
		Godkjent: mockOrders.filter((o) => o.status === "Godkjent").length,
		Avvist: mockOrders.filter((o) => o.status === "Avvist").length,
	};

	// Pagination
	const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedOrders = filteredOrders.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE,
	);

	const columns = [
		{
			key: "orderId",
			header: "ORDRE-ID",
			cell: (order: AvvikendeOrdre) => (
				<span className="">#{order.orderId}</span>
			),
			sortable: true,
		},
		{
			key: "supplier",
			header: "LEVERANDØR",
			cell: (order: AvvikendeOrdre) => <span>{order.supplier}</span>,
			sortable: true,
		},
		{
			key: "date",
			header: "DATO",
			cell: (order: AvvikendeOrdre) => <span>{order.date}</span>,
			sortable: true,
		},
		{
			key: "deviation",
			header: "AVVIK",
			cell: (order: AvvikendeOrdre) => (
				<span>{order.deviation} avvik</span>
			),
			sortable: true,
		},
		{
			key: "status",
			header: "STATUS",
			cell: (order: AvvikendeOrdre) => (
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
			cell: (order: AvvikendeOrdre) => (
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
											"h-5 w-5",
											selectedStatus === status
												? "border-[#1C6D2C] text-[#1C6D2C]"
												: "border-[#C1C4C2]",
										)}
									/>
									<Label
										htmlFor={status}
										className="text-sm font-medium text-[#0F1912]">
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
					totalItems={filteredOrders.length}
					itemsPerPage={ITEMS_PER_PAGE}
					onPageChange={(page) => {
						setCurrentPage(page);
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
					isLoading={false}
					onOrderClick={onOrderClick}
				/>
			</div>
		</div>
	);
}
