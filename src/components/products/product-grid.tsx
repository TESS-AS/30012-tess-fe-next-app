"use client";

import { useEffect, useRef, useCallback, useState } from "react";

import { useProductFilter } from "@/hooks/useProductFilter";
import { cn } from "@/lib/utils";
import { FilterValues } from "@/types/filter.types";
import { LayoutGrid, AlignJustify, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";
import { Button } from "../ui/button";
import { Filter, FilterCategory } from "../ui/filter";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "../ui/tooltip";

interface ProductGridProps {
	variant?: "default" | "compact";
	filters: FilterCategory[];
	categoryNumber: string;
	query: string | null;
}

const SORT_OPTIONS = [
	{ value: " ", label: "Sort By" },
	{ value: "ALPHABETICAL", label: "A-Z" },
	{ value: "ALPHABETICAL_DESC", label: "Z-A" },
	{ value: "oldest", label: "Oldest" },
	{ value: "lowest", label: "Lowest" },
	{ value: "highest", label: "Highest" },
];

export function ProductGrid({
	variant = "default",
	filters,
	categoryNumber,
	query,
}: ProductGridProps) {
	const t = useTranslations();
	const pathname = usePathname();
	const [isFiltering, setIsFiltering] = useState(false);
	const [viewLayout, setViewLayout] = useState<string>("");
	const observerTarget = useRef<HTMLDivElement>(null);
	const [sort, setSort] = useState<string>("");

	const {
		products,
		isLoading,
		hasMore,
		handleFilterChange,
		loadMore,
		handleSortChange,
		selectedFilters,
		removeFilter,
	} = useProductFilter({
		categoryNumber,
		query,
	});

	const onFilterChange = useCallback(
		async (newFilters: FilterValues[]) => {
			setIsFiltering(true);
			await handleFilterChange(newFilters);
			setIsFiltering(false);
		},
		[handleFilterChange],
	);

	useEffect(() => {
		// Reset isFiltering when loading is complete
		if (!isLoading) {
			setIsFiltering(false);
		}
	}, [isLoading]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMore();
				}
			},
			{
				rootMargin: "200px",
				threshold: 0.1,
			},
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget?.current);
			}
		};
	}, [hasMore, isLoading, loadMore]);

	const onSortChange = (value: string) => {
		setSort(value);
		handleSortChange(value);
	};

	return (
		<div className="flex flex-col gap-8 lg:flex-row">
			{/* Sidebar */}
			<aside className="lg:w-1/4">
				<Filter
					filters={filters}
					className="sticky top-4"
					variant="default"
					size="default"
					onFilterChange={(newFilters) => {
						onFilterChange(newFilters);
					}}
					selectedFilters={selectedFilters}
				/>
			</aside>

			{/* Product Grid */}
			<div className="flex-1">
				{/* Active Filters */}
				{Object.keys(selectedFilters).length > 0 && (
					<div className="mb-4 flex flex-wrap gap-2">
						{Object.entries(selectedFilters).map(([key, values]) =>
							values.map((value) => (
								<div
									key={`${key}-${value}`}
									className="bg-primary/10 flex items-center gap-1 rounded-full px-3 py-1 text-sm">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="flex items-center gap-1">
													<span className="max-w-[100px] truncate font-medium">
														{key}:
													</span>
													<span className="max-w-[100px] truncate">
														{value}
													</span>
												</div>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{key}: {value}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
									<button
										onClick={() => removeFilter(key, value)}
										className="hover:bg-primary/20 ml-1 rounded-full p-0.5">
										<X className="h-3 w-3" />
									</button>
								</div>
							)),
						)}
					</div>
				)}

				{/* Controls */}
				<div className="mb-4 flex items-center justify-between">
					<Select
						value={sort}
						onValueChange={onSortChange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder={t("Common.sort")} />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setViewLayout("list")}
							size="icon"
							className="h-8 w-8">
							<AlignJustify className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							onClick={() => setViewLayout("grid")}
							size="icon"
							className="h-8 w-8">
							<LayoutGrid className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div
					className={cn(
						"grid gap-6",
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
						products.map((product, idx) => (
							<Link
								key={idx}
								href={`${pathname}/${product.productNumber}`}>
								<ProductCard
									{...product}
									variant={variant}
									viewLayout={viewLayout}
									priority={idx < 4}
								/>
							</Link>
						))
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
					className={cn("min-h-0", hasMore && "min-h-[400px]")}>
					{isLoading && hasMore && !isFiltering && (
						<div
							className={cn(
								"mt-6 grid gap-6",
								variant === "compact"
									? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
									: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
								viewLayout === "list" && "lg:grid-cols-1",
							)}>
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
						</div>
					)}
				</div>

				{/* No more products message */}
				{!isLoading && !hasMore && products.length > 9 && (
					<div className="text-muted-foreground mt-8 text-center">
						No more products to load
					</div>
				)}
			</div>
		</div>
	);
}
