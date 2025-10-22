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

export interface HoseFiltersDropdownProps {
	selectedFilters: string[];
	selectedAgeRanges: string[];
	onToggleFilter: (value: string) => void;
	onToggleAgeRange: (value: string) => Promise<void> | void;
}

export function HoseFiltersDropdown({
	selectedFilters,
	selectedAgeRanges,
	onToggleFilter,
	onToggleAgeRange,
}: HoseFiltersDropdownProps) {
	const t = useTranslations("HoseFiltersDropdown");
	return (
		<div className="flex items-center">
			<div className="relative w-[160px]">
				<DropdownMenu>
					<DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border border-[#C1C4C2] bg-white px-3 py-2 text-[#5A615D]">
						<div className="flex items-center gap-2">
							<Funnel
								size={16}
								className="text-[#005522]"
							/>
							<span>{t("filter")}</span>
						</div>
						<ChevronDown
							size={16}
							className="text-[#5A615D]"
						/>
					</DropdownMenuTrigger>

					<DropdownMenuContent className="w-[300px] rounded-2xl bg-white p-4 shadow-lg">
						<div className="space-y-5 text-sm">
							<div>
								<h4 className="mb-2 font-semibold text-[#0F1912]">
									{t("inspection")}
								</h4>
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
								<h4 className="mb-2 font-semibold text-[#0F1912]">
									{t("hoseReplacement")}
								</h4>
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
								<h4 className="mb-2 font-semibold text-[#0F1912]">
									{t("byAge")}
								</h4>
								<div className="space-y-2">
									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={async (e) => {
											e.stopPropagation();
											await onToggleAgeRange("5-6");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox checked={selectedAgeRanges.includes("5-6")} />
											<span>{t("age5to6")}</span>
										</div>
									</DropdownMenuItem>

									<DropdownMenuItem
										className="rounded-md p-0 focus:bg-gray-50"
										onClick={async (e) => {
											e.stopPropagation();
											await onToggleAgeRange("7-8");
										}}>
										<div className="flex items-center gap-2">
											<Checkbox checked={selectedAgeRanges.includes("7-8")} />
											<span>{t("age7to8")}</span>
										</div>
									</DropdownMenuItem>
								</div>
							</div>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
