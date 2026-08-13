"use client";

import { useState } from "react";

import { FeedbackDialog } from "@/components/ui/dialogs/feedback-dialog";
import { HALLIBURTON_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import Image from "next/image";

export default function MainCategorySection() {
	const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
	const { data: profile } = useGetProfileData();

	if (!profile) {
		return null;
	}

	const isHalliburton =
		profile?.defaultCustomerNumber === HALLIBURTON_CUSTOMER_NUMBER;

	return (
		<>
			<section className="relative right-1/2 left-1/2 -mx-[50vw] w-screen bg-white px-4 pt-8 md:py-12 lg:px-0 lg:py-16">
				<div className="container mx-auto">
					<div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
						<div className="space-y-4 md:space-y-6">
							<h2 className="text-4xl leading-tight font-light text-gray-900 md:text-4xl lg:text-6xl">
								Velkommen til TESSIX Netthandel
							</h2>
							<div className="space-y-4 md:space-y-6">
								<div className="space-y-1">
									<p className="mb-0 text-base leading-relaxed font-semibold text-gray-500 md:text-lg">
										Vi utvikler stadig løsningen
									</p>
									<p className="mb-0 text-base leading-relaxed text-gray-500 md:text-lg">
										Har du forslag som gjør arbeidsdagen din enklere?
									</p>
									<button
										type="button"
										onClick={() => setIsFeedbackDialogOpen(true)}
										className="cursor-pointer text-base text-green-700 hover:text-green-800 md:text-lg">
										Gi tilbakemelding
									</button>
								</div>
								<div className="space-y-1 pt-2 md:pt-4">
									<p className="mb-0 text-base leading-relaxed font-semibold text-gray-500 md:text-lg">
										Trenger du hjelp?
									</p>
									<p className="text-base leading-relaxed text-gray-500 md:text-lg">
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
								{isHalliburton && (
									<div className="space-y-1 pt-2 md:pt-4">
										<p className="text-base leading-relaxed text-gray-500 md:text-lg">
											<a
												href="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=RXBln-HRt0W0_ecSik11LMbSVbjwTCVGi5jFYLgOQmRUMlhUVzkwNUY5NUVIUkxXM0hJQVNHOUlFVy4u"
												target="_blank"
												rel="noopener noreferrer"
												className="text-green-700 hover:text-green-900">
												PPE-tilbakemeldingsundersøkelse for Halliburton-ansatte
											</a>
										</p>
									</div>
								)}
							</div>
						</div>

						<div className="flex justify-center md:justify-end">
							<figure className="w-full max-w-[640px] text-center">
								<Image
									src="/images/presentation.svg"
									alt="Woman presenting at TESS conference"
									width={640}
									height={405}
									className="mx-auto w-full"
									loading="eager"
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
