import MainCategorySection from "@/components/categories/main-categories";
import { CustomerWebPromo } from "@/components/customer-web-promo";
import { HomeBanner } from "@/components/home/home-banner";
import { WelcomeSection } from "@/components/home/welcome-section";
import { Quote } from "@/components/quote";
import { getTranslations } from "next-intl/server";

export default async function Home() {
	const t = await getTranslations("Home");

	return (
		<div className="mt-[-20px] flex flex-col gap-16">
			<WelcomeSection />
			<HomeBanner />
			<div className="flex flex-col justify-between gap-5">
				<MainCategorySection />
				<Quote />
				<CustomerWebPromo />
			</div>
		</div>
	);
}
