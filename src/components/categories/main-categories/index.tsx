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
								Velkommen til TESSIX Netthandel
							</h2>
							<p className="text-lg leading-relaxed text-[#5A615D]">
							TESSIX Netthandel gir deg tilgang til et langt raskere og mer presist søk, 
							bedre oversikt over produkter og en kundetilpasset handelsopplevelse.<br/>  
							Netthandelen er fremdeles under utvikling, og din erfaring hjelper oss å videreutvikle en løsning som skal gi mer verdi og 
							gjøre hverdagen enklere.<br/> 
							Opplever du feil, mangler eller har forslag til forbedringer, 
							setter vi stor pris på tilbakemeldinger, enten via skjema eller på e-post til {" "}       
							<a href="mailto:netthandel@tess.no" className="underline text-[#00315B]">
        						netthandel@tess.no
    						</a>
							<br/>
							Ønsker du å bruke den gamle løsningen? Gå til {" "} <a href="https://ny.tess.no" className="underline text-[#00315B]">www.ny.tess.no</a>
							</p>
							{/** Commenting out till we have a link we want to use 
							<Button
								variant="outline"
								className="bg-white text-sm text-black"
								onClick={() => {}}>
								Les mer om Tess
							</Button>
							*/}
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
