import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Quote() {
	const categories = [
		{
			title: "Slanger og Rør",
			subcategories: "6 underkategorier",
			icon: "🔧",
		},
		{
			title: "Verktøy og maskiner",
			subcategories: "2 underkategorier",
			icon: "⚙️",
		},
		{
			title: "Vern, klær og sko",
			subcategories: "8 underkategorier",
			icon: "🦺",
		},
		{
			title: "Sveis",
			subcategories: "6 underkategorier",
			icon: "⚡",
		},
	];

	const slugify = (name: string) =>
		name.toLowerCase().replace(/,/g, "").replace(/\s+/g, "-");

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
						return (
							<Link
								href={slug}
								key={index}
								className="group relative flex min-h-[296px] cursor-pointer flex-col items-center justify-center rounded-lg border bg-white p-6 text-center transition-shadow hover:shadow-md">
								<div className="flex flex-col items-center space-y-4">
									<div className="text-muted-foreground text-4xl">
										{category.icon}
									</div>
									<div>
										<h3 className="mt-12 text-lg font-medium">
											{category.title}
										</h3>
										<p className="text-muted-foreground text-sm">
											{category.subcategories}
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
