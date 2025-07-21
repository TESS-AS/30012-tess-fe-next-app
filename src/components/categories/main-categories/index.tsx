"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function MainCategorySection() {
	const t = useTranslations();

	return (
		<section className="relative right-1/2 left-1/2 -mx-[50vw] w-screen bg-white py-16">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
					<div className="space-y-6">
						<h2 className="text-4xl leading-tight font-bold text-gray-900 lg:text-5xl">
							Tjenester og bærekraftige løsninger
						</h2>
						<p className="text-lg leading-relaxed text-gray-600">
							Vi har levert slanger til alle formål i mer enn 55 år. I dag er vi
							en ledende leverandør av sveiseutstyr, drifts- og
							vedlikeholdsprodukter, og andre kritiske, kostnadseffektive
							løsninger for bedrifter.
						</p>
						<Button
							variant="outline"
							className="bg-white text-sm text-black">
							Les mer om våre løsninger
						</Button>
					</div>

					<div className="relative">
						<div className="relative aspect-[4/3] w-full overflow-hidden">
							<Image
								src="/images/presentation.png"
								alt="Woman presenting at TESS conference"
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 50vw"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
