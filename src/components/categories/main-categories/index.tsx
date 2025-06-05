"use client";

import { CategoryCard } from "@/components/categories/main-categories/category-card";
import { Button } from "@/components/ui/button";
import { useMainCategories } from "@/hooks/useMainCategories";
import { useKeenSlider } from "keen-slider/react";
import { useSession } from "next-auth/react";
import "keen-slider/keen-slider.min.css";
import { useTranslation } from "react-i18next";

export default function MainCategorySection() {
	const { data: mainCategories, isLoading, error } = useMainCategories();
	const {t} = useTranslation('common');
	const { data: session } = useSession();

	const [sliderRef] = useKeenSlider<HTMLDivElement>({
		slides: { perView: 1.2, spacing: 16 },
		breakpoints: {
			"(min-width: 640px)": { slides: { perView: 2, spacing: 24 } },
			"(min-width: 768px)": { slides: { perView: 3, spacing: 24 } },
			"(min-width: 1024px)": { slides: { perView: 4, spacing: 24 } },
		},
	});

	if (isLoading) return <p>Loading categories...</p>;
	if (error) return <p>Failed to load categories.</p>;

	return (
		<section className="relative right-1/2 left-1/2 -mx-[50vw] mt-15 w-screen bg-[#f9f9f9] py-15">
			<div className="absolute inset-0 z-0 h-[50%] w-full bg-[#222222]" />
			<div className="relative z-10 container mx-auto space-y-12">
				<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
					<div className="space-y-3 md:max-w-lg">
						<p className="text-sm tracking-wider text-green-600 uppercase">
							{t("Home.ourCategories")}
						</p>
						<h2 className="text-3xl leading-tight font-bold text-white">
							{t("Home.browseOurTopCategories")}
						</h2>
					</div>
					<div className="border-l-2 border-neutral-500 pl-20 text-sm leading-relaxed text-white md:max-w-xl">
						Volutpat maecenas volutpat blandit aliquam etiam erat. Enim praesent
						elementum facilisis leo vel fringilla est. Vel elit scelerisque
						mauris pellentesque. Id ornare arcu odio ut sem. Dapibus ultrices in
						iaculis nunc sed augue lacus.
					</div>
				</div>
				<div
					ref={sliderRef}
					className="keen-slider">
					{mainCategories?.map((category) => (
						<div
							key={category.id}
							className="keen-slider__slide">
							<CategoryCard {...category} />
						</div>
					))}
				</div>

				<div className="flex flex-wrap justify-center gap-4">
					<Button
						variant="secondary"
						className="rounded-full bg-neutral-700 px-6 py-2 text-white hover:bg-neutral-800">
						Learn More
					</Button>
					<Button className="rounded-full bg-green-600 px-6 py-2 hover:bg-green-700">
						{t("Category.viewAll")}
					</Button>
				</div>
			</div>
		</section>
	);
}
