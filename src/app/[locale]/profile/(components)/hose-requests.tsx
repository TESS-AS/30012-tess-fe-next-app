"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { CircleX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { getStatusIcons } from "./mine-bestillinger";

const HoseRequests = () => {
	const t = useTranslations("HoseRequests");
	const router = useRouter();
	const pathname = usePathname();
	const [view, setView] = React.useState<"empty" | "list">("empty");

	const goToEquipmentList = () => {
		// For this flow, switch to the RFQ list view instead of routing away
		setView("list");
	};

	return (
		<div className="space-y-6">
			<div className="flex items-baseline gap-3">
				<h1 className="text-2xl font-semibold text-[#0F1912]">{t("title")}</h1>
				<p className="text-sm text-[#5A615D]">{t("subtitle")}</p>
			</div>

			{view === "empty" ? (
				<div className="rounded-lg border border-[#C1C4C2] bg-white shadow-xs">
					<div className="m-6 rounded-md bg-[#F3FAF7] p-4">
						<p className="mb-2 font-bold text-[#005522]">
							{t("emptyState.title")}
						</p>
						<div className="text-sm leading-relaxed text-[#005522]">
							<p>{t("emptyState.instruction1")}</p>
							<p>{t("emptyState.instruction2")}</p>
							<p>{t("emptyState.instruction3")}</p>
						</div>

						<div className="pt-4">
							<Button
								type="button"
								variant="default"
								className="px-4"
								onClick={goToEquipmentList}>
								{t("emptyState.goToEquipmentList")}
							</Button>
						</div>
					</div>
				</div>
			) : (
				<RFQListView />
			)}
		</div>
	);
};

export default HoseRequests;

function RFQListView() {
	const t = useTranslations("HoseRequests");
	// Mock data to illustrate the UI per the provided design
	type RFQItem = {
		hexagonId?: string;
		orderId: string;
		requestType: string;
		createdDate: string;
		statusLabel: string;
		rowTint?: boolean;
	};

	const rfqs: RFQItem[] = [
		{
			orderId: "2211879",
			requestType: "m/trykktest og sertifikat",
			createdDate: "09 Mar 2025",
			statusLabel: "Forespørsel sendt",
			rowTint: true,
		},
		{
			orderId: "2211879",
			requestType: "u/trykktest og sertifikat",
			createdDate: "09 Mar 2025",
			statusLabel: "Bestilt",
		},
		{
			orderId: "2211879",
			requestType: "Uspesifisert",
			createdDate: "09 Mar 2025",
			statusLabel: "Fullført RFQ",
		},
		{
			orderId: "2211879",
			requestType: "Uspesifisert",
			createdDate: "09 Mar 2025",
			statusLabel: "Kansellert",
		},
		{
			orderId: "2211879",
			requestType: "Uspesifisert",
			createdDate: "09 Mar 2025",
			statusLabel: "Kansellert",
		},
	];
	type EquipmentItem = { id: string; desc: string };
	const equipment: EquipmentItem[] = [
		{
			id: "2211879",
			desc: "HOSE EC881-08 - (1/2) 55220PSI SISTEMA CO2 X 700 mm",
		},
		{
			id: "2211879",
			desc: "HOSE EC881-08 - (1/2) 55220PSI SISTEMA CO2 X 700 mm",
		},
	];
	const [page, setPage] = React.useState(1);
	const totalItems = 1000;
	const itemsPerPage = 10;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const statusBadgeClass = (label: string) => {
		if (label === "Forespørsel sendt") return "bg-[#E8EAFD] text-[#3F51B5]";
		if (label === "Bestilt") return "bg-[#FFF7E6] text-[#AD6800]";
		if (label === "Fullført RFQ") return "bg-[#E6F7E9] text-[#237A3B]";
		if (label === "Kansellert") return "bg-[#FFEFEF] text-[#B42318]";
		return "bg-[#F3F4F6] text-[#374151]";
	};

	// Map our RFQ status to an existing icon from getStatusIcons for visual consistency
	const mapStatusForIcon = (label: string) => {
		switch (label) {
			case "Forespørsel sendt":
				return "Mottatt";
			case "Bestilt":
				return "Bekreftet";
			case "Fullført RFQ":
				return "Levert";
			case "Kansellert":
				return "Kansellert";
			default:
				return label;
		}
	};

	const columns: Column<RFQItem>[] = [
		{
			key: "orderId",
			header: t("columns.rfqNumber"),
			cell: (item) => <span className="text-[#0F1912]">{item.orderId}</span>,
			sortable: true,
		},
		{
			key: "requestType",
			header: t("columns.requestType"),
			cell: (item) => (
				<span className="text-[#0F1912]">{item.requestType}</span>
			),
			sortable: true,
		},
		{
			key: "createdDate",
			header: t("columns.created"),
			cell: (item) => (
				<span className="text-[#0F1912]">{item.createdDate}</span>
			),
			sortable: true,
		},
		{
			key: "status",
			header: t("columns.status"),
			cell: (item) => (
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
							statusBadgeClass(item.statusLabel),
						)}>
						{getStatusIcons(mapStatusForIcon(item.statusLabel))}
						{item.statusLabel}
					</span>
				</div>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				{/* Left: RFQ table */}
				<div className="lg:col-span-8">
					<h3 className="mb-2 text-base font-semibold text-[#0F1912]">
						{t("rfqListTitle")}
					</h3>
					<div className="overflow-hidden rounded-lg border border-[#C1C4C2] bg-white">
						<DataTable<RFQItem>
							data={rfqs}
							columns={columns}
							currentPage={page}
							totalPages={totalPages}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							onPageChange={(p) => setPage(p)}
							isLoading={false}
							className=""
						/>
					</div>
				</div>

				{/* Right: Equipment list for selected RFQ */}
				<div className="lg:col-span-4">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-base font-bold text-[#0F1912]">
							{t("equipmentOnRfq")}
						</h3>
						<Button
							variant="outline"
							size="sm"
							className="border-[#B42318] text-[#434B46] hover:bg-[#FFF1F1]">
							<CircleX /> {t("cancelRequest")}
						</Button>
					</div>
					<div className="rounded-lg border border-[#C1C4C2] bg-white">
						<table className="w-full text-sm">
							<thead className="bg-[#F8F9F8] text-left text-[#5A615D]">
								<tr>
									<th className="px-4 py-2">{t("equipmentTable.equipment")}</th>
									<th className="px-4 py-2">
										{t("equipmentTable.description")}
									</th>
								</tr>
							</thead>
							<tbody>
								{equipment.map((item: EquipmentItem, idx: number) => (
									<tr
										key={idx}
										className="border-t border-[#E5E7EB]">
										<td className="px-4 py-3 text-[#0F1912] text-green-700">
											{item.id}
										</td>
										<td className="px-4 py-3 text-[#0F1912]">{item.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
						<div className="border-t border-[#E5E7EB] p-3 text-sm text-[#5A615D]">
							{t("equipmentTable.showing")}{" "}
							<span className="font-medium">1-10</span> {t("equipmentTable.of")}{" "}
							<span className="font-medium">1000</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
