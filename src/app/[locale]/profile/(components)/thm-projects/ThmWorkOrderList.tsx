"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useCreateThmView,
	useDeleteThmView,
	useSaveThmView,
	useThmViews,
} from "@/hooks/useThmViews";
import { useThmWorkOrderHoses } from "@/hooks/useThmWorkOrderHoses";
import { useRouter } from "@/i18n/navigation";
import {
	type ColumnDef,
	type ColumnPreferences,
	pickInitialView,
	preferencesToViewColumns,
	viewColumnsToPreferences,
} from "@/lib/thm-column-views";
import { cn } from "@/lib/utils";
import type { ThmHoseListItem } from "@/types/thm-projects.types";
import {
	Calendar,
	ChartNoAxesCombined,
	ChevronDown,
	Download,
	Filter,
	Image as ImageIcon,
	Info,
	Plus,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";

import { HoseMediaDrawer } from "./HoseMediaDrawer";
import { ThmCustomizeColumnsModal } from "./ThmCustomizeColumnsModal";

interface ThmWorkOrderListProps {
	workOrderNumber: string;
}

type ColumnKey =
	| "posId"
	| "s2"
	| "status"
	| "uploaded"
	| "synced"
	| "bildestatus"
	| "hoseStd"
	| "hoseDim";

const COLUMNS: ColumnDef<ColumnKey>[] = [
	{ key: "posId", label: "POS ID" },
	{ key: "s2", label: "S2" },
	{ key: "status", label: "Status" },
	{ key: "uploaded", label: "Uploaded" },
	{ key: "synced", label: "Synced" },
	{ key: "bildestatus", label: "Bildestatus" },
	{ key: "hoseStd", label: "Hose Std" },
	{ key: "hoseDim", label: "Hose Dim" },
];

const ALL_COLUMN_KEYS = COLUMNS.map((c) => c.key);

const DEFAULT_PREFS: ColumnPreferences<ColumnKey> = {
	order: ALL_COLUMN_KEYS,
	visible: Object.fromEntries(ALL_COLUMN_KEYS.map((k) => [k, true])) as Record<
		ColumnKey,
		boolean
	>,
};

// Shown as the "View Name:" label when the user hasn't created a view yet.
const FALLBACK_VIEW_NAME = "Default View";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 300;

function StatusBadge({ status }: { status: ThmHoseListItem["status"] }) {
	if (status === "NotTouched") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDE7EA] px-2.5 py-0.5 text-xs font-medium text-[#B0261A]">
				<span className="h-1.5 w-1.5 rounded-full bg-[#B0261A]" />
				Not touched
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCF7E0] px-2.5 py-0.5 text-xs font-medium text-[#1C6D2C]">
			<svg
				className="h-3 w-3"
				viewBox="0 0 20 20"
				fill="currentColor">
				<path
					fillRule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
					clipRule="evenodd"
				/>
			</svg>
			Updated from mobile
		</span>
	);
}

function BildestatusCell({
	imageCount,
	hasImages,
	onOpen,
}: {
	imageCount: number | null;
	hasImages: boolean;
	onOpen: () => void;
}) {
	const label = imageCount == null ? "(-)" : `(${imageCount})`;
	return (
		<button
			type="button"
			onClick={onOpen}
			className={cn(
				"-mx-1 inline-flex items-center gap-2 rounded-sm px-1 hover:bg-[#F3F4F3]",
				hasImages ? "text-[#1C6D2C]" : "text-[#5A615D]",
			)}>
			<ImageIcon className="h-4 w-4" />
			<span className={cn("text-sm", hasImages && "underline")}>{label}</span>
		</button>
	);
}

function ColumnHeader({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-1 text-sm font-semibold text-[#0F1912]">
			<span>{label}</span>
			<Info className="h-3.5 w-3.5 text-[#8A8F8C]" />
			<span className="ml-1 flex flex-col text-[#8A8F8C]">
				<ChevronDown className="h-3 w-3 -rotate-180" />
				<ChevronDown className="-mt-1 h-3 w-3" />
			</span>
		</div>
	);
}

function FilterCell({ isDate }: { isDate?: boolean }) {
	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				className="inline-flex items-center gap-1 rounded border border-[#D3D3D3] bg-white px-1.5 py-0.5 text-xs text-[#5A615D]">
				<span>[R]</span>
				<ChevronDown className="h-3 w-3" />
			</button>
			<div className="relative flex-1">
				{isDate ? (
					<Calendar className="pointer-events-none absolute top-1/2 left-1 h-3 w-3 -translate-y-1/2 text-[#8A8F8C]" />
				) : (
					<Search className="pointer-events-none absolute top-1/2 left-1 h-3 w-3 -translate-y-1/2 text-[#8A8F8C]" />
				)}
				<Input
					readOnly
					className="h-6 rounded-none border-0 border-b border-dashed border-[#8A8F8C] bg-transparent pr-1 pl-4 text-xs shadow-none focus-visible:ring-0"
				/>
			</div>
		</div>
	);
}

function renderCell(
	key: ColumnKey,
	row: ThmHoseListItem,
	onOpenMedia: (row: ThmHoseListItem) => void,
) {
	switch (key) {
		case "posId":
			return row.posId;
		case "s2":
			return row.s2;
		case "status":
			return <StatusBadge status={row.status} />;
		case "uploaded":
			return row.uploaded.toUpperCase();
		case "synced":
			return row.synced.toUpperCase();
		case "bildestatus":
			return (
				<BildestatusCell
					imageCount={row.imageCount}
					hasImages={row.hasImages}
					onOpen={() => onOpenMedia(row)}
				/>
			);
		case "hoseStd":
			return row.hoseStd;
		case "hoseDim":
			return row.hoseDim;
	}
}

const DATE_COLUMNS = new Set<ColumnKey>(["uploaded", "synced"]);

export function ThmWorkOrderList({ workOrderNumber }: ThmWorkOrderListProps) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [customizeOpen, setCustomizeOpen] = useState(false);
	const [activeViewId, setActiveViewId] = useState<number | null>(null);
	const [mediaDrawerRow, setMediaDrawerRow] = useState<ThmHoseListItem | null>(
		null,
	);

	// Debounce the search input — a keystroke shouldn't refire the request
	// mid-typing, which on a large WO means a slow BE round-trip per letter.
	useEffect(() => {
		const t = setTimeout(
			() => setDebouncedSearch(search.trim()),
			SEARCH_DEBOUNCE_MS,
		);
		return () => clearTimeout(t);
	}, [search]);

	// Reset to page 1 whenever the filter set changes — otherwise we could
	// land on a page number that no longer exists in the filtered result.
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, pageSize, workOrderNumber]);

	const { data: views = [], isLoading: viewsLoading } = useThmViews();
	const createView = useCreateThmView();
	const saveView = useSaveThmView();
	const deleteView = useDeleteThmView();

	// Sync the active view id with what the server has: on first load, pick
	// the default (or first). If the active view got deleted (by us, or in
	// another tab), fall back to the same rule.
	useEffect(() => {
		if (activeViewId != null && views.some((v) => v.viewId === activeViewId)) {
			return;
		}
		setActiveViewId(pickInitialView(views)?.viewId ?? null);
	}, [views, activeViewId]);

	const activeView = useMemo(
		() => views.find((v) => v.viewId === activeViewId) ?? null,
		[views, activeViewId],
	);

	const prefs = useMemo<ColumnPreferences<ColumnKey>>(
		() =>
			activeView
				? viewColumnsToPreferences(activeView.columns, ALL_COLUMN_KEYS)
				: DEFAULT_PREFS,
		[activeView],
	);

	const visibleColumns = useMemo(
		() => prefs.order.filter((key) => prefs.visible[key]),
		[prefs],
	);

	const { data, isLoading } = useThmWorkOrderHoses(
		workOrderNumber
			? {
					workOrderNumber,
					page,
					pageSize,
					search: debouncedSearch || undefined,
				}
			: null,
	);

	const rows = data?.data ?? [];
	const total = data?.meta.totalItems ?? 0;
	const totalPages = data?.meta.totalPages ?? 1;

	const title = data?.title ?? workOrderNumber;

	const goToDashboard = () => {
		router.push(
			`/profile?tab=thm-dashboard&workOrder=${encodeURIComponent(workOrderNumber)}`,
		);
	};

	const handleResetFilters = () => {
		setSearch("");
		setDebouncedSearch("");
		setPage(1);
	};

	const currentViewName = activeView?.viewName ?? FALLBACK_VIEW_NAME;

	const handleSavePrefs = async (
		next: ColumnPreferences<ColumnKey>,
		meta: { viewName: string },
	) => {
		const nextName = meta.viewName || currentViewName;
		const payload = {
			viewName: nextName,
			// Preserve the existing default flag when updating; the first view a
			// user creates becomes the default automatically.
			isDefault: activeView?.isDefault ?? views.length === 0,
			columns: preferencesToViewColumns(next),
		};
		try {
			if (activeView) {
				await saveView.mutateAsync({ viewId: activeView.viewId, payload });
				toast.success(`Visningen "${nextName}" ble lagret.`);
			} else {
				const created = await createView.mutateAsync(payload);
				setActiveViewId(created.viewId);
				toast.success(`Visningen "${nextName}" ble opprettet.`);
			}
		} catch (e) {
			console.error("Save view failed", e);
			toast.error("Kunne ikke lagre visningen. Prøv igjen senere.");
		}
	};

	const handleCopyView = async () => {
		const nextName = activeView
			? `${activeView.viewName} (Copy)`
			: currentViewName;
		const payload = {
			viewName: nextName,
			isDefault: false,
			columns: preferencesToViewColumns(prefs),
		};
		try {
			const created = await createView.mutateAsync(payload);
			setActiveViewId(created.viewId);
			setCustomizeOpen(false);
			toast.success(`Visningen "${nextName}" ble kopiert.`);
		} catch (e) {
			console.error("Copy view failed", e);
			toast.error("Kunne ikke kopiere visningen. Prøv igjen senere.");
		}
	};

	const handleDeleteView = async () => {
		if (!activeView) {
			setCustomizeOpen(false);
			return;
		}
		const deletedName = activeView.viewName;
		try {
			await deleteView.mutateAsync(activeView.viewId);
			// Optimistically flip to whatever the next best view is; the effect
			// above will reconcile once the refetch lands.
			const remaining = views.filter((v) => v.viewId !== activeView.viewId);
			setActiveViewId(pickInitialView(remaining)?.viewId ?? null);
			setCustomizeOpen(false);
			toast.success(`Visningen "${deletedName}" ble slettet.`);
		} catch (e) {
			console.error("Delete view failed", e);
			toast.error("Kunne ikke slette visningen. Prøv igjen senere.");
		}
	};

	const columnLookup = new Map(COLUMNS.map((c) => [c.key, c]));

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h1 className="text-2xl font-semibold text-[#0F1912]">
					<span className="font-semibold">Hoses in Survey Workorder:</span>{" "}
					<span className="font-normal">{title}</span>
				</h1>
				<Button
					variant="outline"
					size="sm"
					onClick={goToDashboard}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<ChartNoAxesCombined className="h-4 w-4" />
					Dashboard
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<div className="relative min-w-[280px] flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
					<Input
						placeholder="Søk på POS, S2, Status ..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-9 pl-9"
					/>
				</div>
				<span className="text-sm text-[#5A615D]">
					Total in list: <span className="font-semibold">{total}</span>
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={handleResetFilters}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<Filter className="h-4 w-4" />
					Reset filters
				</Button>
				<Select
					value={activeViewId != null ? String(activeViewId) : ""}
					onValueChange={(v) => setActiveViewId(Number(v))}
					disabled={viewsLoading || views.length === 0}>
					<SelectTrigger className="h-9 w-[260px] bg-white">
						<SelectValue placeholder={`View: ${FALLBACK_VIEW_NAME}`} />
					</SelectTrigger>
					<SelectContent>
						{views.map((v) => (
							<SelectItem
								key={v.viewId}
								value={String(v.viewId)}>
								View: {v.viewName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCustomizeOpen(true)}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<SlidersHorizontal className="h-4 w-4" />
					Customize columns
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<Download className="h-4 w-4" />
					Download
				</Button>
			</div>

			<div className="overflow-x-auto rounded-md border border-[#C1C4C2] bg-white">
				<table className="w-full min-w-max border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7E6] bg-white">
							{visibleColumns.map((key) => (
								<th
									key={key}
									className="px-4 py-3 text-left">
									<ColumnHeader label={columnLookup.get(key)?.label ?? key} />
								</th>
							))}
							<th className="px-4 py-3 text-right">
								<span className="text-sm font-semibold text-[#0F1912]">
									Actions
								</span>
							</th>
						</tr>
						<tr className="border-b border-[#E5E7E6] bg-white">
							{visibleColumns.map((key) => (
								<th
									key={key}
									className="px-4 py-2">
									<FilterCell isDate={DATE_COLUMNS.has(key)} />
								</th>
							))}
							<th className="px-4 py-2" />
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							Array.from({ length: 6 }).map((_, i) => (
								<tr
									key={i}
									className="border-b border-[#E5E7E6]">
									{visibleColumns.map((key) => (
										<td
											key={key}
											className="px-4 py-4">
											<Skeleton className="h-4 w-full" />
										</td>
									))}
									<td className="px-4 py-4">
										<Skeleton className="h-4 w-full" />
									</td>
								</tr>
							))
						) : rows.length === 0 ? (
							<tr>
								<td
									colSpan={visibleColumns.length + 1}
									className="px-4 py-10 text-center text-sm text-[#5A615D]">
									Ingen slanger funnet.
								</td>
							</tr>
						) : (
							rows.map((row, i) => (
								<tr
									key={`${row.posId}-${i}`}
									className="border-b border-[#E5E7E6] hover:bg-[#F7F9F8]">
									{visibleColumns.map((key) => (
										<td
											key={key}
											className="px-4 py-4 text-[#0F1912]">
											{renderCell(key, row, setMediaDrawerRow)}
										</td>
									))}
									<td className="px-4 py-4 text-right">
										<Button
											variant="outline"
											size="sm"
											className="gap-1 border-[#C1C4C2] bg-white text-[#0F1912]">
											<Plus className="h-3.5 w-3.5" />
											Add to cart
										</Button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<PaginationFooter
				page={page}
				pageSize={pageSize}
				totalItems={total}
				totalPages={totalPages}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
			/>

			<ThmCustomizeColumnsModal<ColumnKey>
				open={customizeOpen}
				onOpenChange={setCustomizeOpen}
				columns={COLUMNS}
				value={prefs}
				defaults={DEFAULT_PREFS}
				viewName={currentViewName}
				onSave={handleSavePrefs}
				onCopyView={handleCopyView}
				onDeleteView={handleDeleteView}
			/>

			<HoseMediaDrawer
				open={mediaDrawerRow != null}
				onOpenChange={(o) => {
					if (!o) setMediaDrawerRow(null);
				}}
				hexagonId={mediaDrawerRow?.hexagonId ?? null}
				seq={mediaDrawerRow?.posId ?? null}
				equipmentName={mediaDrawerRow?.s2 ?? null}
			/>
		</div>
	);
}

function PaginationFooter({
	page,
	pageSize,
	totalItems,
	totalPages,
	onPageChange,
	onPageSizeChange,
}: {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	onPageChange: (p: number) => void;
	onPageSizeChange: (s: number) => void;
}) {
	if (totalItems === 0) return null;

	const clamp = (n: number) => Math.min(Math.max(n, 1), totalPages);
	const rangeStart = (page - 1) * pageSize + 1;
	const rangeEnd = Math.min(page * pageSize, totalItems);

	// Compact window: current ±2, plus first/last with ellipses.
	const pages = pageWindow(page, totalPages);

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#C1C4C2] bg-white px-4 py-3 text-sm">
			<div className="flex items-center gap-2 text-[#5A615D]">
				<span>
					Showing{" "}
					<span className="font-semibold text-[#0F1912]">{rangeStart}</span>–
					<span className="font-semibold text-[#0F1912]">{rangeEnd}</span> of{" "}
					<span className="font-semibold text-[#0F1912]">{totalItems}</span>
				</span>
				<span className="mx-2 h-4 w-px bg-[#E5E7E6]" />
				<span>Per page:</span>
				<Select
					value={String(pageSize)}
					onValueChange={(v) => onPageSizeChange(Number(v))}>
					<SelectTrigger className="h-8 w-[80px] bg-white">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((s) => (
							<SelectItem
								key={s}
								value={String(s)}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Pagination className="mx-0 w-auto justify-end">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							aria-disabled={page <= 1}
							className={cn(page <= 1 && "pointer-events-none opacity-50")}
							onClick={(e) => {
								e.preventDefault();
								if (page > 1) onPageChange(clamp(page - 1));
							}}
						/>
					</PaginationItem>
					{pages.map((p, i) =>
						p === "…" ? (
							<PaginationItem key={`ellipsis-${i}`}>
								<span className="px-2 text-[#5A615D]">…</span>
							</PaginationItem>
						) : (
							<PaginationItem key={p}>
								<PaginationLink
									href="#"
									isActive={p === page}
									onClick={(e) => {
										e.preventDefault();
										onPageChange(p);
									}}>
									{p}
								</PaginationLink>
							</PaginationItem>
						),
					)}
					<PaginationItem>
						<PaginationNext
							href="#"
							aria-disabled={page >= totalPages}
							className={cn(
								page >= totalPages && "pointer-events-none opacity-50",
							)}
							onClick={(e) => {
								e.preventDefault();
								if (page < totalPages) onPageChange(clamp(page + 1));
							}}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

function pageWindow(current: number, total: number): Array<number | "…"> {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const out: Array<number | "…"> = [];
	const add = (n: number | "…") => {
		if (out[out.length - 1] !== n) out.push(n);
	};
	add(1);
	if (current > 3) add("…");
	for (
		let p = Math.max(2, current - 1);
		p <= Math.min(total - 1, current + 1);
		p++
	) {
		add(p);
	}
	if (current < total - 2) add("…");
	add(total);
	return out;
}
