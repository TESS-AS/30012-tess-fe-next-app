"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import Image from "next/image";

export default function MainCategorySection() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<FeedbackDialog
				open={open}
				onOpenChange={setOpen}
			/>

			<section className="relative right-1/2 left-1/2 -mx-[50vw] w-screen bg-white py-16">
				<div className="container mx-auto px-4">
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
								onClick={() => setOpen(true)}>
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
		</>
	);
}
