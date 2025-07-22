import MainCategorySection from "@/components/categories/main-categories";
import { Quote } from "@/components/quote";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
	const t = useTranslations("Home");

	return (
		<div className="mt-[-20px] grid min-h-screen grid-rows-[auto_1fr_20px] gap-16">
			<div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
				<Card className="w-full overflow-hidden rounded-none">
					<CardContent className="relative h-[600px] p-0 shadow-md">
						<Image
							src="/images/banner.png"
							alt="Homepage Banner"
							fill
							className="object-cover"
							priority
						/>
						<div className="absolute inset-0 z-1 bg-black/50" />
						<div className="absolute inset-0 z-2 container mx-auto flex flex-col justify-center px-4">
							<div className="max-w-2xl space-y-8 text-white">
								<div className="space-y-4">
									<h1 className="text-6xl leading-tight font-bold">
										Hver jobb starter med riktig utstyr
									</h1>
									<p className="max-w-2xl text-xl leading-relaxed text-white/90">
										Finn riktig slange, kobling eller utstyr – når du trenger
										det.
										<br />
										Vi har over 130 servicesentre klare til å levere.
									</p>
								</div>

								<div className="w-full">
									<div className="flex items-center gap-2 rounded-lg bg-white p-1 shadow-lg">
										<div className="flex flex-1 items-center gap-3 px-1 py-1">
											<input
												type="text"
												placeholder="Søk etter slanger, utstyr, diameter, trykkklasse..."
												className="flex-1 rounded-md border border-gray-300 bg-[#F8F9F8] px-2 py-[7px] text-base text-gray-700 placeholder-gray-500 outline-none"
											/>
										</div>
										<Button className="mr-3 flex items-center gap-2 rounded-md bg-green-600 px-8 py-5 font-medium text-white hover:bg-green-700">
											<Search className="h-4 w-4" />
											Søk
										</Button>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col justify-between gap-5">
				<Quote />
				<MainCategorySection />
			</div>
		</div>
	);
}
