import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Rekvisisjon, RequisitionStatus } from "@/hooks/useRequisitions";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { Search } from "lucide-react";

import { REQUISITION_STATUSES, getRadioStatusStyle } from "./rekvisisjoner.constants";
import { getStatusCount } from "./rekvisisjoner.utils";

interface RequisitionFiltersProps {
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	selectedStatus: string;
	onSelectedStatusChange: (value: string) => void;
	requisitions: Rekvisisjon[];
	allRequisitionsCache: Rekvisisjon[];
	labels: {
		searchPlaceholder: string;
		search: string;
		status: string;
	};
}

export function RequisitionFilters({
	searchQuery,
	onSearchQueryChange,
	selectedStatus,
	onSelectedStatusChange,
	requisitions,
	allRequisitionsCache,
	labels,
}: RequisitionFiltersProps) {
	const dataForCount =
		allRequisitionsCache.length > 0 ? allRequisitionsCache : requisitions;

	return (
		<div className="space-y-6 p-6">
			<div className="relative flex w-full max-w-[480px]">
				<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
				<Input
					placeholder={labels.searchPlaceholder}
					value={searchQuery}
					onChange={(e) => onSearchQueryChange(e.target.value)}
					className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-12 text-base text-[#5A615D]"
				/>
				<Button
					type="submit"
					className="absolute top-1/2 right-0 h-10 -translate-y-1/2 rounded-none rounded-r-md border-1 border-l-2 border-[#8A8F8C] bg-white px-4 font-medium text-[#0F1912] hover:bg-white">
					{labels.search}
				</Button>
			</div>
			<div className="flex items-center gap-3 border-t border-[#C1C4C2] pt-6">
				<p className="text-sm font-bold text-[#0F1912]">{labels.status}:</p>
				<RadioGroup
					value={selectedStatus}
					onValueChange={onSelectedStatusChange}
					className="flex flex-wrap gap-3">
					{REQUISITION_STATUSES.map((status) => {
						const count = getStatusCount(status, dataForCount);
						const badgeStyle = getRadioStatusStyle(status);
						return (
							<div
								key={status}
								className="flex items-center">
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value={status}
										id={status}
										className={cn(
											"h-5 w-5",
											selectedStatus === status
												? "border-[#1C6D2C] text-[#1C6D2C]"
												: "border-[#C1C4C2]",
										)}
									/>
									<Label
										htmlFor={status}
										className={cn("text-sm font-medium text-[#0F1912]")}>
										{status}
									</Label>
								</div>
								{status !== "Alle" &&
									status !== "Godkjent" &&
									count > 0 && (
										<span
											className={cn(
												"ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white",
												badgeStyle,
											)}>
											{count}
										</span>
									)}
							</div>
						);
					})}
				</RadioGroup>
			</div>
		</div>
	);
}
