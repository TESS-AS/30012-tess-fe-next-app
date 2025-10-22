"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import Image from "next/image";

export default function MainCategorySection() {
	return (
		<>
			<section className="relative right-1/2 left-1/2 -mx-[50vw] w-screen bg-white py-16">
				<div className="container mx-auto">
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
						<div className="space-y-6">
							<h2 className="text-6xl leading-tight font-light text-gray-900">
								Tjenester og bærekraftige løsninger
							</h2>
							<p className="text-lg leading-relaxed text-[#5A615D]">
								Vi har levert slanger til alle formål i mer enn 55 år. I dag er
								vi en ledende leverandør av sveiseutstyr, drifts- og
								vedlikeholdsprodukter, og andre kritiske, kostnadseffektive
								løsninger for bedrifter.
							</p>
							<Button
								variant="outline"
								className="bg-white text-sm text-black"
								onClick={() => {}}>
								Les mer om våre løsninger
							</Button>
						</div>

						<div className="flex justify-center md:justify-end">
							<figure className="w-[640px] max-w-full text-center">
								<Image
									src="/images/presentation.svg"
									alt="Woman presenting at TESS conference"
									width={640}
									height={405}
									className="mx-auto"
								/>
							</figure>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
