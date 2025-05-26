"use client";
import { IProduct } from "@/types/product.types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductCard } from "./product-card";

interface RelatedProductsProps {
	products: IProduct[];
	category: string;
}

export function RelatedProducts({ products, category }: RelatedProductsProps) {
	const pathname = usePathname();
	const t = useTranslations();

	if (products.length === 0) {
		return null;
	}

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">
					{t("Product.relatedProducts")}
				</h2>
				<Link
					href={`/${category}`}
					className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors">
					{t("Product.viewAll")}
					<ChevronRight className="h-4 w-4" />
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{products.map((product) => (
					<Link
						key={product.productNumber}
						href={`${pathname}/${product.productNumber}`}>
						<ProductCard
							{...product}
							variant="compact"
						/>
					</Link>
				))}
			</div>
		</section>
	);
}
