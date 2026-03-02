"use client";

import { InfoPage } from "@/components/info-page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAppContext } from "@/lib/appContext";
import { useTranslations } from "next-intl";

import { useFaqCategories } from "./hooks";

export default function FaqPage() {
	const t = useTranslations("Faq");
	const tCommon = useTranslations();
	const { setIsAuthOpen } = useAppContext();
	const categories = useFaqCategories(() => setIsAuthOpen(true));

	return (
		<main className="my-6 min-h-screen">
			<Breadcrumb
				showHome={false}
				items={[
					{ href: "/", label: tCommon("BreadCrumbs.home") },
					{ href: "/faq", label: tCommon("BreadCrumbs.faq") },
				]}
			/>
			<InfoPage title={t("title")} categories={categories} withFeedback />
		</main>
	);
}
