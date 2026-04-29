import MainCategorySection from "@/components/categories/main-categories";
import { CustomerWebPromo } from "@/components/customer-web-promo";
import { HomeBannerWithCategories } from "@/components/home/home-banner-with-categories";
import { WelcomeSection } from "@/components/home/welcome-section";
import { Quote } from "@/components/quote";
import { getTranslations } from "next-intl/server";

export default async function Home() {
	const t = await getTranslations("Home");

	return (
		<div className="mt-[-20px] flex flex-col gap-8 md:gap-16">
			<MainCategorySection />
			<WelcomeSection />
			<div className="flex flex-col">
				<Quote />
				<HomeBannerWithCategories />
			</div>
			<CustomerWebPromo />
		</div>
	);
}
