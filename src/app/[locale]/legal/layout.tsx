"use client";

import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export default function LegalLayout({ children }: { children: ReactNode }) {
	return (
		<div className="mt-[-20px] grid grid-rows-[auto_1fr_20px]">
			<div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
				<Card className="w-full overflow-hidden rounded-none">
					<CardContent className="relative h-[400px] p-0 shadow-md">
						<img
							src="/images/legal-banner.png"
							alt="Legal Banner"
							className="absolute inset-0 h-full w-full object-cover"
						/>
						<div className="absolute inset-0 z-1 bg-black/60" />
						<div className="absolute inset-0 z-2 container mx-auto flex items-center justify-center text-center">
							<div className="space-y-4 text-white">
								<h1 className="text-4xl font-bold sm:text-5xl">Legal Center</h1>
								<p className="text-lg text-white/80">
									Your data, your rights, our responsibility.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<main className="container mx-auto w-full space-y-10 px-4 pt-20">
				<div className="prose dark:prose-invert">{children}</div>
			</main>
		</div>
	);
}
