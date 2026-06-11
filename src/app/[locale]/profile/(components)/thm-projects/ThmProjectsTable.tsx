"use client";

import { useMemo } from "react";

import { type Column, DataTable } from "@/components/ui/data-table";
import { useRouter } from "@/i18n/navigation";
import { recordVisit } from "@/lib/thm-recently-visited-storage";
import type { ThmWorkOrder } from "@/types/thm-projects.types";
import { ChartNoAxesCombined, List } from "lucide-react";

// DataTable's generic requires `orderId: string` so it can wire row-level
// callbacks. We don't add this to the domain type — we just project it on
// the way in.
type ThmWorkOrderRow = ThmWorkOrder & { orderId: string };

function StatusBadge({ status }: { status: ThmWorkOrder["status"] }) {
	const tone =
		status === "Active"
			? "bg-[#DCF7E0] text-[#1C6D2C]"
			: status === "Completed"
				? "bg-gray-100 text-gray-700"
				: status === "On hold"
					? "bg-yellow-50 text-yellow-800"
					: "bg-red-50 text-red-700";
	return (
		<span
			className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
			{status || "—"}
		</span>
	);
}

interface ThmProjectsTableProps {
	rows: ThmWorkOrder[];
	loading: boolean;
	emptyMessage?: React.ReactNode;
	onOpenWorkOrder?: (workOrder: ThmWorkOrder, view: "list" | "dashboard") => void;
	currentPage?: number;
	totalPages?: number;
	totalItems?: number;
	itemsPerPage?: number;
	onPageChange?: (page: number) => void;
}

export function ThmProjectsTable({
	rows,
	loading,
	emptyMessage = "Ingen prosjekter funnet.",
	onOpenWorkOrder,
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
}: ThmProjectsTableProps) {
	const router = useRouter();

	const data = useMemo<ThmWorkOrderRow[]>(
		() => rows.map((r) => ({ ...r, orderId: r.workOrderNumber })),
		[rows],
	);

	const handleOpen = (wo: ThmWorkOrder, view: "list" | "dashboard") => {
		recordVisit(wo);
		if (view === "dashboard") {
			router.push(
				`/profile?tab=thm-dashboard&workOrder=${encodeURIComponent(wo.workOrderNumber)}`,
			);
		}
		onOpenWorkOrder?.(wo, view);
	};

	const columns: Column<ThmWorkOrderRow>[] = [
		{
			key: "workOrderNumber",
			header: "Work Order",
			cell: (row) => row.workOrderNumber,
		},
		{
			key: "listView",
			header: "",
			cell: (row) => (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						handleOpen(row, "list");
					}}
					aria-label={`Open list view for ${row.workOrderNumber}`}
					className="rounded p-1 text-[#1C6D2C] hover:bg-[#DCF7E0]">
					<List className="h-4 w-4" />
				</button>
			),
		},
		{
			key: "dashboard",
			header: "",
			cell: (row) => (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						handleOpen(row, "dashboard");
					}}
					aria-label={`Open dashboard for ${row.workOrderNumber}`}
					className="rounded p-1 text-[#1C6D2C] hover:bg-[#DCF7E0]">
					<ChartNoAxesCombined className="h-4 w-4" />
				</button>
			),
		},
		{
			key: "description",
			header: "Description",
			cell: (row) => row.description || "—",
		},
		{
			key: "customerNumber",
			header: "Customer no.",
			cell: (row) => row.customerNumber || "—",
		},
		{
			key: "customerName",
			header: "Customer",
			cell: (row) => row.customerName || "—",
		},
		{
			key: "s1PlantVesselUnit",
			header: "S1 Plant, Vessel, Unit",
			cell: (row) => row.s1PlantVesselUnit || "—",
		},
		{
			key: "dateCreated",
			header: "Date created",
			cell: (row) => row.dateCreated || "—",
		},
		{
			key: "numberOfIds",
			header: "No of IDs",
			cell: (row) => row.numberOfIds.toLocaleString(),
		},
		{
			key: "createdBy",
			header: "Created by",
			cell: (row) => row.createdBy || "—",
		},
		{
			key: "assignedTo",
			header: "Assigned to",
			cell: (row) => row.assignedTo || "—",
		},
		{
			key: "status",
			header: "Status",
			cell: (row) => <StatusBadge status={row.status} />,
		},
	];

	const effectiveTotal = totalItems ?? data.length;
	const effectivePerPage = itemsPerPage ?? Math.max(data.length, 1);
	const effectiveCurrentPage = currentPage ?? 1;
	const effectiveTotalPages = totalPages ?? 1;

	return (
		<DataTable<ThmWorkOrderRow>
			data={data}
			columns={columns}
			isLoading={loading}
			emptyMessage={emptyMessage}
			currentPage={effectiveCurrentPage}
			totalPages={effectiveTotalPages}
			totalItems={effectiveTotal}
			itemsPerPage={effectivePerPage}
			onPageChange={onPageChange}
			noWrap
		/>
	);
}
