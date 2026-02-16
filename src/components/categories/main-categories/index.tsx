"use client";

import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import Image from "next/image";

export default function MainCategorySection() {
	const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

	return (
		<>
			<section className="relative right-1/2 left-1/2 -mx-[50vw] w-screen bg-white py-16">
				<div className="container mx-auto">
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
						<div className="space-y-6">
							<h2 className="text-6xl leading-tight font-light text-gray-900">
								Velkommen til TESSIX netthandel
							</h2>
							<div className="space-y-6">
								<div className="space-y-1">
									<p className="mb-0 text-lg leading-relaxed font-semibold text-gray-500">
										Vi utvikler stadig løsningen
									</p>
									<p className="mb-0 text-lg leading-relaxed text-gray-500">
										Har du forslag som gjør arbeidsdagen din enklere?
									</p>
									<button
										type="button"
										onClick={() => setIsFeedbackDialogOpen(true)}
										className="cursor-pointer text-lg text-green-700 hover:text-green-800">
										Gi tilbakemelding
									</button>
								</div>
								<div className="space-y-1 pt-4">
									<p className="mb-0 text-lg leading-relaxed font-semibold text-gray-500">
										Trenger du hjelp?
									</p>
									<p className="text-lg leading-relaxed text-gray-500">
										Se{" "}
										<a
											href="/faq"
											className="text-green-700 hover:text-green-900">
											ofte stilte spørsmål
										</a>{" "}
										eller kontakt oss på{" "}
										<a
											href="mailto:netthandel@tess.no"
											className="text-green-700 hover:text-green-900">
											netthandel@tess.no
										</a>
									</p>
								</div>
							</div>
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
			<FeedbackDialog
				open={isFeedbackDialogOpen}
				onOpenChange={setIsFeedbackDialogOpen}
			/>
		</>
	);
}
