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
import { ChevronDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { SliderFilterInput } from "./slider-filter-input";

type CategoryFilterItem = {
	assortmentNumber: string;
	nameNo: string;
	nameEn: string;
	productCount: string;
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
	/** Prefix checkbox ids when multiple Filter instances mount (e.g. mob- / desk-). */
	idPrefix?: string;
	/** Mobile fullscreen sheet styling only; filter changes still apply immediately. */
	mobileSheet?: boolean;
	/** Shown with mobile sheet: primary action closes the sheet (does not change filters). */
	onMobileSheetDone?: () => void;
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
			idPrefix = "desk-",
			mobileSheet = false,
			onMobileSheetDone,
			...props
		},
		ref,
	) => {
		const t = useTranslations();
		const isMobileSheet = mobileSheet;
		const fieldIdPrefix = idPrefix;
		const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
		const loadingInitiatedRef = React.useRef<Set<string>>(new Set());
		const prevQueryRef = useRef(query);

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

		const [expandedFilters, setExpandedFilters] = React.useState<
			Record<string, boolean>
		>({});

		const [categorySectionOpen, setCategorySectionOpen] = React.useState(true);

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
					if (!firstThreeKeys.includes(f.key)) {
						firstThreeKeys.push(f.key);
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
			// Reset local UI only when the search query value actually changes — not on
			// mount (e.g. mobile filter sheet remounting would otherwise clear selections).
			if (prevQueryRef.current === query) {
				return;
			}
			prevQueryRef.current = query;
			setLocalSelectedFilters({});
			setSelectedCategory(null);
			setOpenAccordions([]);
			loadingInitiatedRef.current.clear();
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
					delete updatedFilters[filter.key];
					setLocalSelectedFilters(updatedFilters);

					const filterArray: FilterValues[] = Object.entries(updatedFilters)
						.filter(([key, values]) => key !== "category" && values.length > 0)
						.map(([key, values]) => ({ key, values }));

					onFilterChange(filterArray);
					return;
				}

				const updatedFilters = {
					...localSelectedFilters,
					[filter.key]: [
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

		const selectedFilters = externalSelectedFilters;

		const selectedFilterCount = Object.values(selectedFilters).reduce(
			(acc, values) => acc + values.length,
			0,
		);

		const mobileSheetResultsCountLabel = React.useMemo(() => {
			if (!isMobileSheet) return null;
			const attrKeys = Object.keys(localSelectedFilters).filter(
				(k) =>
					k !== "category" &&
					(localSelectedFilters[k]?.filter(Boolean).length ?? 0) > 0,
			);
			if (attrKeys.length > 0) return null;
			if (!selectedCategory || !categoryFilters?.length) return null;
			const cf = categoryFilters.find(
				(c) => c.assortmentNumber === selectedCategory,
			);
			return cf?.productCount ?? null;
		}, [
			isMobileSheet,
			localSelectedFilters,
			selectedCategory,
			categoryFilters,
		]);

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

		const categoryListPredicate = (cf: CategoryFilterItem) =>
			!selectedCategory || selectedCategory === cf.assortmentNumber;

		const renderCategoryRows = (
			layout: "desktop" | "mobile",
			cats: CategoryFilterItem[],
		) =>
			(showAllCategories ? cats : cats.slice(0, 5))
				.filter(categoryListPredicate)
				.map((cf) => {
					const isChecked = selectedCategory === cf.assortmentNumber;
					if (layout === "mobile") {
						return (
							<li
								key={cf.assortmentNumber}
								className="flex items-center gap-2 px-4 py-2.5">
								<Checkbox
									id={`${fieldIdPrefix}category-${cf.assortmentNumber}`}
									className="rounded-[4px]"
									checked={isChecked}
									onCheckedChange={() => handleCategorySelect(cf)}
								/>
								<label
									htmlFor={`${fieldIdPrefix}category-${cf.assortmentNumber}`}
									className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									<span className="text-sm leading-[14px] font-medium text-[#0F1912]">
										{cf.nameNo}
									</span>
									<span className="shrink-0 text-sm leading-tight font-normal text-[#6B726F]">
										({cf.productCount})
									</span>
								</label>
							</li>
						);
					}
					return (
						<li
							key={cf.assortmentNumber}
							className="mb-4 flex items-center space-x-2">
							<Checkbox
								id={`${fieldIdPrefix}category-${cf.assortmentNumber}`}
								checked={isChecked}
								onCheckedChange={() => handleCategorySelect(cf)}
							/>
							<label
								htmlFor={`${fieldIdPrefix}category-${cf.assortmentNumber}`}
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
				});

		return (
			<div
				className={cn(
					filterVariants({ variant, size, className }),
					"space-y-4",
					isMobileSheet &&
						"flex min-h-0 flex-1 flex-col gap-0 border-0 bg-transparent !p-0 shadow-none",
				)}
				{...props}>
				<div
					className={cn(
						"space-y-4",
						isMobileSheet &&
							"min-h-0 flex-1 space-y-0 overflow-y-auto pb-2",
					)}>
					{!isMobileSheet &&
					Array.isArray(categoryFilters) &&
					categoryFilters.length > 0 &&
					(!selectedCategory ||
						categoryFilters.some(
							(cf) => cf.assortmentNumber === selectedCategory,
						)) && (
						<div className="space-y-2">
							<h3 className="text-md font-semibold">Kategori</h3>
							<div className="rounded-lg bg-white px-4 py-3 shadow-md">
								<ul className="space-y-1 text-sm">
									{renderCategoryRows("desktop", categoryFilters)}
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

					{isMobileSheet &&
					Array.isArray(categoryFilters) &&
					categoryFilters.length > 0 &&
					(!selectedCategory ||
						categoryFilters.some(
							(cf) => cf.assortmentNumber === selectedCategory,
						)) && (
						<div className="w-full bg-white">
							<button
								type="button"
								onClick={() => setCategorySectionOpen((o) => !o)}
								className="flex w-full items-center justify-between bg-white px-4 py-2.5 text-left">
								<span className="text-sm font-bold text-[#0F1912]">
									Kategori
								</span>
								<ChevronDown
									className={cn(
										"h-4 w-4 shrink-0 text-[#0F1912] transition-transform duration-200",
										categorySectionOpen && "rotate-180",
									)}
								/>
							</button>
							{categorySectionOpen ? (
								<ul className="bg-white">
									{renderCategoryRows("mobile", categoryFilters)}
									{categoryFilters.length > 5 && !selectedCategory ? (
										<li>
											<Button
												variant="link"
												size="sm"
												onClick={() =>
													setShowAllCategories((prev) => !prev)
												}
												className="text-primary h-auto w-full justify-start rounded-none px-4 py-2.5 text-sm font-medium">
												{showAllCategories ? "Vis mindre" : "Vis mer"}
											</Button>
										</li>
									) : null}
								</ul>
							) : null}
						</div>
					)}

					{!isMobileSheet &&
					Array.isArray(categoryFilters) &&
					categoryFilters.length === 0 && (
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

					{isMobileSheet &&
					Array.isArray(categoryFilters) &&
					categoryFilters.length === 0 && (
						<div className="w-full bg-white">
							<button
								type="button"
								onClick={() => setCategorySectionOpen((o) => !o)}
								className="flex w-full items-center justify-between bg-white px-4 py-2.5 text-left">
								<span className="text-sm font-bold text-[#0F1912]">
									Kategori
								</span>
								<ChevronDown
									className={cn(
										"h-4 w-4 shrink-0 text-[#0F1912] transition-transform duration-200",
										categorySectionOpen && "rotate-180",
									)}
								/>
							</button>
							{categorySectionOpen ? (
								<div className="px-4 py-2.5">
									{[0, 1, 2].map((i) => (
										<div
											key={i}
											className="flex items-center gap-2 py-2.5">
											<Skeleton className="h-4 w-4 rounded-[4px]" />
											<Skeleton className="h-4 w-32" />
										</div>
									))}
								</div>
							) : null}
						</div>
					)}

					{isMobileSheet ? (
						<div className="mt-6 flex w-full items-center bg-white px-4 py-2.5">
							<span className="text-sm font-bold text-[#0F1912]">
								{t("Common.attributes")}
							</span>
						</div>
					) : (
						<h3 className="text-md font-semibold">
							{t("Common.attributes")}
						</h3>
					)}

					{!isMobileSheet ? (
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
					) : null}

					{!isMobileSheet && selectedFilterCount > 0 && (
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

					<div
						className={cn(
							!isMobileSheet && "pr-2",
							isMobileSheet && "w-full px-4",
						)}>
						{filteredCategories.length === 0 ? (
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
									className={cn(!isMobileSheet && "space-y-4")}>
									<Accordion
										type="multiple"
										value={openAccordions}
										onValueChange={(val) => {
											const newValue = Array.isArray(val)
												? val
												: val
													? [val]
													: [];
											setOpenAccordions(newValue);
										}}
										className={cn(
											"w-full",
											isMobileSheet && "space-y-1",
										)}>
										{filterCategory.filters.map((filter) => (
											<AccordionItem
												key={filter.key}
												value={filter.key}
												className={isMobileSheet ? "border-0" : undefined}>
												<AccordionTrigger
													className={cn(
														"hover:no-underline",
														isMobileSheet
															? "items-center px-0 py-2.5 text-sm font-medium text-[#0F1912] [&[data-state=open]>svg]:rotate-180"
															: "text-md font-semibold",
													)}>
													{filter.key}
												</AccordionTrigger>
												<AccordionContent
													className={cn(isMobileSheet && "pb-0")}>
													{filter.slider ? (
														<div
															className={cn(isMobileSheet && "py-2.5")}>
															<SliderFilterInput
																filterKey={filter.key}
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
														</div>
													) : filter.values.length > 0 ? (
														<div
															className={cn(
																isMobileSheet ? "space-y-0" : "space-y-2",
																!isMobileSheet && "pl-2",
															)}>
															{(expandedFilters[filter.key]
																? filter.values
																: filter.values.slice(0, 5)
															).map((child) => (
																<div
																	key={child.value}
																	className={cn(
																		"flex items-center justify-between gap-2",
																		isMobileSheet
																			? "py-2.5 font-medium"
																			: "mb-5 space-x-2 font-normal",
																	)}
																	onClick={(e) => e.stopPropagation()}>
																	<Checkbox
																		id={`${fieldIdPrefix}${filter.key}-${child.value}`}
																		className={cn(
																			isMobileSheet && "rounded-[4px]",
																		)}
																		checked={
																			localSelectedFilters[filter.key]?.includes(
																				child.value,
																			) || false
																		}
																		onCheckedChange={() =>
																			handleFilterChange(filter.key, child.value)
																		}
																	/>
																	<label
																		htmlFor={`${fieldIdPrefix}${filter.key}-${child.value}`}
																		className={cn(
																			"flex w-full cursor-pointer justify-between peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
																			isMobileSheet
																				? "items-center gap-3 text-sm font-medium leading-[14px] text-[#0F1912]"
																				: "text-sm leading-none",
																		)}>
																		<span
																			className={cn(isMobileSheet && "min-w-0")}>
																			{child.value}
																		</span>
																		<span
																			className={cn(
																				"text-sm",
																				isMobileSheet
																					? "shrink-0 font-normal leading-tight text-[#6B726F]"
																					: "text-muted-foreground",
																			)}>
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
																			[filter.key]: !prev[filter.key],
																		}))
																	}
																	className={cn(
																		"text-primary px-0 text-sm hover:underline",
																		isMobileSheet &&
																			"h-auto justify-start py-2.5 font-medium",
																	)}>
																	{expandedFilters[filter.key]
																		? "Vis mindre"
																		: "Vis mer"}
																</Button>
															)}
														</div>
													) : (
														<div
															className={cn(
																"text-muted-foreground text-sm italic",
																isMobileSheet ? "py-2.5 pl-0" : "pl-2",
															)}>
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

				{isMobileSheet && onMobileSheetDone ? (
					<div className="bg-background shrink-0 px-4 pt-5 pb-8">
						<Button
							type="button"
							variant="outlineGreen"
							className="h-11 w-full rounded-lg text-sm font-medium"
							onClick={onMobileSheetDone}>
							{mobileSheetResultsCountLabel
								? `${t("ProductList.showAllResults")} (${mobileSheetResultsCountLabel})`
								: t("ProductList.showAllResults")}
						</Button>
					</div>
				) : null}
			</div>
		);
	},
);

Filter.displayName = "Filter";
