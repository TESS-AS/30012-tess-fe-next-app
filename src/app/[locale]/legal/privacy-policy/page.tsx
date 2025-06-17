"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="container mx-auto max-w-7xl py-16">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardContent className="text-muted-foreground space-y-6 p-8 text-sm leading-relaxed sm:text-base">
						<div className="space-y-2">
							<h1 className="text-foreground text-3xl font-bold">
								Privacy Policy
							</h1>
							<p>
								We are committed to protecting your personal information. This
								Privacy Policy explains how we collect, use, and safeguard your
								data.
							</p>
						</div>

						<div className="space-y-1">
							<h2 className="text-foreground text-xl font-semibold">
								1. What Information We Collect
							</h2>
							<ul className="list-inside list-disc pl-4">
								<li>Personal identifiers such as name and email</li>
								<li>Payment and billing details</li>
								<li>Usage data such as visited pages</li>
							</ul>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="text-muted-foreground space-y-6 p-8 text-sm leading-relaxed sm:text-base">
						<div className="space-y-1">
							<h2 className="text-foreground text-xl font-semibold">
								2. How We Use Your Information
							</h2>
							<p>
								We use your information to provide services, process orders, and
								enhance user experience.
							</p>
						</div>

						<div className="space-y-1">
							<h2 className="text-foreground text-xl font-semibold">
								3. Your Rights
							</h2>
							<p>
								You have the right to access, correct, or delete your personal
								data at any time.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}
