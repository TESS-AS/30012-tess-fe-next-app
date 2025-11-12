"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Quote() {
	const categories = [
		{
			title: "Slanger og Rør",
		},
		{
			title: "Verktøy og maskiner",
		},
		{
			title: "Vern, klær og sko",
		},
		{
			title: "Sveis",
		},
	];

	const slugify = (name: string) =>
		name.toLowerCase().replace(/,/g, "").replace(/\s+/g, "-");

	const slugifyName = (text: string) =>
		text
			.toLowerCase()
			.replace(/,/g, "")
			.replace(/\s+/g, "-")
			.replace(/å/g, "a")
			.replace(/ø/g, "o")
			.replace(/æ/g, "ae");

	return (
		<section className="relative mt-[-65px] py-12 before:absolute before:inset-0 before:-mx-[9999px] before:bg-[#F8F9F8] before:content-['']">
			<div className="relative container">
				<div className="mb-8 flex items-center justify-between border-b pb-10">
					<h2 className="text-2xl font-medium">
						Bla gjennom våre toppkategorier
					</h2>
					<Button
						asChild
						variant="outline"
						className="bg-white text-sm text-black">
						<Link href="/categories">Se alle kategorier</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					{categories.map((category, index) => {
						const slug = slugify(category.title);
						const imageSlug = slugifyName(category.title);
						return (
							<Link
								href={`/${slug}`}
								key={index}
								className="group relative flex min-h-[296px] cursor-pointer flex-col items-center justify-center rounded-lg border bg-white p-6 text-center transition-shadow hover:shadow-md">
								<div className="flex flex-col items-center space-y-4">
									<Image
										src={`/category-icons/${imageSlug}.png`}
										alt={category.title}
										width={100}
										height={100}
										className="mx-auto h-[100px] w-[100px] object-contain opacity-50"
									/>
									<div className="flex h-[100px] flex-col items-center justify-end text-center">
										<h3 className="text-lg font-medium">{category.title}</h3>
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
