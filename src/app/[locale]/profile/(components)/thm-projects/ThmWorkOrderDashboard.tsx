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
import { useThmDashboard } from "@/hooks/useThmDashboard";
import { useRouter } from "@/i18n/navigation";
import type { ThmDashboardDailyActivity } from "@/types/thm-projects.types";
import { RefreshCw, Tag } from "lucide-react";

interface ThmWorkOrderDashboardProps {
	workOrderNumber: string;
	onS1NameResolved?: (name: string | null) => void;
}

const DAY_KEYS: (keyof Omit<ThmDashboardDailyActivity, "total">)[] = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

const DAY_LABELS: Record<string, string> = {
	monday: "Mon",
	tuesday: "Tue",
	wednesday: "Wed",
	thursday: "Thu",
	friday: "Fri",
	saturday: "Sat",
	sunday: "Sun",
};

function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function defaultRange() {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - 6);
	return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
}

export function ThmWorkOrderDashboard({
	workOrderNumber,
	onS1NameResolved,
}: ThmWorkOrderDashboardProps) {
	const router = useRouter();
	const [range, setRange] = useState(defaultRange);

	const { data, isLoading, isError, refetch, isFetching } = useThmDashboard(
		workOrderNumber
			? {
					workOrderNumber,
					startDate: range.startDate,
					endDate: range.endDate,
				}
			: null,
	);

	useEffect(() => {
		if (data?.s1Name) onS1NameResolved?.(data.s1Name);
	}, [data?.s1Name, onS1NameResolved]);

	const todayKey = DAY_KEYS[(new Date().getDay() + 6) % 7];

	const activity = data?.dateRangeActivity ?? null;

	// Drive the grow-in animation. Bars are only mounted once `!isLoading &&
	// activity` is true, so we must reset chartReady AFTER that flip (not on
	// date change, because the API call lags) — otherwise the 0→target paint
	// races the request and the user sees full-height bars instantly.
	const [chartReady, setChartReady] = useState(false);
	useEffect(() => {
		if (isLoading || !activity) {
			setChartReady(false);
			return;
		}
		setChartReady(false);
		const id = window.setTimeout(() => setChartReady(true), 30);
		return () => window.clearTimeout(id);
	}, [isLoading, activity]);

	const maxDay = useMemo(() => {
		if (!activity) return 0;
		return Math.max(
			...DAY_KEYS.map((k) => activity[k] ?? 0),
		);
	}, [activity]);

	const progressPct =
		data && data.totalRegistrations > 0
			? Math.min(
					100,
					Math.round((data.registrations / data.totalRegistrations) * 100),
				)
			: 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-semibold text-[#0F1912]">
						Work Order Dashboard
					</h1>
					<div className="flex items-center gap-2">
						<span className="text-sm text-[#5A615D]">Select view</span>
						<Select
							onValueChange={(value) => {
								if (value === "hose-list") {
									router.push("/profile?tab=hose-orders");
								}
							}}>
							<SelectTrigger className="h-9 w-[180px] bg-white">
								<SelectValue placeholder="Go to Hose List" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="hose-list">Go to Hose List</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => refetch()}
					disabled={isFetching}
					aria-label="Refresh dashboard"
					className="text-[#5A615D] hover:text-[#0F1912]">
					<RefreshCw
						className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
					/>
				</Button>
			</div>

			{/* Work Order Overview */}
			<section className="rounded-lg border border-[#C1C4C2] bg-[#F0FCF2] p-6">
				<h2 className="mb-4 text-base font-semibold text-[#0F1912]">
					Work Order Overview
				</h2>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-4 w-72" />
					</div>
				) : isError ? (
					<p className="text-sm text-red-600">
						Kunne ikke hente dashboard-data.
					</p>
				) : (
					<dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
						<dt className="text-[#5A615D]">Workorder:</dt>
						<dd className="font-medium text-[#0F1912]">
							{data?.workOrderNumber ?? workOrderNumber}
						</dd>
						<dt className="text-[#5A615D]">Kunde ID:</dt>
						<dd className="font-medium text-[#0F1912]">
							{data?.customerNumber ?? "—"}
						</dd>
						<dt className="text-[#5A615D]">Customer:</dt>
						<dd className="font-medium text-[#0F1912]">
							{data?.customerName ?? "—"}
						</dd>
						<dt className="text-[#5A615D]">S1:</dt>
						<dd className="font-medium text-[#0F1912]">
							{data?.s1Name ?? "—"}
						</dd>
						<dt className="text-[#5A615D]">Last updated:</dt>
						<dd className="font-medium text-[#0F1912]">—</dd>
					</dl>
				)}
			</section>

			{/* Registered Tags */}
			<section className="rounded-lg border border-[#C1C4C2] bg-white p-6">
				<div className="mb-3 flex items-center gap-2">
					<h2 className="text-base font-semibold text-[#0F1912]">
						Registered Tags
					</h2>
					<Tag className="h-4 w-4 text-[#5A615D]" />
				</div>
				{isLoading ? (
					<Skeleton className="h-6 w-full" />
				) : (
					<>
						<p className="mb-2 text-sm text-[#5A615D]">
							{data?.registrations ?? 0} of{" "}
							{data?.totalRegistrations ?? 0} registered
						</p>
						<div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
							<div
								className="h-full bg-[#003D1A]"
								style={{ width: `${progressPct}%` }}
							/>
						</div>
					</>
				)}
			</section>

			{/* Daily Registrations */}
			<section className="rounded-lg border border-[#C1C4C2] bg-white p-6">
				<h2 className="mb-4 text-base font-semibold text-[#0F1912]">
					Daily Registrations
				</h2>

				<p className="mb-2 text-sm text-[#5A615D]">Select timeframe:</p>
				<div className="mb-4 flex items-end gap-4">
					<div>
						<label className="mb-1 block text-xs text-[#5A615D]">From:</label>
						<Input
							type="date"
							value={range.startDate}
							onChange={(e) =>
								setRange((r) => ({ ...r, startDate: e.target.value }))
							}
							className="h-9 w-[150px]"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs text-[#5A615D]">To:</label>
						<Input
							type="date"
							value={range.endDate}
							onChange={(e) =>
								setRange((r) => ({ ...r, endDate: e.target.value }))
							}
							className="h-9 w-[150px]"
						/>
					</div>
				</div>

				{isLoading ? (
					<Skeleton className="h-40 w-full" />
				) : !activity ? (
					<p className="text-sm text-[#5A615D]">
						Ingen registreringer i valgt periode.
					</p>
				) : (
					<>
						<p className="mb-4 text-sm text-[#5A615D]">
							{activity.total} registrations in selected timeframe
						</p>
						<div className="flex items-end gap-3">
							{DAY_KEYS.map((day) => {
								const value = activity[day] ?? 0;
								const MAX_BAR_PX = 160;
								const targetPx =
									maxDay > 0 ? Math.max(4, (value / maxDay) * MAX_BAR_PX) : 4;
								const heightPx = chartReady ? targetPx : 0;
								const isToday = day === todayKey;
								return (
									<div
										key={day}
										className="flex flex-1 flex-col items-center justify-end gap-2">
										<span className="text-xs font-medium text-[#0F1912]">
											{value}
										</span>
										<div
											className="w-full rounded-t bg-[#003D1A] transition-[height] duration-700 ease-out"
											style={{ height: `${heightPx}px` }}
										/>
										<span
											className={`text-xs ${isToday ? "font-semibold text-[#1C6D2C]" : "text-[#5A615D]"}`}>
											{DAY_LABELS[day]}
										</span>
									</div>
								);
							})}
						</div>
					</>
				)}
			</section>
		</div>
	);
}
