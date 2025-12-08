import MainCategorySection from "@/components/categories/main-categories";
import { CustomerWebPromo } from "@/components/customer-web-promo";
import { HomeBanner } from "@/components/home/home-banner";
import { Quote } from "@/components/quote";
import { getTranslations } from "next-intl/server";

export default async function Home() {
	const t = await getTranslations("Home");

	return (
		<div className="mt-[-20px] grid min-h-screen grid-rows-[auto_1fr_20px] gap-16">
			<HomeBanner />
			<div className="flex flex-col justify-between gap-5">
				<MainCategorySection />
				<Quote />
				<CustomerWebPromo />
			</div>
		</div>
	);
}
