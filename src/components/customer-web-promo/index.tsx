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
		<section className="relative mt-[-65px] mb-16 pt-16 pb-5 md:mb-8 md:pt-28">
			<div className="relative px-4 lg:px-0">
				{/* Switcher */}
				{/* Commented out switcher 
				<div className="mb-8 inline-flex items-center rounded-full bg-[#ECEEEC] p-1 text-sm">	
					/*<button
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
				*/}

				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
					{isCustomerWeb ? (
						<>
							<div className="flex flex-col justify-center">
								<h2 className="text-4xl leading-tight font-light text-gray-900 md:text-4xl lg:text-6xl">
									{t("customerWeb.title")}
								</h2>
								<p className="mt-4 max-w-xl text-base leading-relaxed text-[#5A615D] md:mt-6 md:text-lg">
									{t("customerWeb.description")}
								</p>
								<p className="mt-4 text-base leading-relaxed text-[#5A615D] md:mt-6 md:text-lg">
									<span className="font-semibold">
										{t("customerWeb.feedbackPrompt")} -{" "}
									</span>
									{t("customerWeb.feedbackSubtext")}
								</p>
								{/* Commented out till functionality is added
								<Button
									variant="outline"
									className="mt-6 w-max bg-white text-black">
									{t("customerWeb.feedbackButton")}
								</Button>
								*/}
							</div>
							<div className="flex justify-center md:justify-end">
								<figure className="w-full max-w-[640px] text-center">
									<Image
										src="/images/web-promo.svg"
										alt={t("imageAlt")}
										quality={100}
										width={640}
										height={405}
										className="mx-auto w-full"
										loading="eager"
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
								<h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
									{t("otherSection.title")}
								</h2>
								<p className="text-muted-foreground mt-4 max-w-xl text-base md:mt-6">
									{t("otherSection.description")}
								</p>
								<Button
									variant="outline"
									className="mt-4 w-max bg-white text-black md:mt-6">
									{t("otherSection.cta")}
								</Button>
							</div>
							<div className="flex justify-center md:justify-end">
								<figure className="w-full max-w-[640px] text-center">
									<Image
										src="/images/web-promo.png"
										alt={t("imageAlt")}
										width={640}
										height={400}
										className="mx-auto w-full"
										loading="eager"
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
