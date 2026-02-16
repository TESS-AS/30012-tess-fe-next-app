import { CustomerWebPromo } from "@/components/customer-web-promo";
import { HomeBannerWithCategories } from "@/components/home/home-banner-with-categories";
import { WelcomeSection } from "@/components/home/welcome-section";
import { Quote } from "@/components/quote";
import { getTranslations } from "next-intl/server";

export default async function Home() {
	const t = await getTranslations("Home");

	return (
		<div className="mt-[-20px] flex flex-col gap-16">
			<WelcomeSection />
			<HomeBannerWithCategories />
			<div className="flex flex-col justify-between gap-5">
				<Quote />
				<CustomerWebPromo />
			</div>
		</div>
	);
}
