import MainCategorySection from "@/components/categories/main-categories";
import { Quote } from "@/components/quote";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

						<div className="absolute inset-0 z-1 bg-black/40" />

						<div className="absolute inset-0 z-2 container mx-auto flex items-center">
							<div className="max-w-xl space-y-6 text-white">
								<p className="text-sm tracking-wide text-white/80 uppercase">
									Let’s get to work
								</p>
								<h1 className="text-4xl font-bold sm:text-5xl">
									Honest, Trustworthy, And <br /> Professional.
								</h1>
								<p className="text-lg leading-relaxed text-white/90">
									At TESS, you will meet professionals on both sides of the
									counter and have access to the best market availability with
									more than 130 local service centers.
								</p>
								<div className="flex flex-wrap items-center gap-4">
									<Button className="rounded-full bg-green-600 px-6 py-2 hover:bg-green-800">
										{t("seeCategories")}
									</Button>
									<Button
										variant="outline"
										className="rounded-full bg-white/90 px-6 py-2 text-black hover:bg-white">
										{t("learnMore")}
									</Button>
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
