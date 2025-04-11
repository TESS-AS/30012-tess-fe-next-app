import { mockProducts } from "@/mocks/mockProducts";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ProductCard } from "./product-card";

interface RelatedProductsProps {
	currentProductId: string;
	category: string;
	maxItems?: number;
}

export async function RelatedProducts({
	currentProductId,
	category,
	maxItems = 4,
}: RelatedProductsProps) {
	const t = await getTranslations();

	// Filter products from the same category, excluding the current product
	const relatedProducts = mockProducts
		.filter(
			(product) =>
				product.category === category && product.id !== currentProductId,
		)
		.slice(0, maxItems);

	if (relatedProducts.length === 0) {
		return null;
	}

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">
					{t("product.relatedProducts")}
				</h2>
				<Link
					href={`/${category}`}
					className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors">
					{t("product.viewAll")}
					<ChevronRight className="h-4 w-4" />
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{relatedProducts.map((product) => (
					<ProductCard
						key={product.id}
						{...product}
						href={`/${product.category}/${product.id}`}
					/>
				))}
			</div>
		</section>
	);
}
