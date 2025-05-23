"use client";

import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const footerLinks = {
	company: [
		{ label: "about", href: "/about" },
		{ label: "careers", href: "/careers" },
		{ label: "contact", href: "/contact" },
	],
	support: [
		{ label: "help", href: "/help" },
		{ label: "shipping", href: "/shipping" },
		{ label: "returns", href: "/returns" },
	],
	legal: [
		{ label: "terms", href: "/terms" },
		{ label: "privacy", href: "/privacy" },
		{ label: "cookies", href: "/cookies" },
	],
};

const socialLinks = [
	{
		name: "Facebook",
		href: "https://facebook.com",
		icon: Facebook,
	},
	{
		name: "Instagram",
		href: "https://instagram.com",
		icon: Instagram,
	},
	{
		name: "Twitter",
		href: "https://twitter.com",
		icon: Twitter,
	},
	{
		name: "LinkedIn",
		href: "https://linkedin.com",
		icon: Linkedin,
	},
];

export function Footer() {
	const t = useTranslations("Footer");

	return (
		<footer className="relative left-[calc(-50vw+50%)] w-[100vw] bg-[#222222] text-zinc-100">
			<div className="container mx-auto py-12">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
					<div>
						<h3 className="text-lg font-semibold">{t("companyName")}</h3>
						<p className="mt-4 text-sm text-zinc-400">
							{t("companyDescription")}
						</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold">Company</h3>
						<ul className="mt-4 space-y-2">
							{footerLinks.company.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-zinc-400 transition-colors hover:text-white">
										{t(link.label)}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-semibold">Support</h3>
						<ul className="mt-4 space-y-2">
							{footerLinks.support.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-zinc-400 transition-colors hover:text-white">
										{t(link.label)}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-semibold">Legal</h3>
						<ul className="mt-4 space-y-2">
							{footerLinks.legal.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-zinc-400 transition-colors hover:text-white">
										{t(link.label)}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-12 border-t border-neutral-500 pt-8">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="flex space-x-6">
							{socialLinks.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.name}
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-white transition-colors hover:text-green-600">
										<span className="sr-only">{item.name}</span>
										<Icon className="h-5 w-5" />
									</Link>
								);
							})}
						</div>
						<p className="text-sm text-green-600">
							&copy; {new Date().getFullYear()} {t("companyName")}.{" "}
							{t("rights")}
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
