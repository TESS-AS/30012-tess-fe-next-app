"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function CustomerWebPromo() {
	const t = useTranslations("CustomerWebPromo");

	const [selectedView, setSelectedView] = useState<
		"customerWeb" | "somethingElse"
	>("customerWeb");
	const isCustomerWeb = selectedView === "customerWeb";

	return (
		<section className="relative mt-[-65px] pt-28 pb-5">
			<div className="relative container">
				{/* Switcher */}
				<div className="mb-8 inline-flex items-center rounded-full bg-[#ECEEEC] p-1 text-sm">
					<button
						className={cn(
							"rounded-full px-4 py-1.5 font-medium transition-colors",
							isCustomerWeb
								? "bg-green-900 text-white"
								: "text-muted-foreground",
						)}
						onClick={() => setSelectedView("customerWeb")}>
						{t("switcher.news")}
					</button>
					<button
						className={cn(
							"rounded-full px-4 py-1.5 font-medium transition-colors",
							!isCustomerWeb
								? "bg-green-900 text-white"
								: "text-muted-foreground",
						)}
						onClick={() => setSelectedView("somethingElse")}>
						{t("switcher.future")}
					</button>
				</div>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-2">
					{isCustomerWeb ? (
						<>
							<div className="flex flex-col justify-center">
								<h2 className="text-6xl leading-tight font-light text-gray-900">
									{t("customerWeb.title")}
								</h2>
								<p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5A615D]">
									{t("customerWeb.description")}
								</p>
								<p className="mt-6 text-lg leading-relaxed font-semibold text-[#5A615D]">
									{t("customerWeb.feedbackPrompt")}
								</p>
								<p className="text-lg leading-relaxed text-[#5A615D]">
									{t("customerWeb.feedbackSubtext")}
								</p>
								<Button
									variant="outline"
									className="mt-6 w-max bg-white text-black">
									{t("customerWeb.feedbackButton")}
								</Button>
							</div>
							<div className="flex justify-center md:justify-end">
								<figure className="w-[640px] max-w-full text-center">
									<Image
										src="/images/web-promo.png"
										alt={t("imageAlt")}
										width={640}
										height={400}
										className="mx-auto"
									/>
									<figcaption className="text-muted-foreground mt-2 text-sm">
										{t("imageCaption")}
									</figcaption>
								</figure>
							</div>
						</>
					) : (
						<>
							<div className="flex flex-col justify-center">
								<h2 className="text-3xl font-semibold sm:text-4xl">
									{t("otherSection.title")}
								</h2>
								<p className="text-muted-foreground mt-6 max-w-xl">
									{t("otherSection.description")}
								</p>
								<Button
									variant="outline"
									className="mt-6 w-max bg-white text-black">
									{t("otherSection.cta")}
								</Button>
							</div>
							<div className="flex justify-center md:justify-end">
								<figure className="w-[640px] max-w-full text-center">
									<Image
										src="/images/web-promo.png"
										alt={t("imageAlt")}
										width={640}
										height={400}
										className="mx-auto"
									/>
									<figcaption className="text-muted-foreground mt-2 text-sm">
										{t("imageCaption")}
									</figcaption>
								</figure>
							</div>
						</>
					)}
				</div>
			</div>
		</section>
	);
}
