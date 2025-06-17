"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const legalLinks = [
	{
		title: "Privacy Policy",
		href: "/legal/privacy-policy",
		description: "How we handle your data.",
	},
	{
		title: "Terms of Service",
		href: "/legal/terms",
		description: "The rules of using our platform.",
	},
	{
		title: "Refund Policy",
		href: "/legal/refund-policy",
		description: "When and how refunds apply.",
	},
	{
		title: "Shipping Policy",
		href: "/legal/shipping-policy",
		description: "Everything about delivery.",
	},
];

export default function LegalIndexPage() {
	return (
		<div className="container mx-auto min-h-[70vh]">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="mx-auto mb-10 text-center">
				<h1 className="text-4xl font-bold tracking-tight">
					Important Information
				</h1>
				<p className="text-muted-foreground mx-auto mt-4 max-w-4xl text-lg">
					Here you will find all the essential legal documents related to your
					use of our platform. We believe in transparency and want you to know
					your rights, responsibilities, and how we protect your data.
				</p>
			</motion.div>

			{/* Cards Grid */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
				className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
				<>
					{legalLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="group">
							<Card className="hover:border-primary transition-all hover:scale-[1.015] hover:shadow-xl">
								<CardContent className="flex h-full min-h-[200px] flex-col justify-between p-6">
									<div className="space-y-2">
										<h2 className="group-hover:text-primary text-xl font-semibold transition-colors">
											{link.title}
										</h2>
										<p className="text-muted-foreground text-sm">
											{link.description}
										</p>
									</div>
									<div className="text-primary mt-4 flex items-center transition-transform group-hover:translate-x-1">
										<span className="text-sm font-medium">Read more</span>
										<ArrowRight className="ml-2 h-4 w-4" />
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</>
			</motion.div>
		</div>
	);
}
