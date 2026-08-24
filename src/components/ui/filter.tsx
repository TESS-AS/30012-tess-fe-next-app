"use client";

import * as React from "react";
import { useCallback, useMemo, useImperativeHandle, useRef } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
	FilterCategory,
	FilterValues,
	FilterChildrenResponse,
	SliderConfig,
	FilterDefinition,
} from "@/types/filter.types";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { SliderFilterInput } from "./slider-filter-input";

type CategoryFilterItem = {
	assortmentNumber: string;
	nameNo: string;
	nameEn: string;
	productCount: number;
};

interface FilterProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof filterVariants> {
	filters: FilterCategory[];
	onFilterChange: (filters: FilterValues[]) => void;
	selectedFilters?: Record<string, string[]>;
	categoryNumber?: string;
	categoryName?: string;
	language?: string;
	categoryFilters?: CategoryFilterItem[];
	query: string | null;
	handleCategoryChange?: (
		newCategoryNumber: string,
		categoryName: string,
	) => void;
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

export const Filter = React.forwardRef<
	{
		clearRangeFilter: (filterKey: string) => void;
		refetchAllChildren: (filterArray: FilterValues[]) => Promise<void>;
	},
	FilterProps
>(
	(
		{
			className,
			variant,
			size,
			filters,
			onFilterChange,
			selectedFilters: externalSelectedFilters = {},
			categoryNumber,
			categoryName,
			language,
			categoryFilters,
			handleCategoryChange,
			query,
			...props
		},
		ref,
	) => {
		const t = useTranslations();
		const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
		const loadingInitiatedRef = React.useRef<Set<string>>(new Set());

		const [searchTerm, setSearchTerm] = React.useState("");
		const [showAllCategories, setShowAllCategories] = React.useState(false);
		const [selectedCategory, setSelectedCategory] = React.useState<
			string | null
		>(null);
		const [localSelectedFilters, setLocalSelectedFilters] = React.useState<
			Record<string, string[]>
		>(externalSelectedFilters);

		const [openAccordions, setOpenAccordions] = React.useState<string[]>([]);

		const [loadingChildrenKeys, setLoadingChildrenKeys] = React.useState<
			Set<string>
		>(new Set());

		React.useEffect(() => {
			setLocalSelectedFilters(externalSelectedFilters);
		}, [externalSelectedFilters]);

		// Keep local selectedCategory in sync with external filters/category:
		// - If there's no "category" filter selected, clear selectedCategory
		//   so the Kategori list returns to its default state.
		React.useEffect(() => {
			const hasCategoryFilter =
				Array.isArray(externalSelectedFilters.category) &&
				externalSelectedFilters.category.length > 0;

			if (!hasCategoryFilter) {
				setSelectedCategory(null);
			}
		}, [externalSelectedFilters.category, categoryNumber]);

		// Open the first 3 filters by default when filters change
		React.useEffect(() => {
			const firstThreeKeys: string[] = [];
			for (const fc of filters) {
				for (const f of fc.filters) {
					if (!firstThreeKeys.includes(f.attributeIdentifier)) {
						firstThreeKeys.push(f.attributeIdentifier);
					}
					if (firstThreeKeys.length >= 3) break;
				}
				if (firstThreeKeys.length >= 3) break;
			}
			if (firstThreeKeys.length > 0) {
				setOpenAccordions(firstThreeKeys);
			}
		}, [filters]);

		React.useEffect(() => {
			// Reset filters when query changes
			setLocalSelectedFilters({});
			setSelectedCategory(null);
			setOpenAccordions([]);
			loadingInitiatedRef.current.clear();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [query]);

		const handleCategorySelect = (cf: CategoryFilterItem) => {
			setOpenAccordions([]);

			if (selectedCategory === cf.assortmentNumber) {
				setSelectedCategory(null);
				handleCategoryChange?.("", "");
			} else {
				setSelectedCategory(cf.assortmentNumber);
				handleCategoryChange?.(cf.assortmentNumber, cf.nameNo);
			}
		};

		const selectedFilters = externalSelectedFilters;

		const handleFilterChange = useCallback(
			async (filterKey: string, value: string) => {
				const currentValues = localSelectedFilters[filterKey] || [];
				const updatedValues = currentValues.includes(value)
					? currentValues.filter((v) => v !== value)
					: [...currentValues, value];

				const updatedFilters = {
					...localSelectedFilters,
					[filterKey]: updatedValues,
				};

				if (updatedValues.length === 0) {
					delete updatedFilters[filterKey];
				}

				setLocalSelectedFilters(updatedFilters);

				const filterArray: FilterValues[] = Object.entries(updatedFilters)
					.filter(([key, values]) => key !== "category" && values.length > 0)
					.map(([key, values]) => ({ key, values }));

				onFilterChange(filterArray);
			},
			[
				onFilterChange,
				localSelectedFilters,
				categoryNumber,
				query,
				selectedCategory,
			],
		);

		// Local UI state for slider-based (range) filters
		const [rangeValues, setRangeValues] = React.useState<
			Record<string, [number, number]>
		>({});

		const [tempRangeValues, setTempRangeValues] = React.useState<
			Record<string, [number, number]>
		>({});

		const [inputStrings, setInputStrings] = React.useState<
			Record<string, [string, string]>
		>({});

		const handleSliderInputChange = useCallback(
			(filterKey: string, index: 0 | 1, value: number) => {
				setTempRangeValues((prev) => {
					const current = prev[filterKey] ||
						rangeValues[filterKey] || [value, value];
					const next: [number, number] = [...current] as [number, number];
					next[index] = value;
					return { ...prev, [filterKey]: next };
				});
			},
			[rangeValues],
		);

		const handleInputStringChange = useCallback(
			(filterKey: string, index: 0 | 1, value: string) => {
				setInputStrings((prev) => {
					const current = prev[filterKey] || ["", ""];
					const next: [string, string] = [...current] as [string, string];
					next[index] = value;
					return { ...prev, [filterKey]: next };
				});
			},
			[],
		);

		const handleInputBlur = useCallback((filterKey: string) => {
			setInputStrings((prev) => {
				const copy = { ...prev };
				delete copy[filterKey];
				return copy;
			});
		}, []);

		const handleRangeChange = useCallback(
			(filter: FilterDefinition, values: [number, number]) => {
				if (!filter.values?.length || !filter.slider) return;

				const availableValues = filter.values
					.map((child) => {
						const firstValue = child.value.split(",")[0].trim();
						return parseFloat(firstValue);
					})
					.filter((val) => !isNaN(val))
					.sort((a, b) => a - b);

				if (availableValues.length === 0) return;

				// Find the closest available values
				const findClosestValue = (target: number) => {
					return availableValues.reduce((closest, current) => {
						return Math.abs(current - target) < Math.abs(closest - target)
							? current
							: closest;
					});
				};

				const snappedValues: [number, number] = [
					findClosestValue(values[0]),
					findClosestValue(values[1]),
				];

				if (snappedValues[0] > snappedValues[1]) {
					snappedValues[0] = snappedValues[1];
				}

				// If full range, clear the filter
				const isFullRange =
					snappedValues[0] === filter.slider.min &&
					snappedValues[1] === filter.slider.max;

				if (isFullRange) {
					const updatedFilters = { ...localSelectedFilters };
					delete updatedFilters[filter.attributeIdentifier];
					setLocalSelectedFilters(updatedFilters);

					const filterArray: FilterValues[] = Object.entries(updatedFilters)
						.filter(([key, values]) => key !== "category" && values.length > 0)
						.map(([key, values]) => ({ key, values }));

					onFilterChange(filterArray);
					return;
				}

				const updatedFilters = {
					...localSelectedFilters,
					[filter.attributeIdentifier]: [
						snappedValues[0].toString(),
						snappedValues[1].toString(),
					],
				};

				setLocalSelectedFilters(updatedFilters);

				const filterArray: FilterValues[] = Object.entries(updatedFilters)
					.filter(([key, values]) => key !== "category" && values.length > 0)
					.map(([key, values]) => ({ key, values }));

				onFilterChange(filterArray);
			},
			[localSelectedFilters, onFilterChange],
		);

		const resetFilters = useCallback(async () => {
			setLocalSelectedFilters({});

			onFilterChange([]);
		}, [onFilterChange]);

		const selectedFilterCount = Object.values(selectedFilters).reduce(
			(acc, values) => acc + values.length,
			0,
		);

		const [expandedFilters, setExpandedFilters] = React.useState<
			Record<string, boolean>
		>({});

		const filteredCategories = React.useMemo(() => {
			// First, filter out filters with 0 children based on productCount / values length
			const filtersWithoutEmpty = filters
				.map((filterCategory) => {
					const validFilters = filterCategory.filters.filter((filter) => {
						const firstValue = filter.values?.[0];
						const initialProductCount =
							firstValue && "productcount" in firstValue
								? (firstValue as { productcount: string | number }).productcount
								: undefined;

						if (
							initialProductCount !== undefined &&
							initialProductCount !== null
						) {
							const count =
								typeof initialProductCount === "string"
									? parseInt(initialProductCount, 10)
									: Number(initialProductCount);
							return !isNaN(count) && count > 0;
						}

						return (filter.values?.length ?? 0) > 0;
					});

					return { ...filterCategory, filters: validFilters };
				})
				.filter((category) => category.filters.length > 0);

			// Then apply search term filtering if needed
			if (!searchTerm) return filtersWithoutEmpty;

			return filtersWithoutEmpty
				.map((filterCategory) => {
					const filteredFilters = filterCategory.filters.filter((filter) => {
						const children = filter.values || [];

						const matchesKey = filter.key
							.toLowerCase()
							.includes(searchTerm.toLowerCase());

						const matchesChild = children.some((child) =>
							child.value.toLowerCase().includes(searchTerm.toLowerCase()),
						);

						return matchesKey || matchesChild;
					});

					return { ...filterCategory, filters: filteredFilters };
				})
				.filter((category) => category.filters.length > 0);
		}, [filters, searchTerm]);

		return (
			<div
				className={cn(
					filterVariants({ variant, size, className }),
					"space-y-4",
				)}
				{...props}>
				{Array.isArray(categoryFilters) &&
					categoryFilters.length > 0 &&
					(!selectedCategory ||
						categoryFilters.some(
							(cf) => cf.assortmentNumber === selectedCategory,
						)) && (
						<div className="space-y-2">
							<h3 className="text-md font-semibold">Kategori</h3>
							<div className="rounded-lg bg-white px-4 py-3 shadow-md">
								<ul className="space-y-1 text-sm">
									{(showAllCategories
										? categoryFilters
										: categoryFilters.slice(0, 5)
									)
										.filter(
											(cf) =>
												!selectedCategory ||
												selectedCategory === cf.assortmentNumber,
										)
										.map((cf) => {
											const isChecked =
												selectedCategory === cf.assortmentNumber;
											return (
												<li
													key={cf.assortmentNumber}
													className="mb-4 flex items-center space-x-2">
													<Checkbox
														id={`category-${cf.assortmentNumber}`}
														checked={isChecked}
														onCheckedChange={() => handleCategorySelect(cf)}
													/>
													<label
														htmlFor={`category-${cf.assortmentNumber}`}
														className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
														<span className="text-green-600 hover:underline">
															{cf.nameNo}
														</span>{" "}
														<span className="text-muted-foreground">
															({cf.productCount})
														</span>
													</label>
												</li>
											);
										})}
								</ul>

								{categoryFilters.length > 5 && !selectedCategory && (
									<Button
										variant="link"
										size="sm"
										onClick={() => setShowAllCategories((prev) => !prev)}
										className="text-primary px-0 text-sm hover:underline">
										{showAllCategories ? "Vis mindre" : "Vis mer"}
									</Button>
								)}
							</div>
						</div>
					)}
				{Array.isArray(categoryFilters) && categoryFilters.length === 0 && (
					<div className="space-y-2">
						<h3 className="text-md font-semibold">Kategori</h3>
						<div className="rounded-lg bg-white px-4 py-3 shadow-md">
							<div className="space-y-2">
								{[0, 1, 2].map((i) => (
									<div
										key={i}
										className="flex items-center gap-2">
										<Skeleton className="h-4 w-4 rounded-sm" />
										<Skeleton className="h-4 w-32" />
									</div>
								))}
							</div>
						</div>
					</div>
				)}
				<h3 className="text-md mb-[-10px] font-semibold">
					{t("Common.attributes")}
				</h3>

				<div className="relative">
					<Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
					<Input
						type="text"
						placeholder={t("Common.searchAttributes")}
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

				<div className="pr-2">
					{filteredCategories.length === 0 ? (
						// Loading skeletons while filters are being fetched
						<div className="space-y-4">
							{[0, 1, 2].map((i) => (
								<div
									key={i}
									className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-40" />
									<Skeleton className="h-4 w-28" />
								</div>
							))}
						</div>
					) : (
						filteredCategories.map((filterCategory) => (
							<div
								key={filterCategory.category}
								className="space-y-4">
								<Accordion
									type="multiple"
									value={openAccordions}
									onValueChange={(val) => {
										// Ensure val is always an array
										const newValue = Array.isArray(val)
											? val
											: val
												? [val]
												: [];
										setOpenAccordions(newValue);
									}}
									className="w-full">
									{filterCategory.filters.map((filter) => (
										<AccordionItem
											key={filter.attributeIdentifier}
											value={filter.attributeIdentifier}
											className="border-b">
											<AccordionTrigger className="text-md font-semibold hover:no-underline">
												{filter.key}
											</AccordionTrigger>
											<AccordionContent className="pt-2">
												{filter.slider ? (
													<SliderFilterInput
														filterKey={filter.attributeIdentifier}
														sliderConfig={filter.slider}
														rangeValues={rangeValues}
														tempRangeValues={tempRangeValues}
														inputStrings={inputStrings}
														onInputChange={handleSliderInputChange}
														onSliderChange={(_key, values) =>
															handleRangeChange(filter, values)
														}
														onInputStringChange={handleInputStringChange}
														onInputBlur={handleInputBlur}
														debounceTimerRef={debounceTimerRef}
													/>
												) : filter.values.length > 0 ? (
													<div className="space-y-2 pl-2">
														{(expandedFilters[filter.attributeIdentifier]
															? filter.values
															: filter.values.slice(0, 5)
														).map((child) => (
															<div
																key={child.value}
																className="mb-5 flex items-center justify-between space-x-2 font-normal"
																onClick={(e) => e.stopPropagation()}>
																<Checkbox
																	id={`${filter.attributeIdentifier}-${child.value}`}
																	checked={
																		localSelectedFilters[
																			filter.attributeIdentifier
																		]?.includes(child.value) || false
																	}
																	onCheckedChange={() =>
																		handleFilterChange(
																			filter.attributeIdentifier,
																			child.value,
																		)
																	}
																/>
																<label
																	htmlFor={`${filter.attributeIdentifier}-${child.value}`}
																	className="flex w-full cursor-pointer justify-between text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
																	<span>{child.value}</span>
																	<span className="text-muted-foreground">
																		{child.productcount}
																	</span>
																</label>
															</div>
														))}
														{filter.values.length > 5 && (
															<Button
																variant="link"
																size="sm"
																onClick={() =>
																	setExpandedFilters((prev) => ({
																		...prev,
																		[filter.attributeIdentifier]:
																			!prev[filter.attributeIdentifier],
																	}))
																}
																className="text-primary px-0 text-sm hover:underline">
																{expandedFilters[filter.attributeIdentifier]
																	? "Vis mindre"
																	: "Vis mer"}
															</Button>
														)}
													</div>
												) : (
													<div className="text-muted-foreground pl-2 text-sm italic">
														Ingen alternativer tilgjengelig.
													</div>
												)}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</div>
						))
					)}
				</div>
			</div>
		);
	},
);

Filter.displayName = "Filter";
