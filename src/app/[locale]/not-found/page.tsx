"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
			<Card className="w-full overflow-hidden rounded-none">
				<CardContent className="relative h-[600px] p-0 shadow-md">
					<Image
						src="/images/404.png"
						alt="Homepage Banner"
						fill
						sizes="100vw"
						className="object-cover"
						priority
					/>
					<div className="absolute inset-0 z-1 bg-black/70" />
					<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
						<div className="mb-8 pt-32">
							<h1 className="text-[128px] leading-none font-bold tracking-tight text-green-500">
								404
							</h1>
						</div>
						<h2 className="mb-6 text-[36px] leading-tight font-bold text-white">
							Oops, det kan se ut som at en slange er koblet fra...
						</h2>
						<div className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-gray-200">
							Siden kan ha blitt fjernet, fått nytt navn, eller er midlertidig
							utilgjengelig.  Fant du en ødelagt lenke? Gi oss beskjed, så
							retter vi den.
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link
								href="/"
								className="min-w-[280px] rounded-sm bg-white px-4 py-2 text-center text-sm font-medium text-black transition-colors duration-200 hover:bg-gray-100">
								Forside - gå tilbake og start på nytt
							</Link>

							<Link
								href="/kontakt"
								className="min-w-[200px] rounded-sm border-2 border-white bg-transparent px-4 py-2 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-black">
								Gi tilbakemelding
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
