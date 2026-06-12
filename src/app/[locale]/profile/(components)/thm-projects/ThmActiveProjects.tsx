"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useThmActiveProjects } from "@/hooks/useThmActiveProjects";
import { useThmRecentlyVisited } from "@/hooks/useThmRecentlyVisited";
import { Search } from "lucide-react";

import { ThmProjectsTable } from "./ThmProjectsTable";

const ITEMS_PER_PAGE = 25;

export function ThmActiveProjects() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const recentlyVisitedQuery = useThmRecentlyVisited();
	const activeProjectsQuery = useThmActiveProjects({
		page,
		pageSize: ITEMS_PER_PAGE,
		search,
	});

	const meta = activeProjectsQuery.data?.meta;
	const recentlyVisited = recentlyVisitedQuery.data.data;
	const hasRecentlyVisited =
		!recentlyVisitedQuery.isLoading && recentlyVisited.length > 0;

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold text-[#0F1912]">
					THM Projects (MSL)
				</h1>
			</header>

			<div className="relative max-w-xl">
				<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<Input
					type="search"
					placeholder="Søk etter arbeidsordre, kunde-ID eller dato..."
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
					<div className="flex items-baseline justify-between">
						<h2 className="text-base font-semibold text-[#0F1912]">
							Recently visited projects
						</h2>
						<span className="text-xs text-[#5A615D]">
							{`Viser ${recentlyVisited.length} av ${recentlyVisitedQuery.data.meta.totalItems}`}
						</span>
					</div>
					<div className="rounded-lg border border-[#C1C4C2] bg-white">
						<ThmProjectsTable
							rows={recentlyVisited.map((r) => r.workOrder)}
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
