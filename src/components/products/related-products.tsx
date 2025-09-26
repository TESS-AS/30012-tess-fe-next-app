"use client";
import { Separator } from "@/components/ui/separator";
import { IProduct } from "@/types/product.types";
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

	const isEmpty = !products || products.length === 0;

	return (
		<section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
			<h2 className="pb-3 text-2xl font-semibold text-[#0F1912]">
				{t("Product.relatedProducts")}
			</h2>
			<Separator />

			{isEmpty ? (
				<p className="mt-4 text-sm text-gray-500">
					{t("Product.noRelatedProducts")}
				</p>
			) : (
				<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
			)}
		</section>
	);
}
