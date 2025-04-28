"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { FilterValues } from "@/types/filter.types";
import { cva, VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";
import { Checkbox } from "./checkbox";

export interface FilterCategory {
	category: string;
	filters: FilterValues[];
}

interface FilterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof filterVariants> {
	filters: FilterCategory[];
	onFilterChange: (filters: FilterValues[]) => void;
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
	...props
}: FilterProps) {
	const t = useTranslations();
	const [selectedFilters, setSelectedFilters] = React.useState<
		Record<string, string[]>
	>({});

	const handleFilterChange = React.useCallback(
		(filterKey: string, value: string) => {
			setSelectedFilters((prev) => {
				const newFilters = { ...prev };
				const currentValues = [...(newFilters[filterKey] || [])];
				const valueIndex = currentValues.indexOf(value);

				if (valueIndex > -1) {
					// Remove value
					const updatedValues = currentValues.filter((v) => v !== value);
					if (updatedValues.length === 0) {
						delete newFilters[filterKey];
					} else {
						newFilters[filterKey] = updatedValues;
					}
				} else {
					// Add value
					newFilters[filterKey] = [...currentValues, value];
				}

				// Convert to FilterValues array for API
				const filterArray: FilterValues[] = Object.entries(newFilters).map(
					([key, values]) => ({
						key,
						values: [...values], // Create a new array to ensure immutability
					}),
				);

				// Call onFilterChange with the updated filters
				onFilterChange(filterArray);

				return newFilters;
			});
		},
		[onFilterChange],
	);

	// Reset filters
	const resetFilters = React.useCallback(() => {
		setSelectedFilters({});
		onFilterChange([]);
	}, [onFilterChange]);

	// Count total selected filters
	const selectedFilterCount = Object.values(selectedFilters).reduce(
		(acc, values) => acc + values.length,
		0,
	);

	return (
		<div
			className={cn(filterVariants({ variant, size }), className)}
			{...props}>
			{selectedFilterCount > 0 && (
				<div className="mb-2 flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={resetFilters}
						className="text-muted-foreground h-auto p-2">
						<X className="mr-2 h-4 w-4" />
						{t("common.reset")}
					</Button>
				</div>
			)}
			<div className="space-y-6 h-[1120px] overflow-auto">
				{filters?.map((filterCategory) => (
					<div
						key={filterCategory.category}
						className="space-y-4">
						<h3 className="text-lg font-semibold">{filterCategory.category}</h3>
						{filterCategory.filters.map((filter) => (
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
												<label
													htmlFor={`${filter.key}-${value}`}
													className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
													{value}
												</label>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
