"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ShippingPolicyPage() {
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
							Shipping Policy
						</h1>
						<p>
							We aim to ship your order quickly and efficiently. Here is what
							you should know.
						</p>

						<div>
							<h2 className="text-foreground text-xl font-semibold">
								1. Delivery Times
							</h2>
							<ul className="list-inside list-disc pl-4">
								<li>Standard: 3–7 business days</li>
								<li>Express: 1–3 business days</li>
							</ul>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="text-muted-foreground space-y-6 p-8 text-sm leading-relaxed sm:text-base">
						<div>
							<h2 className="text-foreground text-xl font-semibold">
								2. Tracking
							</h2>
							<p>
								Once your order ships, you will receive an email with a tracking
								link so you can monitor the delivery status.
							</p>
						</div>

						<div>
							<h2 className="text-foreground text-xl font-semibold">
								3. Shipping Zones
							</h2>
							<p>
								We currently ship to all EU countries and selected international
								locations. Shipping costs may vary by region.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}
