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

export function ThmActiveProjects() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [recentPageSize, setRecentPageSize] = useState<number>(
		DEFAULT_RECENT_PAGE_SIZE,
	);

	const recentlyVisitedQuery = useThmRecentlyVisited();
	const activeProjectsQuery = useThmActiveProjects({
		page,
		pageSize: ITEMS_PER_PAGE,
		search,
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
					/>
				</div>
			</section>
		</div>
	);
}
