"use client";

import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";

const footerLinks = {
	company: [
		{ label: "about", href: "/about" },
		{ label: "careers", href: "/careers" },
		{ label: "contact", href: "/contact" },
	],
	support: [
		{ label: "help", href: "/legal" }, // Help Center
		{ label: "shipping", href: "/legal/shipping-policy" },
		{ label: "returns", href: "/legal/refund-policy" },
	],
	legal: [
		{ label: "terms", href: "/legal/terms" },
		{ label: "privacy", href: "/legal/privacy-policy" },
		{ label: "cookies", href: "/legal/cookies" },
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
		<footer className="relative left-[calc(-50vw+50%)] pb-[60px] mt-20 w-[100vw] bg-[#222222] text-zinc-100">
			<div className="container mx-auto py-12 relative">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
					<div className="lg:col-span-5">
						<Link
							href="/"
							className="flex items-center gap-2">
							<Image
								src="/images/logo-white.svg"
								alt="Logo"
								width={144}
								height={144}
							/>
						</Link>
						<p className="mt-4 text-sm text-zinc-400">
							{t("companyDescription")}
						</p>
						<div className="flex space-x-6 mt-8">
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
										<Icon className="h-4 w-4" />
									</Link>
								);
							})}
						</div>
					</div>

					<div className="lg:col-span-2">
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

					<div className="lg:col-span-2">
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

					<div className="lg:col-span-3">
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

				<div className="mt-28 border-t border-neutral-500 pt-6 pb-6">
					<div className="flex items-center justify-center gap-4 md:flex-row h-[80px]">
						<p className="text-[#C1C4C2] font-light">
							&copy; {t("companyName")} {new Date().getFullYear()}
						</p>
					</div>
				</div>
				<Image
					src="/images/Parallellogram.svg"
					alt="Logo"
					width={220}
					height={220}
					className="absolute bottom-0 right-0"
				/>
			</div>
		</footer>
	);
}
