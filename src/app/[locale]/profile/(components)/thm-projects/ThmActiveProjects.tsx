"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useThmActiveProjects } from "@/hooks/useThmActiveProjects";
import { useThmRecentlyVisited } from "@/hooks/useThmRecentlyVisited";
import { Search } from "lucide-react";

import { ThmProjectsTable } from "./ThmProjectsTable";

const ITEMS_PER_PAGE = 25;
const RECENT_PAGE_SIZE_OPTIONS = [3, 5, 10] as const;
const DEFAULT_RECENT_PAGE_SIZE = 3;

// FE column key → BE sort key (case-insensitive on BE).
// Allowed BE sort keys per Albert: workordernumber, description,
// customernumber, customername, s1name, createddate, numberofhoses,
// assignedto, status.
const SORT_KEY_MAP: Record<string, string> = {
	workOrderNumber: "workordernumber",
	description: "description",
	customerNumber: "customernumber",
	customerName: "customername",
	s1PlantVesselUnit: "s1name",
	dateCreated: "createddate",
	numberOfIds: "numberofhoses",
	assignedTo: "assignedto",
	status: "status",
};

export function ThmActiveProjects() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [recentPageSize, setRecentPageSize] = useState<number>(
		DEFAULT_RECENT_PAGE_SIZE,
	);
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
		null,
	);

	const handleSort = (columnKey: string) => {
		if (sortColumn === columnKey) {
			if (sortDirection === "asc") {
				setSortDirection("desc");
			} else if (sortDirection === "desc") {
				setSortColumn(null);
				setSortDirection(null);
			} else {
				setSortDirection("asc");
			}
		} else {
			setSortColumn(columnKey);
			setSortDirection("asc");
		}
		setPage(1);
	};

	const recentlyVisitedQuery = useThmRecentlyVisited();
	const activeProjectsQuery = useThmActiveProjects({
		page,
		pageSize: ITEMS_PER_PAGE,
		search,
		sort:
			sortColumn && SORT_KEY_MAP[sortColumn]
				? SORT_KEY_MAP[sortColumn]
				: undefined,
		sortDir:
			sortDirection === "asc"
				? "ASC"
				: sortDirection === "desc"
					? "DESC"
					: undefined,
	});

	const meta = activeProjectsQuery.data?.meta;
	const recentlyVisited = recentlyVisitedQuery.data.data;
	const recentTotal = recentlyVisitedQuery.data.meta.totalItems;
	const hasRecentlyVisited =
		!recentlyVisitedQuery.isLoading && recentlyVisited.length > 0;

	const visibleRecentlyVisited = useMemo(() => {
		const size = Math.min(recentPageSize, 10);
		return recentlyVisited.slice(0, size).map((r) => r.workOrder);
	}, [recentlyVisited, recentPageSize]);

	const showingRecentCount = visibleRecentlyVisited.length;

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold text-[#0F1912]">
					THM Projects (MSL)
				</h1>
			</header>

			<div className="relative w-[384px] max-w-full">
				<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<Input
					type="search"
					placeholder="Search by work order, customer ID or date..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
					className="h-10 pl-9"
				/>
			</div>

			{hasRecentlyVisited && (
				<section className="space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<h2 className="text-base font-semibold text-[#0F1912]">
							Recently visited projects
						</h2>
						<div className="flex items-center gap-2 text-sm text-[#5A615D]">
							<span>
								Showing{" "}
								<span className="font-semibold text-[#0F1912]">
									{showingRecentCount}
								</span>{" "}
								of{" "}
								<span className="font-semibold text-[#0F1912]">
									{recentTotal}
								</span>
							</span>
							<Select
								value={String(recentPageSize)}
								onValueChange={(value) => {
									const next = Math.min(Number(value), 10);
									setRecentPageSize(next);
								}}>
								<SelectTrigger className="h-8 w-[64px] border-[#8A8F8C] bg-white px-2 text-sm font-medium text-[#0F1912]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{RECENT_PAGE_SIZE_OPTIONS.map((size) => (
										<SelectItem
											key={size}
											value={String(size)}>
											{size}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="rounded-lg border border-[#C1C4C2] bg-white">
						<ThmProjectsTable
							rows={visibleRecentlyVisited}
							loading={false}
						/>
					</div>
				</section>
			)}

			<section className="space-y-3">
				<h2 className="text-base font-semibold text-[#0F1912]">
					All active projects
				</h2>
				<div className="rounded-lg border border-[#C1C4C2] bg-white">
					<ThmProjectsTable
						rows={activeProjectsQuery.data?.data ?? []}
						loading={activeProjectsQuery.isLoading}
						currentPage={page}
						totalPages={meta?.totalPages ?? 1}
						totalItems={meta?.totalItems ?? 0}
						itemsPerPage={ITEMS_PER_PAGE}
						onPageChange={setPage}
						sortColumn={sortColumn}
						sortDirection={sortDirection}
						onSort={handleSort}
					/>
				</div>
			</section>
		</div>
	);
}
