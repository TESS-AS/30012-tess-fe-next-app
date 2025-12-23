"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/CategoriesProvider";
import { Category } from "@/types/categories.types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

function getCategoryImage(category: Category): string | null {
	if (
		(category as any).mediaId &&
		Array.isArray((category as any).mediaId) &&
		(category as any).mediaId.length > 0
	) {
		const media = (category as any).mediaId[0];
		if (media?.url) return media.url;
	}

	if (category.image) return category.image;

	return null;
}

function getSubcategoryCount(category: Category): number {
	return category.subcategories?.length || 0;
}

export default function CategoriesPage() {
	const { categories, loading, error } = useCategories();
	const t = useTranslations();

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Breadcrumb
					items={[
						{ href: "/", label: t("BreadCrumbs.home") },
						{
							href: "/alle-kategorier",
							label: t("Category.viewAll"),
							current: true,
						},
					]}
				/>
				<div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-32 w-full rounded-lg"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!categories || categories.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Breadcrumb
					items={[
						{ href: "/", label: t("BreadCrumbs.home") },
						{
							href: "/alle-kategorier",
							label: t("Category.viewAll"),
							current: true,
						},
					]}
				/>
				<p className="text-muted-foreground mt-8">No categories available</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumb
				items={[
					{ href: "/", label: t("BreadCrumbs.home") },
					{ href: "/alle-kategorier", label: t("Category.viewAll"), current: true },
				]}
			/>

			<div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
				{categories.map((category) => {
					const subcategoryCount = getSubcategoryCount(category);
					const categoryImage = getCategoryImage(category);

					return (
						<Link
							key={category.slug}
							href={`/${category.slug}`}
							onClick={() => {
								// Set flag to indicate navigation from categories page
								sessionStorage.setItem("fromCategoriesPage", "true");
							}}
							className="group relative flex flex-col rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md">
							{/* Category Icon */}
							<div className="mb-4 flex h-24 items-center justify-center">
								{categoryImage ? (
									<Image
										src={categoryImage}
										alt={category.name}
										width={80}
										height={80}
										className="object-contain opacity-60"
									/>
								) : (
									<div className="h-20 w-20 rounded bg-gray-100 opacity-60" />
								)}
							</div>

							{/* Category Name */}
							<div className="mb-2 text-center text-lg font-semibold text-black">
								{category.name}
							</div>

							{/* Subcategory Count */}
							<div className="mb-4 text-center text-sm text-gray-500">
								{subcategoryCount} {t("Category.subcategories")}
							</div>

							{/* Arrow Icon */}
							<div className="absolute right-4 top-1/2 -translate-y-1/2">
								<ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
