"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SAP_CUSTOMER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import Image from "next/image";

export function HomeBanner() {
	const { data: profile } = useGetProfileData();
	const isSapCustomer = profile?.defaultCustomerNumber === SAP_CUSTOMER;

	return (
		<div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
			<Card className="w-full overflow-hidden rounded-none">
				<CardContent className="relative h-[600px] p-0 shadow-md">
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
					<div className="absolute inset-0 z-[2] container mx-auto flex flex-col justify-center px-4">
						<div className="max-w-2xl space-y-8 text-white">
							<div className="space-y-4">
								<h1 className="text-6xl leading-tight font-bold">
									Hver jobb starter med riktig utstyr
								</h1>
								<p className="max-w-2xl text-xl leading-relaxed text-white/90">
									Finn riktig slange, kobling eller utstyr – når du trenger det.
									<br />
									Vi har over 140 servicesentre klare til å levere.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
