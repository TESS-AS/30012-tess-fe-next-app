"use client";

import * as React from "react";
import { useCallback } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	loadFilterChildren,
	loadFilterParents,
} from "@/services/categories.service";
import type { FilterValues } from "@/types/filter.types";
import { cva, type VariantProps } from "class-variance-authority";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./button";
import { Checkbox } from "./checkbox";

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

export function Filter({
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
}: FilterProps) {
	const t = useTranslations();
	const [searchTerm, setSearchTerm] = React.useState("");
	const [showAllCategories, setShowAllCategories] = React.useState(false);
	const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
		null,
	);

	const [loadedChildren, setLoadedChildren] = React.useState<
		Record<
			string,
			{
				attributeKey: string;
				values: { value: string; productcount: string }[];
			}
		>
	>({});

	const selectedFilters = externalSelectedFilters;

	React.useEffect(() => {
		if (
			!selectedFilters["category"] ||
			selectedFilters["category"].length === 0
		) {
			setSelectedCategory(null);
		}
	}, [selectedFilters]);

	const handleCategorySelect = (cf: CategoryFilterItem) => {
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
			const currentValues = selectedFilters?.[filterKey] || [];
			let updatedValues: string[];

			if (currentValues.includes(value)) {
				updatedValues = currentValues.filter((v) => v !== value);
			} else {
				updatedValues = [...currentValues, value];
			}

			const updatedFilters: Record<string, string[]> = {
				...selectedFilters,
				[filterKey]: updatedValues,
			};

			if (updatedValues.length === 0) {
				delete updatedFilters[filterKey];
			}

			const filterArray: FilterValues[] = Object.entries(updatedFilters)
				.filter(([key, values]) => key !== "category" && values.length > 0)
				.map(([key, values]) => ({
					key,
					values,
				}));

			await loadFilterParents({
				categoryNumber,
				searchTerm: query,
				language: "no",
				filters: filterArray,
			});

			onFilterChange(filterArray);
		},
		[onFilterChange, selectedFilters, categoryNumber, query],
	);

	const resetFilters = useCallback(() => {
		onFilterChange([]);
	}, [onFilterChange]);

	const selectedFilterCount = Object.values(selectedFilters).reduce(
		(acc, values) => acc + values.length,
		0,
	);

	const loadChildrenForFilter = async (
		attributeKey: string,
		categoryNumberFromCategory?: string,
	) => {
		const effectiveCategoryNumber =
			categoryNumberFromCategory || categoryNumber;
		const effectiveSearchTerm = query || searchTerm;

		try {
			const result = await loadFilterChildren({
				attributeKey,
				categoryNumber: effectiveCategoryNumber,
				searchTerm: effectiveSearchTerm,
				language: "no",
			});

			const normalized =
				Array.isArray(result) && result.length === 0
					? { attributeKey, values: [] }
					: result;

			setLoadedChildren((prev) => ({
				...prev,
				[attributeKey]: normalized,
			}));
		} catch (error) {
			console.error("Failed to load filter children:", error);
		}
	};

	const filteredCategories = React.useMemo(() => {
		return filters
			.map((filterCategory) => ({
				...filterCategory,
				filters: filterCategory.filters.filter((filter) =>
					filter.key.toLowerCase().includes(searchTerm.toLowerCase()),
				),
			}))
			.filter((category) => category.filters.length > 0);
	}, [filters, searchTerm]);

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
												className="flex items-center space-x-2">
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
									className="text-primary mt-2 px-0 text-sm hover:underline">
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
							type="multiple"
							className="w-full">
							{filterCategory.filters.map((filter) => {
								const children = loadedChildren[filter.key];

								return (
									<AccordionItem
										key={filter.key}
										value={filter.key}
										className="border-b">
										<AccordionTrigger
											className="text-sm font-medium hover:no-underline"
											onClick={() =>
												loadChildrenForFilter(
													filter.key,
													filterCategory.categoryNumber,
												)
											}>
											{filter.key}
										</AccordionTrigger>
										<AccordionContent className="pt-2">
											{children ? (
												children.values.length > 0 ? (
													<div className="space-y-2 pl-2">
														{children.values.map((child) => (
															<div
																key={child.value}
																className="flex items-center space-x-2">
																<Checkbox
																	id={`${filter.key}-${child.value}`}
																	checked={
																		selectedFilters[filter.key]?.includes(
																			child.value,
																		) || false
																	}
																	onCheckedChange={() =>
																		handleFilterChange(filter.key, child.value)
																	}
																/>
																<label
																	htmlFor={`${filter.key}-${child.value}`}
																	className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
																	{child.value} ({child.productcount})
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
}
