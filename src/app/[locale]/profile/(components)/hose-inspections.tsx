import { useMemo, useState } from "react";

import { PillSwitcher } from "@/components/ui/pill-switcher";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetAssets } from "@/hooks/useGetAssets";
import { useInspectionSummary } from "@/hooks/useInspectionSummary";
import type { UIInspectionType } from "@/hooks/useInspectionSummary";
import { Calendar, MapPin, X } from "lucide-react";
import { indexToShort } from "@/constants/profileTabs";

const getQuarter = (monthIndex: number) => Math.floor(monthIndex / 3) + 1;

const HoseInspections = () => {
	const [selectedS1Code, setSelectedS1Code] = useState<string | undefined>(
		undefined,
	);
	const [selectedType, setSelectedType] =
		useState<UIInspectionType>("completed");
	const [yearOffset, setYearOffset] = useState<number>(0);

	const {
		loading: s1Loading,
		s1Codes = [],
		s1CodesPagination,
		fetchS1Codes,
	} = useGetAssets("", selectedS1Code);

	const { series, loading, error, maxCount } = useInspectionSummary({
		type: selectedType,
		s1Code: selectedS1Code,
		yearOffset: yearOffset,
	});

	const quarterGroups = useMemo(() => {
		if (!series?.length) return [];

		const map = new Map<string, { quarter: string; items: typeof series }>();

		for (const item of series) {
			const mi = item.monthIndex;
			const q = getQuarter(mi);
			const yy = (item.year || "").slice(-2);
			const key = `${item.year}-Q${q}`;
			if (!map.has(key)) {
				map.set(key, { quarter: `Q${q}/${yy}`, items: [] as typeof series });
			}
			map.get(key)!.items.push(item);
		}

		const ordered = Array.from(map.entries())
			.sort((a, b) => {
				const [yearA, qA] = a[0].split("-Q");
				const [yearB, qB] = b[0].split("-Q");
				if (yearA !== yearB) return Number(yearA) - Number(yearB);
				return Number(qA) - Number(qB);
			})
			.map(([key, val]) => ({
				key,
				quarter: val.quarter,
				items: val.items,
				monthsShort: val.items.map((m) => indexToShort[m.monthIndex]),
			}));

		return ordered;
	}, [series]);

	const barColor =
		selectedType === "completed" ? "bg-[#003D1A]" : "bg-[#05505C]";

	return (
		<div className="space-y-6">
			<div className="flex items-baseline space-x-4">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">Inspeksjoner</h1>
				</div>

				<div className="flex w-[280px] items-center gap-3">
					<p className="text-base font-normal text-[#5A615D]">Lokasjon:</p>
					<div className="relative">
						<Select
							value={selectedS1Code || ""}
							onValueChange={(value) => {
								if (!value) setSelectedS1Code("");
								setSelectedS1Code(value);
							}}>
							<SelectTrigger className="relative w-[200px] border-[#C1C4C2] bg-white pr-8 font-medium text-[#0F1912]">
								<div className="flex items-center gap-2 overflow-hidden">
									<MapPin className="h-4 w-4 shrink-0 text-[#0F1912]" />
									<SelectValue
										className="truncate"
										placeholder="Velg S1 anlegg"
									/>
								</div>
							</SelectTrigger>
							<SelectContent
								className="max-h-[300px] overflow-y-auto"
								onScroll={(e) => {
									const target = e.target as HTMLDivElement;
									if (
										target.scrollTop + target.clientHeight >=
											target.scrollHeight - 20 &&
										!s1Loading &&
										s1CodesPagination.currentPage < s1CodesPagination.totalPages
									) {
										fetchS1Codes(
											s1CodesPagination.currentPage + 1,
											s1CodesPagination.pageSize,
										);
									}
								}}>
								{(s1Codes || []).map((s1) => (
									<SelectItem
										key={s1.S1Code}
										value={s1.S1Code}>
										{s1.S1Name}
									</SelectItem>
								))}
								{s1Loading && s1CodesPagination.currentPage > 1 && (
									<div className="py-2 text-center text-sm text-gray-500">
										Laster flere...
									</div>
								)}
							</SelectContent>
						</Select>
						{selectedS1Code && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									setSelectedS1Code("");
								}}
								className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-sm p-1 opacity-50 ring-offset-white transition-all hover:bg-[#F8F9F8] hover:opacity-100 focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
								<X className="h-4 w-4 text-[#5A615D]" />
								<span className="sr-only">Fjern lokasjon</span>
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-lg bg-white p-6 shadow-md">
				<div className="mb-8 flex items-center gap-8">
					<div className="flex items-center gap-4">
						<div className="text-sm text-[#5A615D]">Type:</div>
						<PillSwitcher<UIInspectionType>
							options={[
								{
									label: "Utførte inspeksjoner",
									value: "completed",
									activeClassName: "bg-[#003D1A] text-white",
									inactiveClassName: "text-[#5A615D]",
								},
								{
									label: "Planlagte inspeksjoner",
									value: "planned",
									activeClassName: "bg-[#05505C] text-white",
									inactiveClassName: "text-[#5A615D]",
								},
							]}
							value={selectedType}
							onChange={setSelectedType}
						/>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-sm text-[#5A615D]">Periode:</div>
						<Select
							value={String(yearOffset)}
							onValueChange={(value) => setYearOffset(parseInt(value, 10))}>
							<SelectTrigger className="w-[220px] border-[#C1C4C2] bg-white">
								<Calendar className="h-4 w-4 shrink-0 text-[#0F1912]" />
								<SelectValue placeholder="Velg periode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="-2">Siste 12 måneder</SelectItem>
								<SelectItem value="-1">Siste 24 måneder</SelectItem>
								<SelectItem value="0">Current Year</SelectItem>
								<SelectItem value="1">Neste 12 måneder</SelectItem>
								<SelectItem value="2">Neste 24 måneder</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="relative h-[400px] w-full">
					<div className="absolute bottom-0 left-0 flex h-[300px] w-full items-end justify-between gap-2">
						{loading && (
							<div className="mx-auto w-full text-center text-sm text-[#5A615D]">
								Laster data...
							</div>
						)}
						{!loading && Boolean(error) && (
							<div className="mx-auto w-full text-center text-sm text-red-600">
								Kunne ikke laste data.
							</div>
						)}
						{!loading && !error && series.length === 0 && (
							<div className="mx-auto w-full text-center text-sm text-[#5A615D]">
								Ingen data i valgt periode.
							</div>
						)}

						{!loading &&
							!error &&
							series.length > 0 &&
							quarterGroups.map((group, gi, arr) => (
								<div
									key={group.key}
									className="flex h-[308px] w-[calc(25%-8px)] flex-col items-center gap-2">
									<div className="flex h-[260px] w-full justify-between">
										{group.items.map((m) => {
											const height =
												maxCount > 0
													? Math.max(
															0,
															Math.round((m.inspectionCount / maxCount) * 260),
														)
													: 0;
											return (
												<div
													key={`${m.year}-${m.month}`}
													className="flex flex-col items-center">
													<div className="mb-1 text-center text-xs text-[#0F1912]">
														{m.inspectionCount}
													</div>
													<div
														className={`flex w-[65px] flex-col justify-end ${barColor}`}
														style={{ height: `${height}px` }}
														title={`${m.month} ${m.year}: ${m.inspectionCount}`}
														aria-label={`${m.month} ${m.year}: ${m.inspectionCount}`}
													/>
												</div>
											);
										})}
										{Array.from({
											length: Math.max(0, 3 - group.items.length),
										}).map((_, i) => (
											<div
												key={`pad-${group.key}-${i}`}
												className="w-[65px]"
											/>
										))}
									</div>

									<div className="flex w-full items-center gap-2 text-xs text-[#5A615D]">
										<Separator className="shrink-1" />
										{group.quarter}
										<Separator className="shrink-1" />
									</div>

									<div className="flex gap-4 text-xs text-[#5A615D]">
										{group.items.map((m) => {
											const short = indexToShort[m.monthIndex];
											const isCurrent =
												new Date().getFullYear().toString().slice(-2) ===
													(m.year || "").slice(-2) &&
												new Date().getMonth() === m.monthIndex;
											return (
												<span
													key={`lbl-${m.year}-${m.month}`}
													className={isCurrent ? "text-[#1C6D2C]" : undefined}>
													{short}
												</span>
											);
										})}
										{Array.from({
											length: Math.max(0, 3 - group.items.length),
										}).map((_, i) => (
											<span key={`lbl-pad-${group.key}-${i}`}>&nbsp;</span>
										))}
									</div>

									{gi !== arr.length - 1 && (
										<div
											aria-hidden="true"
											className="absolute top-0 right-[-10px] h-[308px] w-px self-stretch bg-[#C1C4C2]/60"
											role="presentation"
										/>
									)}
								</div>
							))}
					</div>
				</div>

				<div className="mt-26 flex items-center justify-center gap-8">
					<div className="flex items-center gap-2">
						<div className={`h-3 w-3 rounded-full ${barColor}`}></div>
						<span className="text-sm text-[#5A615D]">
							{selectedType === "completed" ? "Utført" : "Planlagt"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HoseInspections;
