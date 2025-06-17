"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="container mx-auto max-w-7xl py-16">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardContent className="text-muted-foreground space-y-6 p-8 text-sm leading-relaxed sm:text-base">
						<h1 className="text-foreground text-3xl font-bold">
							Terms of Service
						</h1>
						<p>
							By accessing or using our platform, you agree to be bound by these
							terms. Please read them carefully.
						</p>

						<div>
							<h2 className="text-foreground text-xl font-semibold">
								1. Use of the Service
							</h2>
							<p>
								You may use the service only for lawful purposes. Any misuse may
								result in suspension or termination.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="text-muted-foreground space-y-6 p-8 text-sm leading-relaxed sm:text-base">
						<div>
							<h2 className="text-foreground text-xl font-semibold">
								2. User Responsibilities
							</h2>
							<ul className="list-inside list-disc pl-4">
								<li>Keep your account credentials safe</li>
								<li>Provide accurate, current information</li>
								<li>Respect the terms outlined herein</li>
							</ul>
						</div>

						<div>
							<h2 className="text-foreground text-xl font-semibold">
								3. Changes to Terms
							</h2>
							<p>
								We reserve the right to update these terms at any time.
								Continued use implies agreement with the latest version.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}
