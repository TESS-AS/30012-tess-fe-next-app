"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/CategoriesProvider";
import Link from "next/link";

export default function CategoriesPage() {
	const { categories, loading, error } = useCategories();

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="mb-8 text-3xl font-bold">All Categories</h1>
				<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-24 w-full rounded-lg"
						/>
					))}
				</div>
			</div>
		);
	}

	if (!categories || categories.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="mb-8 text-3xl font-bold">All Categories</h1>
				<p className="text-muted-foreground">No categories available</p>
			</div>
		);
	}

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
					</Link>
				))}
			</div>
		</div>
	);
}
