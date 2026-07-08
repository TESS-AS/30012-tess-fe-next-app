"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useThmWorkOrderHoses } from "@/hooks/useThmWorkOrderHoses";
import { useRouter } from "@/i18n/navigation";
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

import {
	type ColumnDef,
	type ColumnPreferences,
	ThmCustomizeColumnsModal,
} from "./ThmCustomizeColumnsModal";

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

const DEFAULT_PREFS: ColumnPreferences<ColumnKey> = {
	order: COLUMNS.map((c) => c.key),
	visible: {
		posId: true,
		s2: true,
		status: true,
		uploaded: true,
		synced: true,
		bildestatus: true,
		hoseStd: true,
		hoseDim: true,
	},
};

const COLUMN_PREFS_STORAGE_KEY = "thm-list-columns-v1";

function loadPrefs(): ColumnPreferences<ColumnKey> {
	if (typeof window === "undefined") return DEFAULT_PREFS;
	try {
		const raw = window.localStorage.getItem(COLUMN_PREFS_STORAGE_KEY);
		if (!raw) return DEFAULT_PREFS;
		const parsed = JSON.parse(raw) as Partial<ColumnPreferences<ColumnKey>>;
		const knownKeys = new Set(COLUMNS.map((c) => c.key));
		// Filter out any keys we no longer recognise, then append any newly
		// introduced columns at the end so the user picks them up automatically.
		const savedOrder = (parsed.order ?? []).filter((k) =>
			knownKeys.has(k as ColumnKey),
		) as ColumnKey[];
		const missing = DEFAULT_PREFS.order.filter((k) => !savedOrder.includes(k));
		return {
			order: [...savedOrder, ...missing],
			visible: { ...DEFAULT_PREFS.visible, ...(parsed.visible ?? {}) },
		};
	} catch {
		return DEFAULT_PREFS;
	}
}

function savePrefs(prefs: ColumnPreferences<ColumnKey>) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(
			COLUMN_PREFS_STORAGE_KEY,
			JSON.stringify(prefs),
		);
	} catch {
		// storage full or blocked — non-fatal
	}
}

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
}: {
	imageCount: number | null;
	hasImages: boolean;
}) {
	const label = imageCount == null ? "(-)" : `(${imageCount})`;
	if (hasImages) {
		return (
			<span className="inline-flex items-center gap-2 text-[#1C6D2C]">
				<ImageIcon className="h-4 w-4" />
				<span className="text-sm underline">{label}</span>
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-2 text-[#5A615D]">
			<ImageIcon className="h-4 w-4" />
			<span className="text-sm">{label}</span>
		</span>
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

function renderCell(key: ColumnKey, row: ThmHoseListItem) {
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
	const [view, setView] = useState("favorite");
	const [prefs, setPrefs] =
		useState<ColumnPreferences<ColumnKey>>(DEFAULT_PREFS);
	const [customizeOpen, setCustomizeOpen] = useState(false);

	useEffect(() => {
		setPrefs(loadPrefs());
	}, []);

	const visibleColumns = useMemo(
		() => prefs.order.filter((key) => prefs.visible[key]),
		[prefs],
	);

	const { data, isLoading } = useThmWorkOrderHoses(
		workOrderNumber ? { workOrderNumber, page: 1, pageSize: 50 } : null,
	);

	const rows = data?.data ?? [];
	const total = data?.meta.totalItems ?? 0;

	const title = data?.title ?? workOrderNumber;

	const goToDashboard = () => {
		router.push(
			`/profile?tab=thm-dashboard&workOrder=${encodeURIComponent(workOrderNumber)}`,
		);
	};

	const handleResetFilters = () => setSearch("");

	const handleSavePrefs = (next: ColumnPreferences<ColumnKey>) => {
		setPrefs(next);
		savePrefs(next);
	};

	// View presets are BE-owned (see the "View:" dropdown in the toolbar).
	// Until BE ships the save/copy/delete endpoints, the modal treats the
	// current view name as a display string only.
	const currentViewName = "My favorite column order";

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
					value={view}
					onValueChange={setView}>
					<SelectTrigger className="h-9 w-[260px] bg-white">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="favorite">
							View: My favorite column order
						</SelectItem>
						<SelectItem value="default">View: Default</SelectItem>
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
											{renderCell(key, row)}
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

			<ThmCustomizeColumnsModal<ColumnKey>
				open={customizeOpen}
				onOpenChange={setCustomizeOpen}
				columns={COLUMNS}
				value={prefs}
				defaults={DEFAULT_PREFS}
				viewName={currentViewName}
				onSave={handleSavePrefs}
			/>
		</div>
	);
}
