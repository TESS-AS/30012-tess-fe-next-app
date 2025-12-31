"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductGrid } from "@/components/products/product-grid";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { useIsBaneNorKatalog } from "@/hooks/useIsBaneNorKatalog";
import { getCategoryImage } from "@/lib/category-utils";
import { Category } from "@/types/categories.types";
import { IProduct } from "@/types/product.types";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Breadcrumb } from "../ui/breadcrumb";
import { FilterCategory } from "../ui/filter";

interface CategoryContentProps {
	categoryData?: Category;
	filters: FilterCategory[];
	query?: string;
	segment?: string;
	categoryFilters?: {
		assortmentNumber: string;
		nameNo: string;
		nameEn: string;
		productCount: string;
	}[];
}

export default function CategoryContent({
	categoryData,
	filters,
	query,
	segment,
	categoryFilters,
}: CategoryContentProps) {
	const t = useTranslations();
	const breadcrumbs = useBreadcrumbs(segment);
	const isBaneNorKatalog = useIsBaneNorKatalog();

	// Check if user came from categories page
	const [fromCategoriesPage, setFromCategoriesPage] = useState(false);

	useEffect(() => {
		// Check sessionStorage for flag
		const flag = sessionStorage.getItem("fromCategoriesPage");
		if (flag === "true") {
			setFromCategoriesPage(true);
			// Don't clear the flag here - let Header component handle it
			// This allows the menu to stay hidden when navigating between category pages
		}
	}, []);

	// Override breadcrumbs to include "Se alle kategorier" when on a category page
	const categoryBreadcrumbs = useMemo(() => {
		if (!categoryData) return breadcrumbs;

		// Check if we're on a category page (not subcategory or segment)
		const isCategoryPage = !segment && categoryData;

		if (isCategoryPage) {
			return [
				{ href: "/", label: t("BreadCrumbs.home") },
				{ href: "/alle-kategorier", label: t("Category.viewAll") },
				{
					href: `/${categoryData.slug}`,
					label: categoryData.name,
					current: true,
				},
			];
		}

		return breadcrumbs;
	}, [breadcrumbs, categoryData, segment, t]);

	const hasValidInput = !!categoryData?.groupId || !!query;

	if (!hasValidInput) {
		return null;
	}

	// If category has subcategories AND user came from categories page, show the menu-style layout (same as header menu)
	if (
		categoryData?.subcategories &&
		categoryData.subcategories.length > 0 &&
		fromCategoriesPage
	) {
		return (
			<div className="py-8">
				<div className="mb-6">
					<Breadcrumb items={categoryBreadcrumbs} />
				</div>
				<div className="container min-h-[500px] w-full">
					<ul className="xs:columns-2 container min-h-[500px] min-w-full gap-x-1 p-2 sm:columns-3 md:columns-4">
						{categoryData.subcategories.map((subcategory) => {
							const subcategoryImage = getCategoryImage(subcategory);
							return (
								<li
									key={subcategory.slug}
									className="mb-8 break-inside-avoid">
									<div className="relative mb-2">
										{subcategoryImage && (
											<img
												src={subcategoryImage}
												alt={subcategory.name}
												className="absolute top-0 left-5 h-15 w-15 object-contain"
											/>
										)}
										<div
											className={`text-md font-bold ${subcategoryImage ? "pl-24" : ""}`}>
											<Link
												href={`/${categoryData.slug}/${subcategory.slug}`}
												className="hover:underline">
												{subcategory.name}
											</Link>
										</div>
									</div>
									{Array.isArray(subcategory.subcategories) &&
										subcategory.subcategories && (
											<ul
												className={`space-y-1 ${subcategoryImage ? "pl-24" : ""}`}>
												{subcategory.subcategories.map((child) => (
													<li key={child.slug}>
														<Link
															href={`/${categoryData.slug}/${subcategory.slug}/${child.slug}`}
															className="hover:text-foreground text-md font-medium text-gray-700 transition-colors">
															{child.name}
														</Link>
													</li>
												))}

												{!isBaneNorKatalog && (
													<li>
														<Link
															href={`/${categoryData.slug}/${subcategory.slug}`}
															className="text-md border-b-1 border-[#009640] pb-[1px] font-medium text-[#009640] hover:text-[#009640]">
															{`Alle ${subcategory.name}`}
														</Link>
													</li>
												)}
											</ul>
										)}
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}

	// If no subcategories, show products grid
	return (
		<div className="py-8">
			<div className="mb-6">
				<Breadcrumb items={categoryBreadcrumbs} />
			</div>
			<ProductGrid
				filters={filters}
				categoryFilters={categoryFilters}
				categoryNumber={categoryData?.groupId || ""}
				query={query || null}
			/>
		</div>
	);
}
