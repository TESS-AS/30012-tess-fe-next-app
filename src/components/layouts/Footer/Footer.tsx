"use client";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = {
	hjelp: [
		{ label: "Kontakt oss", href: "https://www.tess.no/kontakt-oss" },
		/*{ label: "Vanlige spørsmål", href: "/faq" },*/
		{ label: "Kjøpsbetingelser(e-handel)", href: "https://www.tess.no/contentassets/4aa7934af5954974ac3a623fbe7faa61/salgsvilkar-for-varer.pdf" },
		{ label: "Slangehåndbok", href: "https://viewer.ipaper.io/tess-as/slangehaandbok-2025-2026/" },
		{
			label: "Salgs- og leveringsbetingelser",
			href: "/salgs-leveringsbetingelser",
		},
		{ label: "Personvernerklæring", href: "/personvern" },
	],
	tjenester: [
		{ label: "Slangekontroll THM", href: "https://www.tess.no/thm" },
		{ label: "Integrerte forsyningsløsninger", href: "https://www.tess.no/forsyningslosninger" },
		{ label: "Mobilservice", href: "https://www.tess.no/mobilservice" },
		{ label: "Slangevakt 02018", href: "https://www.tess.no/slangevakt" },
	],
	detteErTess: [
		{ label: "Om oss", href: "https://www.tess.no/om-oss" },
		{ label: "Bærekraft", href: "https://www.tess.no/barekraft" },
		{ label: "Sertifiseringer", href: "https://www.tess.no/sertifiseringer" },
		{ label: "Jobb og karriere", href: "https://www.tess.no/karriere" },
	],
};

const socialLinks = [
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/company/tess/posts/?feedView=all",
		icon: Linkedin,
	}/*,
	{
		name: "Instagram",
		href: "https://instagram.com",
		icon: Instagram,
	},
	{
		name: "Facebook",
		href: "https://facebook.com",
		icon: Facebook,
	},*/
];

export function Footer() {
	return (
		<footer className="relative left-[calc(-50vw+50%)] w-[100vw] overflow-hidden bg-[#1A211C] text-white">
			<div className="relative container mx-auto px-4 py-10 sm:px-6 md:py-16 lg:px-0">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-12">
					{/* Left Column - Logo and Company Info */}
					<div className="sm:col-span-2 lg:col-span-3">
						<div className="mb-6 flex items-center gap-3">
							<Link
								href="/"
								className="flex items-center gap-2">
								<Image
									src="/images/white-logo.svg"
									alt="Logo"
									width={190}
									height={190}
								/>
							</Link>
						</div>

						<p className="text-base mb-6 leading-relaxed font-light text-[#C1C4C2] md:mb-8">
							Din pålitelige partner innen teknisk utstyr og tjenester – siden
							1968.
						</p>

						<div className="mb-6 space-y-3 md:mb-8">
							<div className="flex items-center gap-3">
								<Mail className="h-4 w-4 shrink-0 text-green-500" />
								<span className="text-base font-light text-[#C1C4C2]">
									tess@tess.no
								</span>
							</div>
							<div className="flex items-center gap-3">
								<Phone className="h-4 w-4 shrink-0 text-green-500" />
								<span className="text-base font-light text-[#C1C4C2]">
									Hovedkontor 32 84 40 00
								</span>
							</div>
						</div>

						<div className="flex space-x-4">
							{socialLinks.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.name}
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#C1C4C2] transition-colors hover:text-white">
										<span className="sr-only">{item.name}</span>
										<Icon className="h-5 w-5" />
									</Link>
								);
							})}
						</div>
					</div>

					<div className="lg:col-span-3">
						<h3 className="text-base mb-4 font-semibold text-white md:mb-6">HJELP</h3>
						<ul className="space-y-3">
							{footerLinks.hjelp.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-base font-light text-[#C1C4C2] transition-colors hover:text-white">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* TJENESTER Column */}
					<div className="lg:col-span-3">
						<h3 className="text-base mb-4 font-semibold text-white md:mb-6">TJENESTER</h3>
						<ul className="space-y-3">
							{footerLinks.tjenester.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-base font-light text-[#C1C4C2] transition-colors hover:text-white">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* DETTE ER TESS Column */}
					<div className="lg:col-span-3">
						<h3 className="text-base mb-4 font-semibold text-white md:mb-6">
							DETTE ER TESS
						</h3>
						<ul className="space-y-3">
							{footerLinks.detteErTess.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-base font-light text-gray-300 transition-colors hover:text-white">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-10 border-t border-gray-600 pt-6 pb-8 md:mt-16 md:pt-8 md:pb-12">
					<div className="text-center">
						<p className="text-base text-[#C1C4C2]">
							© TESS AS {new Date().getFullYear()}
						</p>
					</div>
				</div>
								<div className="absolute right-0 bottom-0 flex h-20 w-full items-end justify-center pr-10 sm:h-28 md:w-auto md:justify-end">
					<div className="flex gap-3 sm:gap-6">
						<div className="h-10 w-7 origin-bottom-left -skew-x-[30deg] bg-[#00A651] sm:h-16 sm:w-10"></div>
						<div className="h-10 w-7 origin-bottom-left -skew-x-[30deg] bg-[#00A651] sm:h-16 sm:w-10"></div>
						<div className="h-10 w-7 origin-bottom-left -skew-x-[30deg] bg-[#00A651] sm:h-16 sm:w-10"></div>
					</div>
				</div>
			</div>
		</footer>
	);
}
