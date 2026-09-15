"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useProductFilter } from "@/hooks/useProductFilter";
import { useProductPrices } from "@/hooks/useProductPrices";
import { usePathname } from "@/i18n/navigation";
import { setProductReturnTarget } from "@/lib/productReturnNavigation";
import { cn } from "@/lib/utils";
import { FilterCategory, FilterValues } from "@/types/filter.types";
import { LayoutGrid, AlignJustify, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { FilterChip } from "./filter-chip";
import { ProductCard } from "./product-card";
import { Button } from "../ui/button";
import { Filter } from "../ui/filter";

interface ProductGridProps {
	variant?: "default" | "compact";
	filters: FilterCategory[];
	categoryNumber: string;
	categoryName?: string;
	query: string | null;
	categoryFilters?: {
		assortmentNumber?: string;
		categoryNumber?: string;
		nameNo: string;
		nameEn: string;
		productCount: number;
		flag?: boolean;
	}[];
}

export function ProductGrid({
	variant = "default",
	filters,
	categoryNumber,
	categoryName,
	query,
	categoryFilters,
}: ProductGridProps) {
	const t = useTranslations();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data: profile } = useGetProfileData();
	const [isFiltering, setIsFiltering] = useState(false);
	const [viewLayout, setViewLayout] = useState<string>("grid");
	const observerTarget = useRef<HTMLDivElement>(null);
	const [filtersState, setFiltersState] = useState(filters);
	const [categoryFiltersState, setCategoryFiltersState] = useState(
		categoryFilters ?? [],
	);
	const isLoadingMoreRef = useRef(false);
	const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const {
		products,
		isLoading,
		isFetchingNextPage,
		hasMore,
		handleFilterChange,
		loadMore,
		handleSortChange,
		selectedFilters,
		removeFilter,
		handleCategoryChange,
		selectedCategoryIds,
		selectedCategoryChips,
		toggleCategory,
		removeCategory,
	} = useProductFilter({
		categoryNumber,
		categoryName,
		query,
		onFiltersUpdate: setFiltersState,
		onCategoriesUpdate: setCategoryFiltersState,
	});

	// Use React Query for prices - much faster with caching
	const { prices: productPrices, isFetching: isFetchingPrices } =
		useProductPrices({
			productNumbers: products.map((p) => p.productNumber),
			customerNumber: profile?.defaultCustomerNumber,
			companyNumber: profile?.defaultCompanyNumber,
			warehouseNumber: profile?.defaultWarehouseNumber,
			enabled: !!profile?.defaultCustomerNumber && products.length > 0,
		});

	const onFilterChange = useCallback(
		(newFilters: FilterValues[]) => {
			// Show skeletons in the filter panel while updated filters load
			setIsFiltering(true);
			setFiltersState([]);
			setCategoryFiltersState([]);
			handleFilterChange(newFilters);
			setIsFiltering(false);
		},
		[handleFilterChange],
	);

	// Map attributeIdentifier → display name so filter chips can show the
	// localized name while state/URL/payload stay keyed on the stable identifier.
	const filterLabelByIdentifier = useMemo(() => {
		const map: Record<string, string> = {};
		filtersState.forEach((fc) => {
			fc.filters.forEach((f) => {
				if (f.attributeIdentifier) map[f.attributeIdentifier] = f.key;
			});
		});
		return map;
	}, [filtersState]);

	const getFilterLabel = (key: string) => {
		if (key === "category") return "Kategori";
		return filterLabelByIdentifier[key] ?? key;
	};

	useEffect(() => {
		if (filters.length > 0) {
			setFiltersState(filters);
		}
		if (categoryFilters && categoryFilters.length > 0) {
			setCategoryFiltersState(categoryFilters);
		}
		// Reset loading state when filters or query change
		isLoadingMoreRef.current = false;
		if (loadMoreTimeoutRef.current) {
			clearTimeout(loadMoreTimeoutRef.current);
			loadMoreTimeoutRef.current = null;
		}
	}, [filters, query]);

	useEffect(() => {
		if (!isLoading) {
			setIsFiltering(false);
		}
	}, [isLoading]);

	useEffect(() => {
		const target = observerTarget.current;
		if (!target) return;

		// Clear any pending timeout
		if (loadMoreTimeoutRef.current) {
			clearTimeout(loadMoreTimeoutRef.current);
			loadMoreTimeoutRef.current = null;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (
					entry.isIntersecting &&
					hasMore &&
					!isLoading &&
					!isFetchingNextPage &&
					!isLoadingMoreRef.current
				) {
					// Use requestAnimationFrame to ensure smooth scrolling
					requestAnimationFrame(() => {
						if (isLoadingMoreRef.current) return;

						// Small delay to prevent interrupting scroll momentum
						loadMoreTimeoutRef.current = setTimeout(() => {
							if (
								isLoadingMoreRef.current ||
								!hasMore ||
								isLoading ||
								isFetchingNextPage
							) {
								if (loadMoreTimeoutRef.current) {
									loadMoreTimeoutRef.current = null;
								}
								return;
							}
							isLoadingMoreRef.current = true;

							loadMore().finally(() => {
								isLoadingMoreRef.current = false;
								loadMoreTimeoutRef.current = null;
							});
						}, 100);
					});
				}
			},
			{
				rootMargin: "300px", // Start loading well before reaching the bottom
				threshold: 0.1,
			},
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
			if (loadMoreTimeoutRef.current) {
				clearTimeout(loadMoreTimeoutRef.current);
				loadMoreTimeoutRef.current = null;
			}
		};
	}, [hasMore, isLoading, isFetchingNextPage, loadMore]);

	return (
		<div className="flex flex-col gap-8 lg:flex-row">
			<aside className="w-full pr-4 lg:w-1/4">
				<Filter
					filters={filtersState}
					variant="default"
					size="default"
					onFilterChange={(newFilters) => {
						onFilterChange(newFilters);
					}}
					selectedFilters={selectedFilters}
					categoryFilters={categoryFiltersState}
					query={query}
					categoryNumber={categoryNumber}
					categoryName={categoryName}
					handleCategoryChange={(newCategoryNumber, newCategoryName) =>
						handleCategoryChange(
							newCategoryNumber,
							newCategoryName,
							setFiltersState,
						)
					}
					selectedCategoryIds={selectedCategoryIds}
					onToggleCategory={toggleCategory}
				/>
			</aside>

			<div className="flex-1">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
					<h2 className="text-2xl font-semibold">{query}</h2>

					<div className="flex shrink-0 items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setViewLayout("list")}
							size="icon"
							className={cn(
								"h-8 w-8 border",
								viewLayout === "list"
									? "border-neutral-800"
									: "border-neutral-300",
							)}>
							<AlignJustify
								className={cn(
									"h-4 w-4",
									viewLayout === "list"
										? "text-neutral-800"
										: "text-neutral-500",
								)}
							/>
						</Button>

						<Button
							variant="outline"
							onClick={() => setViewLayout("grid")}
							size="icon"
							className={cn(
								"h-8 w-8 border",
								viewLayout === "grid"
									? "border-neutral-800"
									: "border-neutral-300",
							)}>
							<LayoutGrid
								className={cn(
									"h-4 w-4",
									viewLayout === "grid"
										? "text-neutral-800"
										: "text-neutral-500",
								)}
							/>
						</Button>
					</div>
				</div>

				<div className="mb-4 flex items-center justify-between align-middle">
					<div className="flex flex-wrap gap-2">
						{/* PBI2940 multi-select category chips — driven by
						 * `selectedCategoryChips` from the Set-based selection.
						 * Rendered first so they appear ahead of attribute
						 * filters. Removal calls `removeCategory(id)` which
						 * updates the Set and URL in one shot. */}
						{selectedCategoryChips.map((chip) => (
							<FilterChip
								key={`category-${chip.id}`}
								label="Kategori"
								value={chip.name}
								onRemove={() => removeCategory(chip.id)}
							/>
						))}
						{Object.entries(selectedFilters).map(([key, values]) => {
							// Range filter: two distinct numeric bounds → one chip.
							const isRangeFilter =
								values.length === 2 &&
								values.every((val) => !isNaN(Number(val))) &&
								values[0] !== values[1];

							if (isRangeFilter) {
								return (
									<FilterChip
										key={`${key}-range`}
										label={getFilterLabel(key)}
										value={`${values[0]} - ${values[1]}`}
										onRemove={() => {
											setFiltersState([]);
											setCategoryFiltersState([]);
											values.forEach((value) => removeFilter(key, value));
										}}
									/>
								);
							}

							const label = getFilterLabel(key);
							return values
								.filter((value) => !!value)
								.map((value) => (
									<FilterChip
										key={`${key}-${value}`}
										label={label}
										value={value}
										onRemove={() => {
											setFiltersState([]);
											setCategoryFiltersState([]);
											removeFilter(key, value);
										}}
									/>
								));
						})}
					</div>
				</div>
				<div
					className={cn(
						"grid items-stretch gap-6",
						variant === "compact"
							? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
							: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
						viewLayout === "list" && "lg:grid-cols-1",
					)}>
					{isFiltering || isLoading ? (
						<>
							{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
								<div
									key={i}
									className="group relative space-y-4">
									<Skeleton className="aspect-square w-full rounded-lg" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
										<Skeleton className="h-4 w-1/4" />
									</div>
								</div>
							))}
						</>
					) : products.length > 0 ? (
						products.map((product, idx) => {
							const { attributes } = product as any;
							const searchAttribute1 =
								product.searchAttribute1 || attributes?.searchAttribute1;
							const searchAttribute2 =
								product.searchAttribute2 || attributes?.searchAttribute2;
							const productPrice = productPrices[product.productNumber];
							// Show loading skeleton if we're fetching and don't have the price yet
							const isPriceLoading =
								isFetchingPrices && productPrice === undefined;

							// Only preserve search params when on category pages (not search pages)
							// This prevents 431 errors from overly long URLs when coming from search
							const encodedProductNumber = encodeURIComponent(product.productNumber);
							const productHref = query
								? `${pathname}/${encodedProductNumber}`
								: searchParams.toString()
									? `${pathname}/${encodedProductNumber}?${searchParams.toString()}`
									: `${pathname}/${encodedProductNumber}`;

							return (
								<Link
									key={product.productNumber}
									href={productHref}
									className="h-full"
									onClick={() => {
										const qs = searchParams.toString();
										const listingPath = qs
											? `${pathname}?${qs}`
											: pathname;
										setProductReturnTarget(listingPath, {
											scrollY:
												document.getElementById("app-scroll-container")
													?.scrollTop ?? window.scrollY,
										});
									}}>
									<ProductCard
										{...product}
										searchAttribute1={searchAttribute1}
										searchAttribute2={searchAttribute2}
										price={productPrice}
										isPriceLoading={isPriceLoading}
										variant={variant}
										viewLayout={viewLayout}
										priority={idx < 4}
									/>
								</Link>
							);
						})
					) : (
						<div
							className={cn(
								"text-muted-foreground flex h-[400px] items-center justify-center",
								variant === "compact"
									? "col-span-2 sm:col-span-3 lg:col-span-4"
									: "col-span-1 sm:col-span-2 lg:col-span-3",
								viewLayout === "list" && "lg:col-span-1",
							)}>
							{t("Category.noResults")}
						</div>
					)}
				</div>
				<div
					ref={observerTarget}
					className="flex min-h-[200px] items-center justify-center py-8">
					{hasMore && (isLoading || isFetchingNextPage) && !isFiltering ? (
						<div className="text-muted-foreground flex items-center gap-2">
							<svg
								fill="#00b84c"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6">
								<path
									d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
									opacity=".25"
								/>
								<path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
									<animateTransform
										attributeName="transform"
										type="rotate"
										dur="0.75s"
										values="0 12 12;360 12 12"
										repeatCount="indefinite"
									/>
								</path>
							</svg>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
