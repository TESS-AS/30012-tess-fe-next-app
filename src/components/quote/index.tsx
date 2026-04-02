"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { useCategories } from "@/lib/CategoriesProvider";
import { getCategoryImage, getSubcategoryCount } from "@/lib/category-utils";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function Quote() {
	const { categories, loading, error } = useCategories();
	const t = useTranslations();

	return (
		<section className="relative mt-8 mb-8 py-8 before:absolute before:inset-0 before:-mx-[9999px] before:bg-[#F8F9F8] before:content-[''] md:mt-[-65px] md:mb-0 md:py-8">
			<div className="relative px-4 lg:px-0">
				<div className="mb-6 flex flex-col gap-4 border-b pb-6 md:mb-8 md:flex-row md:items-center md:justify-between md:pb-10">
					<h2 className="text-xl font-medium md:text-2xl">
						Bla gjennom våre toppkategorier
					</h2>
					<Button
						asChild
						variant="outline"
						className="w-full bg-white text-sm text-black md:w-auto">
						<Link href="/alle-kategorier">Se alle kategorier</Link>
					</Button>
				</div>

				{loading ? (
					<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton
								key={i}
								className="min-h-[240px] w-full rounded-lg sm:min-h-[296px]"
							/>
						))}
					</div>
				) : error || !categories?.length ? null : (
					<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
						{categories.map((category) => {
							const subcategoryCount = getSubcategoryCount(category);
							const categoryImage = getCategoryImage(category);
							const hasGreenHover = Boolean(category.imageGreen);

							return (
								<Link
									href={`/${category.slug}`}
									key={category.groupId || category.slug}
									className="group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-lg border bg-white p-6 text-center transition-shadow hover:shadow-md sm:min-h-[296px]">
									<div className="flex flex-col items-center space-y-4">
										{/* Fixed pixel box so every icon scales the same (object-contain inside identical dimensions). */}
										<div className="relative mx-auto flex h-[88px] w-[88px] shrink-0 items-center justify-center sm:h-[104px] sm:w-[104px]">
											{categoryImage ? (
												<>
													<img
														src={categoryImage}
														alt={category.name}
														width={88}
														height={88}
														className={cn(
															"pointer-events-none absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-50 transition-opacity duration-300 sm:h-[88px] sm:w-[88px] sm:opacity-60",
															hasGreenHover
																? "group-hover:opacity-0"
																: "group-hover:opacity-90 sm:group-hover:opacity-100",
														)}
													/>
													{category.imageGreen ? (
														<img
															src={category.imageGreen}
															alt=""
															width={88}
															height={88}
															className="pointer-events-none absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-60 sm:h-[88px] sm:w-[88px]"
														/>
													) : null}
												</>
											) : (
												<div className="h-[72px] w-[72px] rounded bg-gray-100 opacity-60 sm:h-[88px] sm:w-[88px]" />
											)}
										</div>
										<div className="flex flex-col items-center justify-end text-center">
											<h3 className="text-base font-medium sm:text-lg">{category.name}</h3>
											<p className="text-muted-foreground mt-1 text-sm">
												{subcategoryCount} {t("Category.subcategories")}
											</p>
										</div>
									</div>

									<ChevronRight className="text-muted-foreground absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100" />
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</section>
	);
}
