"use client";

import { useProductFilter } from "@/hooks/useProductFilter";
import { cn } from "@/lib/utils";
import { IProduct } from "@/types/product.types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";
import { Filter, FilterCategory } from "../ui/filter";

interface ProductGridProps {
	initialProducts: IProduct[];
	variant?: "default" | "compact";
	filters: FilterCategory[];
	categoryNumber: string;
}

export function ProductGrid({
	initialProducts,
	variant = "default",
	filters,
	categoryNumber,
}: ProductGridProps) {
	const t = useTranslations();
	const pathname = usePathname();

	const { products, isLoading, handleFilterChange } =
		useProductFilter({
			initialProducts,
			categoryNumber,
		});

	return (
		<div className="flex flex-col gap-8 lg:flex-row">
			{/* Sidebar Filter */}
			<aside className="lg:w-1/4">
				<Filter filters={filters} onFilterChange={handleFilterChange} />
			</aside>

			{/* Product Grid */}
			<div className="flex-1">
				<div
					className={cn(
						"grid gap-6",
						variant === "compact"
							? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
							: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
					)}>
					{isLoading ? (
						<div>Loading...</div>
					) : products.length > 0 ? (
						products.map((product) => (
							<Link
								key={product.product_number}
								href={`${pathname}/${product.product_number}`}>
								<ProductCard
									{...product}
									variant={variant}
								/>
							</Link>
						))
					) : (
						<div className="text-muted-foreground flex h-[400px] items-center justify-center">
							{t("category.noResults")}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
