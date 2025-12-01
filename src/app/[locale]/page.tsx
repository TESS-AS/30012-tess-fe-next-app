import MainCategorySection from "@/components/categories/main-categories";
import { CustomerWebPromo } from "@/components/customer-web-promo";
import { Quote } from "@/components/quote";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function Home() {
	const t = await getTranslations("Home");

	return (
		<div className="mt-[-20px] grid min-h-screen grid-rows-[auto_1fr_20px] gap-16">
			<div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
				<Card className="w-full overflow-hidden rounded-none">
					<CardContent className="relative h-[600px] p-0 shadow-md">
						<Image
							src="/images/banner.png"
							alt="Homepage Banner"
							fill
							loading={"eager"}
							className="object-cover"
							priority
							sizes="100vw"
							quality={90}
							unoptimized={false}
						/>
						<div className="absolute inset-0 z-[1] bg-black/50" />
						<div className="absolute inset-0 z-[2] container mx-auto flex flex-col justify-center px-4">
							<div className="max-w-2xl space-y-8 text-white">
								<div className="space-y-4">
									<h1 className="text-6xl leading-tight font-bold">
										Hver jobb starter med riktig utstyr
									</h1>
									<p className="max-w-2xl text-xl leading-relaxed text-white/90">
										Finn riktig slange, kobling eller utstyr – når du trenger
										det.
										<br />
										Vi har over 140 servicesentre klare til å levere.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col justify-between gap-5">
				<MainCategorySection />
				<Quote />
				<CustomerWebPromo />
			</div>
		</div>
	);
}
