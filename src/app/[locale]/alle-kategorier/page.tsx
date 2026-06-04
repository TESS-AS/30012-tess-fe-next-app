"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/CategoriesProvider";
import { getCategoryImage, getSubcategoryCount } from "@/lib/category-utils";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import { Category } from "@/types/categories.types";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CategoriesPage() {
	const { categories, loading, error } = useCategories();
	const t = useTranslations();
	const router = useRouter();
	const requestOpen = useNavMenuStore((s) => s.requestOpen);

	const handleTileClick = (category: Category) => {
		if (category.subcategories && category.subcategories.length > 0) {
			requestOpen(category.slug);
		} else {
			router.push(`/${category.slug}`);
		}
	};

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
						<button
							key={category.slug}
							type="button"
							onClick={() => handleTileClick(category)}
							className="group relative flex w-full flex-col rounded-lg border border-gray-200 bg-white p-6 text-left transition-all hover:shadow-md">
							{/* Category Icon */}
							<div className="mb-4 flex h-[150px] items-center justify-center">
								{categoryImage ? (
									<div className="relative h-[150px] w-[150px]">
										{/* Default gray image */}
										<img
											src={categoryImage}
											alt={category.name}
											width={150}
											height={150}
											className="absolute inset-0 h-full w-full object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-0"
										/>
										{/* Green image on hover */}
										{category.imageGreen && (
											<img
												src={category.imageGreen}
												alt={category.name}
												width={150}
												height={150}
												className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-60"
											/>
										)}
									</div>
								) : (
									<div className="h-[150px] w-[150px] rounded bg-gray-100 opacity-60" />
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
						</button>
					);
				})}
			</div>
		</div>
	);
}
