"use client";

import { Filter } from "@/components/ui/filter";
import { useProductFilter } from "@/hooks/useProductFilter";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/mocks/mockProducts";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";

interface ProductGridProps {
	initialProducts: typeof mockProducts;
	variant?: "default" | "compact";
}

export function ProductGrid({
	initialProducts,
	variant = "default",
}: ProductGridProps) {
	const t = useTranslations();
	const { filteredProducts, handleFilterChange } =
		useProductFilter(initialProducts);

	return (
		<div className="flex flex-col gap-8 lg:flex-row">
			{/* Sidebar Filter */}
			<aside className="lg:w-1/4">
				<Filter onFilterChange={handleFilterChange} />
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
					{filteredProducts.map((product) => (
						<ProductCard
							key={product.id}
							{...product}
							href={`/${product.category}/${product.id}`}
							variant={variant}
						/>
					))}
				</div>

				{filteredProducts.length === 0 && (
					<div className="text-muted-foreground flex h-[400px] items-center justify-center">
						{t("category.noResults")}
					</div>
				)}
			</div>
		</div>
	);
}
