import { mapCategoryTree } from "@/lib/utils";
import axiosInstance from "@/services/axiosServer";
import { RawCategory } from "@/types/categories.types";
import Link from "next/link";
import { getLocale } from "next-intl/server";

export default async function CategoriesPage() {
	const locale = await getLocale();

	const response = await axiosInstance.get(`/categories/${locale}`);
	const rawCategories: RawCategory[] = response.data;

	const categories = rawCategories.map((node) => mapCategoryTree(node, locale));

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-3xl font-bold">All Categories</h1>

			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
				{categories.map((category) => (
					<Link
						key={category.slug}
						href={`/${category.slug}`}
						className="rounded-lg border p-4 transition hover:shadow-md">
						<div className="text-lg font-semibold">{category.name}</div>
						<p className="text-muted-foreground text-sm">
							{category.subcategories?.length || 0} subcategories
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
