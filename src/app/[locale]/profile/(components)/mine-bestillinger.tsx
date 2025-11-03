"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserOrders } from "@/hooks/useUserOrders";
import { cn, formatDate } from "@/lib/utils";
import { UserOrderResponse } from "@/types/orders.types";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { Search } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Order = UserOrderResponse & {
	orderId: string;
};

interface MineBestillingerProps {
	onOrderClick: (orderId: string) => void;
}

export const getStatusIcons = (status: string) => {
	switch (status) {
		case "Mottatt": // Written
			return (
				<Image
					src="/icons/profile/table/like.svg"
					alt="Like"
					width={12}
					height={12}
				/>
			);
		case "Bekreftet": // Confirmed
			return (
				<Image
					src="/icons/profile/table/tick.svg"
					alt="Tick"
					width={12}
					height={12}
				/>
			);
		case "Plukket": // Picked
			return (
				<Image
					src="/icons/profile/table/tick.svg"
					alt="Tick"
					width={12}
					height={12}
				/>
			);
		case "Under transport": // Shipped
			return (
				<Image
					src="/icons/profile/table/truck.svg"
					alt="Truck"
					width={12}
					height={12}
				/>
			);
		case "Levert": // Invoiced
			return (
				<Image
					src="/icons/profile/table/tick.svg"
					alt="Tick"
					width={12}
					height={12}
					className="[filter:brightness(0)_invert(1)]"
				/>
			);
		case "Kansellert": // Something Wrong
			return (
				<Image
					src="/icons/profile/table/x.svg"
					alt="X"
					width={12}
					height={12}
				/>
			);
		default:
			return null;
	}
};
export function MineBestillinger({ onOrderClick }: MineBestillingerProps) {
	const t = useTranslations("MineBestillinger");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>(t("all"));
	const [currentPage, setCurrentPage] = useState(1);

	const ITEMS_PER_PAGE = 10;

	const { orders, isLoading } = useUserOrders(currentPage, ITEMS_PER_PAGE);

	// Client-side filtering and mapping
	const filteredOrders = orders
		.filter((order) => {
			const matchesSearch = searchQuery
				? order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
				: true;
			const matchesStatus =
				selectedStatus === t("all") || order.status === selectedStatus;
			return matchesSearch && matchesStatus;
		})
		.map((order) => ({
			...order,
			orderId: order.order_id.toString(),
		}));

	const statuses = [
		t("all"),
		t("received"),
		t("confirmed"),
		t("picked"),
		t("inTransit"),
		t("delivered"),
		t("cancelled"),
	];

	const getStatusNumber = (status: string): number | undefined => {
		switch (status) {
			case "Mottatt":
				return 10; // Written
			case "Bekreftet":
				return 20; // Confirmed
			case "Plukket":
				return 30; // Picked
			case "Under transport":
				return 45; // Shipped
			case "Levert":
				return 60; // Invoiced
			case "Kansellert":
				return 0; // Something Wrong
			default:
				return undefined;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Mottatt": // Written
				return "bg-[#DCF7E0] text-[#005522]";
			case "Bekreftet": // Confirmed
				return "bg-[#DCF7E0] text-[#005522]";
			case "Plukket": // Picked
				return "bg-[#E5EDFF] text-[#42389D]";
			case "Under transport": // Shipped
				return "bg-[#FDF6B2] text-[#723B13]";
			case "Levert": // Invoiced
				return "bg-[#009640] text-white";
			case "Kansellert": // Something Wrong
				return "bg-[#FDE8E8] text-[#9B1C1C]";
			default:
				return "bg-gray-100 text-gray-600";
		}
	};

	const columns = [
		{
			key: "id",
			header: t("orderNumber").toUpperCase(),
			cell: (order: Order) => <span className="">#{order.orderNumber}</span>,
			sortable: true,
		},
		{
			key: "date",
			header: t("orderDate").toUpperCase(),
			cell: (order: Order) => {
				const dateTime = `${order.requestDate}T${order.requestTime}`;
				const date = new Date(dateTime);
				const formattedDate = date.toLocaleDateString("no-NO", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				});
				const formattedTime = date.toLocaleTimeString("no-NO", {
					hour: "2-digit",
					minute: "2-digit",
				});
				return (
					<span>
						{formattedDate} {formattedTime}
					</span>
				);
			},
			sortable: true,
		},
		{
			key: "total",
			header: t("price").toUpperCase(),
			cell: (order: Order) =>
				formatNorwegianCurrency(order.totalOrderPrice ?? 0),
			sortable: true,
		},
		{
			key: "status",
			header: t("status").toUpperCase(),
			cell: (order: Order) => (
				<span
					className={cn(
						"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
						getStatusColor(order.status),
					)}>
					{getStatusIcons(order.status)}
					{order.status}
				</span>
			),
			sortable: true,
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-baseline justify-between">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">{t("title")}</h1>
					<p className="ml-4 text-[#5A615D]">{t("subtitle")}</p>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="space-y-6 p-6">
					<div className="relative flex w-full max-w-[480px]">
						<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
						<Input
							placeholder={t("searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-12 text-base text-[#5A615D]"
						/>
						<Button
							type="submit"
							className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
							{t("search")}
						</Button>
					</div>
					<div className="flex items-center gap-3 border-t border-[#C1C4C2] pt-6">
						<p className="text-sm font-bold text-[#0F1912]">{t("status")}:</p>
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
										className={cn("text-sm font-medium text-[#0F1912]")}>
										{status}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				</div>

				<div className="">
					<DataTable
						data={filteredOrders}
						columns={columns}
						currentPage={currentPage}
						totalPages={Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
						totalItems={filteredOrders.length}
						itemsPerPage={ITEMS_PER_PAGE}
						onPageChange={(page) => {
							setCurrentPage(page);
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
						isLoading={isLoading}
						isDropdownColumn
						onOrderClick={onOrderClick}
					/>
				</div>
			</div>
		</div>
	);
}
