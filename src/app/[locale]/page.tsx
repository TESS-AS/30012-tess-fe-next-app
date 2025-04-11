import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
	const t = useTranslations("home");

	return (
		<div className="grid min-h-screen grid-rows-[auto_1fr_20px] gap-16 font-[family-name:var(--font-geist-sans)]">
			<Card className="w-full overflow-hidden">
				<CardContent className="relative h-64 rounded-2xl p-0 shadow-md">
					<Image
						src="/images/banner.webp"
						alt="Homepage Banner"
						fill
						className="object-cover"
						priority
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
						<h1 className="text-3xl font-bold text-white sm:text-4xl">
							{t("bannerTitle")}
						</h1>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-between gap-5">
				<p className="text-lg font-medium">{t("title")}</p>
			</div>
		</div>
	);
}
