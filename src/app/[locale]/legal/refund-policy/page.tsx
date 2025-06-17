"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
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
							Refund Policy
						</h1>
						<p>
							We want you to be satisfied with your purchase. Here is how we
							handle refund requests.
						</p>

						<div>
							<h2 className="text-foreground text-xl font-semibold">
								1. Eligibility
							</h2>
							<p>
								Refunds are available within 14 days of purchase, provided the
								product is unused or defective.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="text-muted-foreground space-y-6 p-8 text-sm leading-relaxed sm:text-base">
						<div>
							<h2 className="text-foreground text-xl font-semibold">
								2. How to Request
							</h2>
							<ul className="list-inside list-disc pl-4">
								<li>Contact our support with your order ID</li>
								<li>Specify the issue or reason for refund</li>
								<li>Wait for confirmation (usually within 3–5 days)</li>
							</ul>
						</div>

						<div>
							<h2 className="text-foreground text-xl font-semibold">
								3. Non-Refundable Items
							</h2>
							<p>
								Customized products, used goods, or digital items marked as
								final sale are not eligible for refund.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}
