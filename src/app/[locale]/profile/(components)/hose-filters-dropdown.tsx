"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Funnel, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export const HOSE_FILTER_LABEL_KEYS = {
	rejected: "rejectedInspections",
	approved: "withRemarks",
	overdue: "overdue",
	aktive_midlertidige: "activeTemporary",
	replacementDue: "dueInSixMonths",
	spareSet: "spareHoses",
} as const;

export type HoseFilterKey = keyof typeof HOSE_FILTER_LABEL_KEYS;

export const HOSE_AGE_LABEL_KEYS = {
	"5-6": "age5to6",
	"7-8": "age7to8",
	"8-10": "age8to10",
	"10+": "age10plus",
} as const;

export type HoseAgeRangeKey = keyof typeof HOSE_AGE_LABEL_KEYS;

export interface HoseFiltersDropdownProps {
	selectedFilters: string[];
	selectedAgeRanges: string[];
	onToggleFilter: (value: string) => void;
	onToggleAgeRange: (value: string) => Promise<void> | void;
	onClearAll?: () => void;
}

export function HoseFiltersDropdown({
	selectedFilters,
	selectedAgeRanges,
	onToggleFilter,
	onToggleAgeRange,
	onClearAll,
}: HoseFiltersDropdownProps) {
	const t = useTranslations("HoseFiltersDropdown");
	const selectedCount = selectedFilters.length + selectedAgeRanges.length;
	const hasActiveFilters = selectedCount > 0;

	const inspectionKeys = React.useMemo(
		() => new Set(["rejected", "approved", "overdue"]),
		[],
	);
	const replacementKeys = React.useMemo(
		() => new Set(["aktive_midlertidige", "replacementDue"]),
		[],
	);

	const hasInspectionFilters = selectedFilters.some((f) =>
		inspectionKeys.has(f),
	);
	const hasReplacementFilters = selectedFilters.some((f) =>
		replacementKeys.has(f),
	);
	const hasAgeFilters = selectedAgeRanges.length > 0;

	return (
		<div className="flex items-center">
			<div className="relative w-[160px]">
				<DropdownMenu>
					<DropdownMenuTrigger
						className={
							"flex w-full items-center justify-between rounded-md border border-[#C1C4C2] bg-white px-3 py-2 text-[#5A615D] " +
							(hasActiveFilters
								? "border-[#009640] text-[#005522]"
								: "border-[#C1C4C2] text-[#5A615D]")
						}>
						<div className="flex items-center gap-2">
							<Funnel
								size={16}
								className={
									hasActiveFilters ? "text-[#005522]" : "text-[#5A615D]"
								}
							/>
							<span>
								{t("filter")}
								{hasActiveFilters ? ` (${selectedCount})` : ""}
							</span>
						</div>
						<ChevronDown
							size={16}
							className={hasActiveFilters ? "text-[#005522]" : "text-[#5A615D]"}
						/>
					</DropdownMenuTrigger>

					<DropdownMenuContent className="w-[300px] rounded-2xl bg-white p-4 shadow-lg">
						<div className="space-y-5 text-sm">
							{hasActiveFilters && onClearAll && (
								<div className="flex items-center justify-end border-b border-[#E8EAE9] pb-3">
									<button
										type="button"
										className="cursor-pointer text-sm font-medium text-[#005522] hover:underline"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onClearAll();
										}}>
										{t("clearAll")}
									</button>
								</div>
							)}

							<div>
								<div className="mb-2 flex items-center justify-between">
									<h4 className="font-semibold text-[#0F1912]">
										{t("inspection")}
									</h4>
									{hasInspectionFilters && (
										<span className="rounded-full bg-[#DCF7E0] px-2 py-0.5 text-xs font-medium text-[#005522]">
											{t("inspection")}
										</span>
									)}
								</div>
								<div className="space-y-2">
									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={(e) => {
											e.stopPropagation();
											onToggleFilter("rejected");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox
												checked={selectedFilters.includes("rejected")}
											/>
											<span>{t("rejectedInspections")}</span>
										</div>
									</DropdownMenuItem>

									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={(e) => {
											e.stopPropagation();
											onToggleFilter("approved");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox
												checked={selectedFilters.includes("approved")}
											/>
											<span>{t("withRemarks")}</span>
										</div>
									</DropdownMenuItem>

									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={(e) => {
											e.stopPropagation();
											onToggleFilter("overdue");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox checked={selectedFilters.includes("overdue")} />
											<span>{t("overdue")}</span>
										</div>
									</DropdownMenuItem>
								</div>
							</div>
							<div>
								<div className="mb-2 flex items-center justify-between">
									<h4 className="font-semibold text-[#0F1912]">
										{t("hoseReplacement")}
									</h4>
									{hasReplacementFilters && (
										<span className="rounded-full bg-[#DCF7E0] px-2 py-0.5 text-xs font-medium text-[#005522]">
											{t("hoseReplacement")}
										</span>
									)}
								</div>
								<div className="space-y-2">
									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={(e) => {
											e.stopPropagation();
											onToggleFilter("aktive_midlertidige");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox
												checked={selectedFilters.includes(
													"aktive_midlertidige",
												)}
											/>
											<span>{t("activeTemporary")}</span>
										</div>
									</DropdownMenuItem>

									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={(e) => {
											e.stopPropagation();
											onToggleFilter("replacementDue");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox
												checked={selectedFilters.includes("replacementDue")}
											/>
											<span>{t("dueInSixMonths")}</span>
										</div>
									</DropdownMenuItem>
								</div>
							</div>

							<div>
								<div className="mb-2 flex items-center justify-between">
									<h4 className="font-semibold text-[#0F1912]">
										{t("byAge")}
									</h4>
									{hasAgeFilters && (
										<span className="rounded-full bg-[#DCF7E0] px-2 py-0.5 text-xs font-medium text-[#005522]">
											{t("byAge")}
										</span>
									)}
								</div>
								<div className="space-y-2">
									{(
										[
											["5-6", "age5to6"],
											["7-8", "age7to8"],
											["8-10", "age8to10"],
											["10+", "age10plus"],
										] as const
									).map(([value, labelKey]) => (
										<DropdownMenuItem
											key={value}
											className="rounded-md p-0 focus:bg-gray-50"
											onClick={async (e) => {
												e.stopPropagation();
												await onToggleAgeRange(value);
											}}>
											<div className="flex items-center gap-2">
												<Checkbox
													checked={selectedAgeRanges.includes(value)}
												/>
												<span>{t(labelKey)}</span>
											</div>
										</DropdownMenuItem>
									))}
								</div>
							</div>

							<div>
								<h4 className="mb-2 font-semibold text-[#0F1912]">
									{t("spareHoses")}
								</h4>
								<DropdownMenuItem
									className="rounded-md p-0 focus:bg-gray-50"
									onClick={(e) => {
										e.stopPropagation();
										onToggleFilter("spareSet");
									}}>
									<div className="flex items-center gap-2">
										<Checkbox
											checked={selectedFilters.includes("spareSet")}
										/>
										<span>{t("spareHoses")}</span>
									</div>
								</DropdownMenuItem>
							</div>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
