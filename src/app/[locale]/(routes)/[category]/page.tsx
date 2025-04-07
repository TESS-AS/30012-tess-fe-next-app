"use client";

import { use, useState } from "react";

import { Filter } from "@/components/ui/filter";
import { mockProducts } from "@/mocks/mockProducts";
import { FilterValues } from "@/types/filter.types";

interface Params {
	category: string;
}

export default function CategoryPage({ params }: { params: Promise<Params> }) {
	const { category } = use(params);
	const [filteredProducts, setFilteredProducts] = useState(mockProducts);

	const handleFilterChange = (filters: FilterValues) => {
		const filtered = mockProducts.filter((product) => {
			if (
				filters.search &&
				!product.name.toLowerCase().includes(filters.search.toLowerCase())
			) {
				return false;
			}
			if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
				return false;
			}
			if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
				return false;
			}
			return true;
		});
		setFilteredProducts(filtered);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-2xl font-bold capitalize">{category}</h1>

			<div className="flex flex-col gap-8 lg:flex-row">
				{/* Sidebar Filter */}
				<aside className="lg:w-1/4">
					<div className="sticky top-24">
						<Filter onFilterChange={handleFilterChange} />
					</div>
				</aside>

				{/* Product Grid */}
				<main className="lg:w-3/4">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filteredProducts.map((product) => (
							<div
								key={product.id}
								className="group bg-background overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md">
								<div className="bg-muted aspect-square overflow-hidden rounded-md">
									{/* Replace with your Image component */}
									<div className="bg-muted h-full w-full" />
								</div>
								<div className="mt-4">
									<h3 className="font-medium">{product.name}</h3>
									<p className="text-muted-foreground mt-1 text-sm">
										${product.price.toFixed(2)}
									</p>
								</div>
							</div>
						))}
					</div>

					{filteredProducts.length === 0 && (
						<div className="text-muted-foreground flex h-[400px] items-center justify-center">
							No products found matching your criteria
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
