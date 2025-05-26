"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FilterValues } from "@/types/filter.types";
import { cva, VariantProps } from "class-variance-authority";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "./tooltip";

export interface FilterCategory {
	category: string;
	filters: FilterValues[];
}

interface FilterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof filterVariants> {
	filters: FilterCategory[];
	onFilterChange: (filters: FilterValues[]) => void;
	selectedFilters?: Record<string, string[]>;
}

const filterVariants = cva(
	"flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm",
	{
		variants: {
			variant: {
				default: "bg-background",
				secondary: "bg-muted/50",
			},
			size: {
				default: "p-6",
				sm: "p-4",
				lg: "p-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export function Filter({
	className,
	variant,
	size,
	filters,
	onFilterChange,
	selectedFilters: externalSelectedFilters = {},
	...props
}: FilterProps) {
	const t = useTranslations();
	const [searchTerm, setSearchTerm] = React.useState("");
	const [internalSelectedFilters, setInternalSelectedFilters] = React.useState<
		Record<string, string[]>
	>(externalSelectedFilters);

	// Use external filters if provided, otherwise use internal state
	const selectedFilters = externalSelectedFilters || internalSelectedFilters;

	const handleFilterChange = React.useCallback(
		(filterKey: string, value: string) => {
			const newFilters = { ...selectedFilters };
			const currentValues = [...(newFilters[filterKey] || [])];
			const valueIndex = currentValues.indexOf(value);

			if (valueIndex > -1) {
				const updatedValues = currentValues.filter((v) => v !== value);
				if (updatedValues.length === 0) {
					delete newFilters[filterKey];
				} else {
					newFilters[filterKey] = updatedValues;
				}
			} else {
				newFilters[filterKey] = [...currentValues, value];
			}

			const filterArray: FilterValues[] = Object.entries(newFilters)
				.filter(([, vals]) => vals.length > 0)
				.map(([key, values]) => ({
					key,
					values,
				}));

			setInternalSelectedFilters(newFilters);
			onFilterChange(filterArray);
		},
		[onFilterChange, selectedFilters],
	);

	// Reset filters
	const resetFilters = React.useCallback(() => {
		setInternalSelectedFilters({});
		onFilterChange([]);
	}, [onFilterChange]);

	// Count total selected filters
	React.useEffect(() => {
		if (Object.keys(externalSelectedFilters).length > 0) {
			setInternalSelectedFilters(externalSelectedFilters);
		}
	}, [externalSelectedFilters]);

	const selectedFilterCount = Object.values(selectedFilters).reduce(
		(acc, values) => acc + values.length,
		0,
	);

	return (
		<div
			className={cn(filterVariants({ variant, size, className }), "space-y-4")}
			{...props}>
			<div className="relative">
				<Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
				<Input
					type="text"
					placeholder={t("Common.search")}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-8"
				/>
			</div>

			{selectedFilterCount > 0 && (
				<div className="mb-4 flex justify-end">
					<Button
						variant="ghost"
						size="sm"
						onClick={resetFilters}>
						<X className="mr-2 h-4 w-4" />
						{t("Common.reset")}
					</Button>
				</div>
			)}

			<div className="h-[1120px] space-y-6 overflow-auto">
				{filters?.map((filterCategory) => {
					// Filter the filters based on search term
					const filteredFilters = filterCategory.filters.filter(
						(filter) =>
							filter.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
							filter.values.some((value) =>
								value.toLowerCase().includes(searchTerm.toLowerCase()),
							),
					);

					// Only show categories that have matching filters
					if (filteredFilters.length === 0) return null;

					return (
						<div
							key={filterCategory.category}
							className="space-y-4">
							<h3 className="text-lg font-semibold">
								{filterCategory.category}
							</h3>
							{filteredFilters.map((filter) => (
								<div
									key={filter.key}
									className="space-y-2">
									<h4 className="text-sm font-medium">{filter.key}</h4>
									<div className="space-y-2">
										{filter.values.map((value) => {
											const isSelected =
												selectedFilters[filter.key]?.includes(value) || false;
											return (
												<div
													key={value}
													className="flex items-center space-x-2">
													<Checkbox
														id={`${filter.key}-${value}`}
														checked={isSelected}
														onCheckedChange={() =>
															handleFilterChange(filter.key, value)
														}
													/>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<label
																	htmlFor={`${filter.key}-${value}`}
																	className="max-w-[150px] truncate text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
																	{value}
																</label>
															</TooltipTrigger>
															<TooltipContent>
																<p>{value}</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					);
				})}
			</div>
		</div>
	);
}
