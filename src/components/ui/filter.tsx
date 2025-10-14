"use client";

import * as React from "react";
import { useCallback, useMemo, useImperativeHandle } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
	loadFilterChildren,
	loadFilterParents,
} from "@/services/categories.service";
import type {
	FilterValues,
	FilterChildrenResponse,
	SliderConfig,
} from "@/types/filter.types";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Slider, SliderTrack, SliderRange, SliderThumb } from "./slider";

export interface FilterCategory {
	category: string;
	filters: FilterValues[];
	categoryNumber?: string;
}

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
	{ clearRangeFilter: (filterKey: string) => void },
	FilterProps
>(({
	className,
	variant,
	size,
	filters,
	onFilterChange,
	selectedFilters: externalSelectedFilters = {},
	categoryNumber,
	language,
	categoryFilters,
	handleCategoryChange,
	query,
	...props
}, ref) => {
	const t = useTranslations();
	const [searchTerm, setSearchTerm] = React.useState("");
	const [showAllCategories, setShowAllCategories] = React.useState(false);
	const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
		null,
	);
	const [localSelectedFilters, setLocalSelectedFilters] = React.useState<
		Record<string, string[]>
	>(externalSelectedFilters);

	const [openAccordion, setOpenAccordion] = React.useState<string | undefined>(
		undefined,
	);

	const [loadingChildrenKeys, setLoadingChildrenKeys] = React.useState<
		Set<string>
	>(new Set());

	const [loadedChildren, setLoadedChildren] = React.useState<
		Record<string, FilterChildrenResponse>
	>({});

	const [rangeValues, setRangeValues] = React.useState<
		Record<string, [number, number]>
	>({});

	const [tempRangeValues, setTempRangeValues] = React.useState<
		Record<string, [number, number]>
	>({});

	const selectedFilters = externalSelectedFilters;

	React.useEffect(() => {
		setLocalSelectedFilters(externalSelectedFilters);
	}, [externalSelectedFilters]);

	React.useEffect(() => {
		// Reset filters when query changes
		setLocalSelectedFilters({});
		setSelectedCategory(null);
		setOpenAccordion(undefined);
		setLoadedChildren({});
	}, [query]);

	const handleCategorySelect = (cf: CategoryFilterItem) => {
		setOpenAccordion(undefined);

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

			await loadFilterParents({
				categoryNumber: selectedCategory || categoryNumber,
				searchTerm: query,
				language: "no",
				filters: filterArray,
			});

			await loadChildrenForFilter(
				filterKey,
				selectedCategory || categoryNumber,
				filterArray,
			);

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

	// Debounced effect for range changes
	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			Object.entries(tempRangeValues).forEach(([filterKey, values]) => {
				if (rangeValues[filterKey]?.toString() !== values.toString()) {
					handleRangeChangeDebounced(filterKey, values);
				}
			});
		}, 300); // 300ms debounce

		return () => clearTimeout(timeoutId);
	}, [tempRangeValues]);

	const handleRangeChangeDebounced = useCallback(
		async (filterKey: string, values: [number, number]) => {
			setRangeValues((prev) => ({
				...prev,
				[filterKey]: values,
			}));

			// Check if range is at full range (min to max) - if so, clear the filter
			const children = loadedChildren[filterKey];
			if (children?.slider) {
				const isFullRange = values[0] === children.slider.min && values[1] === children.slider.max;
				
				if (isFullRange) {
					// Remove the filter entirely
					const updatedFilters = { ...localSelectedFilters };
					delete updatedFilters[filterKey];
					setLocalSelectedFilters(updatedFilters);

					const filterArray: FilterValues[] = Object.entries(updatedFilters)
						.filter(([key, values]) => key !== "category" && values.length > 0)
						.map(([key, values]) => ({ key, values }));

					await loadFilterParents({
						categoryNumber: selectedCategory || categoryNumber,
						searchTerm: query,
						language: "no",
						filters: filterArray,
					});

					await loadChildrenForFilter(
						filterKey,
						selectedCategory || categoryNumber,
						filterArray,
					);

					onFilterChange(filterArray);
					return;
				}
			}

			// Send range values as separate values separated by comma
			const updatedFilters = {
				...localSelectedFilters,
				[filterKey]: [values[0].toString(), values[1].toString()],
			};

			setLocalSelectedFilters(updatedFilters);

			const filterArray: FilterValues[] = Object.entries(updatedFilters)
				.filter(([key, values]) => key !== "category" && values.length > 0)
				.map(([key, values]) => ({ key, values }));

			await loadFilterParents({
				categoryNumber: selectedCategory || categoryNumber,
				searchTerm: query,
				language: "no",
				filters: filterArray,
			});

			await loadChildrenForFilter(
				filterKey,
				selectedCategory || categoryNumber,
				filterArray,
			);

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

	const handleRangeChange = useCallback(
		(filterKey: string, values: [number, number]) => {
			const children = loadedChildren[filterKey];
			if (!children?.values) return;

			// Extract available values and sort them
			const availableValues = children.values
				.map(child => {
					// Handle values like "15, 20" by taking the first number
					const firstValue = child.value.split(',')[0].trim();
					return parseFloat(firstValue);
				})
				.filter(val => !isNaN(val))
				.sort((a, b) => a - b);

			if (availableValues.length === 0) return;

			// Find the closest available values
			const findClosestValue = (target: number) => {
				return availableValues.reduce((closest, current) => {
					return Math.abs(current - target) < Math.abs(closest - target) ? current : closest;
				});
			};

			const snappedValues: [number, number] = [
				findClosestValue(values[0]),
				findClosestValue(values[1])
			];

			if (snappedValues[0] > snappedValues[1]) {
				snappedValues[0] = snappedValues[1];
			}

			setTempRangeValues((prev) => ({
				...prev,
				[filterKey]: snappedValues,
			}));
		},
		[loadedChildren],
	);

	const clearRangeFilter = useCallback(
		async (filterKey: string) => {
			// Reset range values to full range
			const children = loadedChildren[filterKey];
			if (children?.slider) {
				const fullRange: [number, number] = [children.slider.min, children.slider.max];
				setRangeValues((prev) => ({
					...prev,
					[filterKey]: fullRange,
				}));
				setTempRangeValues((prev) => ({
					...prev,
					[filterKey]: fullRange,
				}));

				// Remove the filter from selected filters
				const updatedFilters = { ...localSelectedFilters };
				delete updatedFilters[filterKey];
				setLocalSelectedFilters(updatedFilters);

				const filterArray: FilterValues[] = Object.entries(updatedFilters)
					.filter(([key, values]) => key !== "category" && values.length > 0)
					.map(([key, values]) => ({ key, values }));

				await loadFilterParents({
					categoryNumber: selectedCategory || categoryNumber,
					searchTerm: query,
					language: "no",
					filters: filterArray,
				});

				await loadChildrenForFilter(
					filterKey,
					selectedCategory || categoryNumber,
					filterArray,
				);

				onFilterChange(filterArray);
			}
		},
		[loadedChildren, localSelectedFilters, selectedCategory, categoryNumber, query, onFilterChange],
	);

	const resetFilters = useCallback(() => {
		setRangeValues({});
		setTempRangeValues({});
		onFilterChange([]);
	}, [onFilterChange]);

	const selectedFilterCount = Object.values(selectedFilters).reduce(
		(acc, values) => acc + values.length,
		0,
	);

	// Expose clearRangeFilter function to parent component
	useImperativeHandle(ref, () => ({
		clearRangeFilter: (filterKey: string) => {
			clearRangeFilter(filterKey);
		},
	}), [clearRangeFilter]);

	const loadChildrenForFilter = async (
		attributeKey: string,
		categoryNumberFromCategory?: string,
		filters: FilterValues[] = [],
	) => {
		const effectiveCategoryNumber =
			categoryNumberFromCategory || categoryNumber;
		const effectiveSearchTerm = query || searchTerm;

		setLoadingChildrenKeys((prev) => new Set(prev).add(attributeKey));

		try {
			const result: FilterChildrenResponse = await loadFilterChildren({
				attributeKey,
				categoryNumber: effectiveCategoryNumber,
				searchTerm: effectiveSearchTerm,
				language: "no",
				filters,
			});

			const normalized: FilterChildrenResponse =
				Array.isArray(result) && result.length === 0
					? { attributeKey, values: [] }
					: result;

			setLoadedChildren((prev) => ({
				...prev,
				[attributeKey]: normalized,
			}));

			if (normalized.slider && !rangeValues[attributeKey]) {
				// Extract available values and use first and last as initial range
				const availableValues = normalized.values
					.map(child => {
						const firstValue = child.value.split(',')[0].trim();
						return parseFloat(firstValue);
					})
					.filter(val => !isNaN(val))
					.sort((a, b) => a - b);

				if (availableValues.length > 0) {
					const initialRange: [number, number] = [
						availableValues[0],
						availableValues[availableValues.length - 1]
					];
					
					setRangeValues((prev) => ({
						...prev,
						[attributeKey]: initialRange,
					}));
				} else {
					setRangeValues((prev) => ({
						...prev,
						[attributeKey]: [normalized.slider!.min, normalized.slider!.max],
					}));
				}
			}
		} catch (error) {
			console.error("Failed to load filter children:", error);
		} finally {
			setLoadingChildrenKeys((prev) => {
				const newSet = new Set(prev);
				newSet.delete(attributeKey);
				return newSet;
			});
		}
	};

	const filteredCategories = React.useMemo(() => {
		if (!searchTerm) return filters;

		return filters
			.map((filterCategory) => {
				const filteredFilters = filterCategory.filters.filter((filter) => {
					const children = loadedChildren[filter.key]?.values || [];

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
	}, [filters, searchTerm, loadedChildren]);

	return (
		<div
			className={cn(filterVariants({ variant, size, className }), "space-y-4")}
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
										const isChecked = selectedCategory === cf.assortmentNumber;
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
				{filteredCategories.map((filterCategory) => (
					<div
						key={filterCategory.category}
						className="space-y-4">
						<Accordion
							type="single"
							collapsible
							value={openAccordion}
							onValueChange={(val) => setOpenAccordion(val)}
							className="w-full">
							{filterCategory.filters.map((filter) => {
								const children = loadedChildren[filter.key];

								return (
									<AccordionItem
										key={filter.key}
										value={filter.key}
										className="border-b">
										<AccordionTrigger
											className="text-md font-semibold hover:no-underline"
											onClick={() => {
												setOpenAccordion(filter.key);
												loadChildrenForFilter(
													filter.key,
													selectedCategory || categoryNumber,
													Object.entries(selectedFilters)
														.filter(
															([key, values]) =>
																key !== "category" && values.length > 0,
														)
														.map(([key, values]) => ({ key, values })),
												);
											}}>
											{filter.key}
										</AccordionTrigger>
										<AccordionContent className="pt-2">
											{loadingChildrenKeys.has(filter.key) ? (
												<>
													<Skeleton className="mb-2 h-4 w-32" />
													<Skeleton className="mb-2 h-4 w-32" />
													<Skeleton className="mb-2 h-4 w-32" />
												</>
											) : children ? (
												children.slider ? (
													<div className="space-y-4 pl-2">
														<div className="space-y-2">
															<div className="text-muted-foreground flex justify-between text-sm">
																<span>
																	{children.slider.min}
																</span>
																<span>
																	{children.slider.max}
																</span>
															</div>
															<Slider
																value={
																	tempRangeValues[filter.key] || 
																	rangeValues[filter.key] || [
																		children.slider.min,
																		children.slider.max,
																	]
																}
																onValueChange={(values) =>
																	handleRangeChange(
																		filter.key,
																		values as [number, number],
																	)
																}
																min={children.slider.min}
																max={children.slider.max}
																step={1}
																className="w-full"
															>
																<SliderTrack>
																	<SliderRange />
																</SliderTrack>
																<SliderThumb />
																<SliderThumb />
															</Slider>
															<div className="flex items-center justify-between text-sm font-medium">
																<span>
																	{tempRangeValues[filter.key]?.[0] ||
																		rangeValues[filter.key]?.[0] ||
																		children.slider.min}
																</span>
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => clearRangeFilter(filter.key)}
																	className="h-6 px-2 text-xs"
																>
																	Clear
																</Button>
																<span>
																	{tempRangeValues[filter.key]?.[1] ||
																		rangeValues[filter.key]?.[1] ||
																		children.slider.max}
																</span>
															</div>
														</div>
													</div>
												) : children.values.length > 0 ? (
													<div className="space-y-2 pl-2">
														{children.values.map((child) => (
															<div
																key={child.value}
																className="mb-5 flex items-center justify-between space-x-2 font-normal">
																<Checkbox
																	id={`${filter.key}-${child.value}`}
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
																	htmlFor={`${filter.key}-${child.value}`}
																	className="flex w-full cursor-pointer justify-between text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
																	<span>{child.value}</span>
																	<span className="text-muted-foreground">
																		{child.productcount}
																	</span>
																</label>
															</div>
														))}
													</div>
												) : (
													<div className="text-muted-foreground pl-2 text-sm italic">
														Ingen alternativer tilgjengelig.
													</div>
												)
											) : (
												<div className="text-muted-foreground pl-2 text-sm">
													Laster...
												</div>
											)}
										</AccordionContent>
									</AccordionItem>
								);
							})}
						</Accordion>
					</div>
				))}
			</div>
		</div>
	);
});

Filter.displayName = "Filter";
