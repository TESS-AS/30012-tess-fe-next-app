"use client";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = {
	hjelp: [
		{ label: "Kontakt oss", href: "/kontakt" },
		{ label: "Vanlige spørsmål", href: "/faq" },
		{ label: "Kjøpsbetingelser(e-handel)", href: "/kjopsbetingelser" },
		{ label: "Slangehåndbok", href: "/slangehandbok" },
		{
			label: "Salgs- og leveringsbetingelser",
			href: "/salgs-leveringsbetingelser",
		},
		{ label: "Personvernerklæring", href: "/personvern" },
	],
	tjenester: [
		{ label: "Slangekontroll THM", href: "/slangekontroll" },
		{ label: "Integrerte forsyningsløsninger", href: "/forsyningslosninger" },
		{ label: "Mobilservice", href: "/mobilservice" },
		{ label: "Slangevakt 02018", href: "/slangevakt" },
	],
	detteErTess: [
		{ label: "Om oss", href: "/om-oss" },
		{ label: "Bærekraft", href: "/baerekraft" },
		{ label: "Sertifiseringer", href: "/sertifiseringer" },
		{ label: "Jobb og karriere", href: "/karriere" },
	],
};

const socialLinks = [
	{
		name: "LinkedIn",
		href: "https://linkedin.com",
		icon: Linkedin,
	},
	{
		name: "Instagram",
		href: "https://instagram.com",
		icon: Instagram,
	},
	{
		name: "Facebook",
		href: "https://facebook.com",
		icon: Facebook,
	},
];

export function Footer() {
	return (
		<footer className="relative left-[calc(-50vw+50%)] w-[100vw] bg-[#1A211C] text-white">
			<div className="relative container mx-auto px-6 py-16">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
					{/* Left Column - Logo and Company Info */}
					<div className="lg:col-span-3">
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

						<p className="text-md mb-8 leading-relaxed font-light text-[#C1C4C2]">
							Din pålitelige partner innen teknisk utstyr og tjenester – siden
							1968.
						</p>

						<div className="mb-8 space-y-3">
							<div className="flex items-center gap-3">
								<Mail className="h-4 w-4 text-green-500" />
								<span className="text-md font-light text-[#C1C4C2]">
									tess@tess.no
								</span>
							</div>
							<div className="flex items-center gap-3">
								<Phone className="h-4 w-4 text-green-500" />
								<span className="text-md font-light text-[#C1C4C2]">
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
						<h3 className="text-md mb-6 font-semibold text-white">HJELP</h3>
						<ul className="space-y-3">
							{footerLinks.hjelp.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-md font-light text-[#C1C4C2] transition-colors hover:text-white">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* TJENESTER Column */}
					<div className="lg:col-span-3">
						<h3 className="text-md mb-6 font-semibold text-white">TJENESTER</h3>
						<ul className="space-y-3">
							{footerLinks.tjenester.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-md font-light text-[#C1C4C2] transition-colors hover:text-white">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* DETTE ER TESS Column */}
					<div className="lg:col-span-3">
						<h3 className="text-md mb-6 font-semibold text-white">
							DETTE ER TESS
						</h3>
						<ul className="space-y-3">
							{footerLinks.detteErTess.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-md font-light text-gray-300 transition-colors hover:text-white">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-16 border-t border-gray-600 pt-8 pb-12">
					<div className="text-center">
						<p className="text-md text-[#C1C4C2]">
							© TESS AS {new Date().getFullYear()}
						</p>
					</div>
				</div>
				<div className="absolute right-10 bottom-0 flex h-32 w-full items-end justify-end">
					<div className="flex gap-6 pr-8 pb-4">
						<div className="h-20 w-12 origin-bottom-left -skew-x-[30deg] bg-[#00A651]"></div>
						<div className="h-20 w-12 origin-bottom-left -skew-x-[30deg] bg-[#00A651]"></div>
						<div className="h-20 w-12 origin-bottom-left -skew-x-[30deg] bg-[#00A651]"></div>
					</div>
				</div>
			</div>
		</footer>
	);
}
