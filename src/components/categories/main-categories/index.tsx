"use client";

import { CategoryCard } from "@/components/categories/main-categories/category-card";
import { useMainCategories } from "@/hooks/useMainCategories";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function MainCategorySection() {
	const { data: mainCategories, isLoading, error } = useMainCategories();
	const t = useTranslations();

	const { data: session, status } = useSession();

	console.log(session, status);

	if (isLoading) return <p>Loading categories...</p>;
	if (error) return <p>Failed to load categories.</p>;

	return (
		<section className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-[#02a554]">
					{t("home.browseOurTopCategories")}
				</h2>
				<Link
					href="/categories"
					className="text-muted-foreground text-sm transition-colors hover:text-[#02a554]">
					{t("category.viewAll")}
				</Link>
			</div>

			<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
				{mainCategories?.map((category) => (
					<CategoryCard
						key={category.id}
						{...category}
					/>
				))}
			</div>
		</section>
	);
}
