"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Quote() {
	const categories = [
		{
			title: "Slanger & Rør",
			subcategories: 6,
		},
		{
			title: "Verktøy og maskiner",
			subcategories: 2,
		},
		{
			title: "Klær, vern og sko",
			subcategories: 8,
		},
		{
			title: "Sveis",
			subcategories: 6,
		},
	];

	const slugify = (name: string) =>
		name.toLowerCase().replace(/&/g, "og").replace(/,/g, "").replace(/\s+/g, "-");

	const slugifyName = (text: string) =>
		text
			.toLowerCase()
			.replace(/&/g, "og")
			.replace(/,/g, "")
			.replace(/\s+/g, "-")
			.replace(/å/g, "a")
			.replace(/ø/g, "o")
			.replace(/æ/g, "ae");

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

				<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
					{categories.map((category, index) => {
						const slug = slugify(category.title);
						const imageSlug = slugifyName(category.title);
						return (
							<Link
								href={`/${slug}`}
								key={index}
								className="group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-lg border bg-white p-6 text-center transition-shadow hover:shadow-md sm:min-h-[296px]">
								<div className="flex flex-col items-center space-y-4">
									<Image
										src={`/category-icons/${imageSlug}.png`}
										alt={category.title}
										width={100}
										height={100}
										className="mx-auto h-[80px] w-[80px] object-contain opacity-50 sm:h-[100px] sm:w-[100px]"
									/>
									<div className="flex flex-col items-center justify-end text-center">
										<h3 className="text-base font-medium sm:text-lg">{category.title}</h3>
										<p className="text-muted-foreground mt-1 text-sm">
											{category.subcategories} underkategorier
										</p>
									</div>
								</div>

								<ChevronRight className="text-muted-foreground absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100" />
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
