"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SAP_CUSTOMER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import Image from "next/image";

export function HomeBanner() {
	const { data: profile } = useGetProfileData();
	const isSapCustomer = SAP_CUSTOMER.includes(profile?.defaultCustomerNumber || "");

	return (
		<div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
			<Card className="w-full overflow-hidden rounded-none">
				<CardContent className="relative h-[300px] p-0 shadow-md sm:h-[400px] md:h-[500px] lg:h-[600px]">
					<Image
						src={isSapCustomer ? "/images/banner-v2.png" : "/images/banner.png"}
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
					<div className="absolute inset-0 z-[2] container mx-auto flex flex-col justify-center px-4 lg:pl-0">
						<div className="max-w-2xl space-y-4 text-white md:space-y-8">
							<div className="space-y-3 md:space-y-4">
								<h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
									Hver jobb starter med riktig utstyr
								</h1>
								<p className="max-w-2xl text-base leading-relaxed text-white/90 md:text-lg lg:text-xl">
									Finn riktig slange, kobling eller utstyr – når du trenger det.
									<br />
									Vi har over 130 servicesentre klare til å levere.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
