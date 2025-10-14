"use client";

import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Barcode,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	Download,
	Ellipsis,
	FileText,
	Info,
	Settings,
	ShoppingCart,
	SquarePen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductDetailsModal from "./product-details-modal";

interface Props {
	hoseId: string;
	onBack: (hoseId: string) => void;
}

export default function HoseDetailsPage({ onBack }: Props) {
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);

	const hoseId = "HOSE ECB81-08";
	const title = `${hoseId} · 55220PSI SISTEMA CO2 x 700 mm`;

	const keyInfo = {
		location: "Deck crane port side",
		assetId: "a5454545 (gjeldende)",
		images: 32,
		status: [
			{ label: "Levert, aktiv", ok: true },
			{ label: "Mangler opplysninger", ok: false },
		],
	};

	const documents = [
		{ id: "doc1", name: "Dokument 1" },
		{ id: "doc2", name: "Dokument 2" },
	];

	const historyData = [
		{
			id: "25252525",
			workOrder: "000000000000025252525",
			description: "KUNDE-DB OPPDATERT AV FIQMAR11",
			date: "11. 08. 2025",
			details: [
				{
					workOrder: "5049205",
					description: "KUNDE-DB OPPDATERT AV FIQMAR11",
					date: "11. 08. 2025",
					link: "SE KOMMENTARER FOR DETALJER",
				},
				{
					workOrder: "4140106",
					description: "CUSTOMER DB UPDATE BY: 2239FULL",
					date: "31.12.24",
					link: "SE KOMMENTARER FOR DETALJER",
				},
				{
					workOrder: "4140108",
					description: "PRESSURE TEST CERTIFICATE",
					date: "31.12.22",
					link: null,
				},
			],
		},
		{
			id: "25252524",
			workOrder: "000000000000025252524",
			description: "KUNDE-ID OPPDATERT AV FIQMAR1",
			date: "11.08.2025",
			details: [
				{
					workOrder: "5049205",
					description: "KUNDE-DB OPPDATERT AV FIQMAR11",
					date: "11. 08. 2025",
					link: "SE KOMMENTARER FOR DETALJER",
				},
				{
					workOrder: "4140106",
					description: "CUSTOMER DB UPDATE BY: 2239FULL",
					date: "31.12.24",
					link: "SE KOMMENTARER FOR DETALJER",
				},
				{
					workOrder: "4140108",
					description: "PRESSURE TEST CERTIFICATE",
					date: "31.12.22",
					link: null,
				},
			],
		},
		{
			id: "25252523",
			workOrder: "000000000000025252523",
			description: "KUNDE-ID OPPDATERT AV FIQMAR1",
			date: "11.08.2025",
			details: [],
		},
	];

	const toggleRow = (id: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	return (
		<div className="mx-auto max-w-[1200px] space-y-4">
			<div className="rounded-lg bg-white shadow">
				<div className="flex items-stretch justify-between gap-4 px-6 py-4">
					<div className="flex flex-1 flex-col border-r border-[#E8EAE9] pr-4">
						<h3 className="mb-2 font-bold text-[#0F1912]">Slange/utstyr</h3>
						<p className="text-sm text-[#5A615D]">{title}</p>
					</div>

					<div className="flex flex-1 flex-col border-r border-[#E8EAE9] pr-4">
						<h3 className="mb-2 font-bold text-[#0F1912]">
							Nøkkel informasjon
						</h3>
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-sm text-[#5A615D]">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
									<circle
										cx="12"
										cy="10"
										r="3"
									/>
								</svg>
								{keyInfo.location}
							</div>
							<Select defaultValue="a5454545">
								<SelectTrigger className="mt-2 h-8 w-full border-[#C1C4C2] bg-white px-2 py-1 text-xs">
									<div className="flex items-center gap-2">
										<Barcode className="h-4 w-4" />
										<SelectValue />
									</div>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="a5454545">a5454545 (gjeldende)</SelectItem>
									<SelectItem value="a5454546">a5454546</SelectItem>
									<SelectItem value="a5454547">a5454547</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex flex-1 flex-col border-r border-[#E8EAE9] pr-4">
						<div className="mb-2 flex items-center justify-between">
							<h3 className="mb-2 font-bold text-[#0F1912]">Bilder</h3>
							<Link
								href="#"
								className="flex items-center text-sm text-emerald-700 hover:underline">
								Vis alle <ChevronRight className="h-4 w-4" />
							</Link>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex gap-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="h-14 w-14 overflow-hidden rounded-md bg-[#F3F4F3]"
									/>
								))}
							</div>
							<span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-[#F3F4F3] text-sm text-[#0F1912]">
								+{keyInfo.images}
							</span>
						</div>
					</div>

					<div className="flex flex-1 flex-col">
						<h3 className="mb-2 font-bold text-[#0F1912]">Status</h3>
						<div className="space-y-2">
							{keyInfo.status.map((s, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between gap-2">
									<span className="text-sm text-[#0F1912]">{s.label}</span>
									<div
										className={`flex h-5 w-5 items-center justify-center rounded-full`}>
										{s.ok ? (
											<Image
												src="/icons/check-filled.svg"
												alt="checked"
												width={20}
												height={20}
											/>
										) : (
											<Image
												src="/icons/red-alert-filled.svg"
												alt="alert"
												width={20}
												height={20}
											/>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="flex justify-end gap-4 rounded-b-lg bg-[#F8F9F8] px-6 py-3">
					<Button
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<SquarePen /> Rediger
					</Button>
					<Button
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<ShoppingCart /> Legg til i handlekurv
					</Button>
					<Button
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<Download /> Eksporter
					</Button>
					<Button
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<Ellipsis /> Mer
					</Button>
				</div>
			</div>

			<div className="rounded-md bg-white px-6 py-4">
				<Accordion
					type="multiple"
					className="space-y-3">
					<AccordionItem
						value="s2-utstyr"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							S2-utstyr
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<table className="w-full text-sm">
								<tbody>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">S2-utstyr</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Deck crane port side
										</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">Kundeutstyr nr</td>
										<td className="px-4 py-3 text-[#0F1912]">4521-39.80</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">
											System WP (BAR)
										</td>
										<td className="px-4 py-3 text-[#0F1912]">—</td>
									</tr>
								</tbody>
							</table>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="slange"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Slange
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<div className="flex">
								<table className="w-1/2 border-r border-[#E8EAE9] text-sm">
									<tbody>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">POS ID:</td>
											<td className="px-4 py-3 text-[#0F1912]">2343052</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">Beskrivelse</td>
											<td className="px-4 py-3 text-[#0F1912]">
												5256-08 × 1000 mm
											</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Lengde (mm)</td>
											<td className="px-4 py-3 text-[#0F1912]">1000</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Arbeidstrykk (BAR)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">12500-04</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Arbeidstrykk (PSI)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">Slangetype</td>
											<td className="px-4 py-3 text-[#0F1912]">
												<div className="flex items-center justify-between">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-default">5256-08</span>
															</TooltipTrigger>
															<TooltipContent
																side="top"
																className="bg-[#1F2421] p-3 text-white">
																<div className="space-y-1">
																	<p className="font-semibold">12500-04</p>
																	<p className="text-sm">
																		TEFLONHOSE 1/4&quot;
																	</p>
																	<p className="text-sm">TYPE AFX</p>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
													<Button
														variant="outline"
														size="sm"
														onClick={() => setIsProductModalOpen(true)}
														className="flex items-center gap-1 text-xs">
														<Info className="h-4 w-4" />
														Se detaljer
													</Button>
												</div>
											</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Klasse</td>
											<td className="px-4 py-3 text-[#0F1912]">
												Høytrykksslange
											</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">Hylse 1</td>
											<td className="px-4 py-3 text-[#0F1912]">65125-08</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Hylse 2</td>
											<td className="px-4 py-3 text-[#0F1912]">65125-08</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">Innstikk 1</td>
											<td className="px-4 py-3 text-[#0F1912]">6505-08-08</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Innstikk 2</td>
											<td className="px-4 py-3 text-[#0F1912]">6501-08</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Koblingsorientering
											</td>
											<td className="px-4 py-3 text-[#0F1912]">0°</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Priklet</td>
											<td className="px-4 py-3 text-[#0F1912]">Nei</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Medium / temperatur
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Funksjon</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Slangegaranti
											</td>
											<td className="px-4 py-3 text-[#0F1912]">Nei</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Kommentar til garanti
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
									</tbody>
								</table>
								<table className="w-1/2 text-sm">
									<tbody>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">RFID</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Generisk slangetype
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Type kobling ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Generisk dim ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Kjønn ende 1</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Vinkel ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Materialkvalitet ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Type kobling ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Generisk dim ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">Kjønn ende 2</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Vinkel ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Materialkvalitet ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Generell kommentar (PTC)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Kommentar ende 1 (PTC)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Kommentar ende 2 (PTC)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Tilleggskommentar
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Opprinnelig slangekommentar
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
									</tbody>
								</table>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="tilleggsutstyr"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Tilleggsutstyr på slangen
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<div className="flex">
								<table className="w-1/2 border-r border-[#E8EAE9] text-sm">
									<tbody>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg A ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg B ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg C ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg D ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg E ende 1
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Slangetrommel
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">Spiralvern</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Slangebeskyttelse
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
									</tbody>
								</table>
								<table className="w-1/2 text-sm">
									<tbody>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg A ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg B ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg C ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg D ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Tillegg E ende 2
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Krok (Hookie)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-[#F8F9F8]">
											<td className="px-4 py-3 text-[#5A615D]">
												Sikkerhetswire (whipcheck)
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
										<tr className="bg-white">
											<td className="px-4 py-3 text-[#5A615D]">
												Nødkobling / bruddkobling
											</td>
											<td className="px-4 py-3 text-[#0F1912]">—</td>
										</tr>
									</tbody>
								</table>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="andre-detaljer"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Andre detaljer
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<table className="w-[50%] border-r border-[#E8EAE9] text-sm">
								<tbody>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">Kunde-ID nr.</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Individual/SAP/SFI/MMS ID
										</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">Utstyrsdel</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Lifeboat Davit Port
										</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">
											Annen utstyrsinfo
										</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Lifeboat Davit Port
										</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">Tegningsnummer</td>
										<td className="px-4 py-3 text-[#0F1912]">—</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">
											Pos.nr. på tegning
										</td>
										<td className="px-4 py-3 text-[#0F1912]">—</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">
											Artikkelnummer i tegning
										</td>
										<td className="px-4 py-3 text-[#0F1912]">—</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">Pinpricket</td>
										<td className="px-4 py-3 text-[#0F1912]">Yes</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">
											Forurensningseksponering
										</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Internal, not exposed
										</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">UV-eksponering</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Internal, not exposed
										</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">
											Utskiftingskompleksitet
										</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Rope Access / scaffolding
										</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">
											Utskiftingskommentar
										</td>
										<td className="px-4 py-3 text-[#0F1912]">—</td>
									</tr>
								</tbody>
							</table>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="inspeksjon"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Inspeksjon
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<table className="w-[50%] border-r border-[#E8EAE9] text-sm">
								<tbody>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">Tilstand</td>
										<td className="px-4 py-3 text-[#0F1912]">
											In good/perfect condition
										</td>
									</tr>
									<tr className="bg-white">
										<td className="px-4 py-3 text-[#5A615D]">Godkjent</td>
										<td className="px-4 py-3 text-[#0F1912]">YES</td>
									</tr>
									<tr className="bg-[#F8F9F8]">
										<td className="px-4 py-3 text-[#5A615D]">Kommentar</td>
										<td className="px-4 py-3 text-[#0F1912]">
											Hose is a little short but not...
										</td>
									</tr>
								</tbody>
							</table>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="dokumenter"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Dokumenter
						</AccordionTrigger>
						<AccordionContent className="p-0 pt-4">
							<div className="space-y-4">
								{documents.map((d) => (
									<Link
										key={d.id}
										href="#"
										className="flex items-center gap-3 text-emerald-700">
										<FileText className="h-5 w-5 text-[#003D1A]" />
										<span className="underline underline-offset-3">
											{d.name}
										</span>
									</Link>
								))}
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="struktur"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Struktur
						</AccordionTrigger>
						<AccordionContent className="p-0 pt-4">
							<Accordion
								type="multiple"
								className="space-y-1">
								<AccordionItem
									value="test-princess"
									className="border-none">
									<AccordionTrigger className="cursor-pointer flex-row-reverse justify-end p-0 py-1 text-sm font-normal text-[#0F1912] hover:no-underline [&[data-state=open]>svg]:rotate-180">
										<div className="flex items-center gap-2">
											<Settings className="h-4 w-4 text-[#5A615D]" />
											<span>Test Princess</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="ml-6 pt-1 pb-0">
										<Accordion
											type="multiple"
											className="space-y-1">
											<AccordionItem
												value="bls-oem"
												className="border-none">
												<AccordionTrigger className="cursor-pointer flex-row-reverse justify-end p-0 py-1 text-sm font-normal text-[#0F1912] hover:no-underline [&[data-state=open]>svg]:rotate-180">
													<div className="flex items-center gap-2">
														<Settings className="h-4 w-4 text-[#5A615D]" />
														<span>BLS OEM 43</span>
													</div>
												</AccordionTrigger>
												<AccordionContent className="ml-6 pt-1 pb-0">
													<Accordion
														type="multiple"
														className="space-y-1">
														<AccordionItem
															value="deck-crane"
															className="border-none">
															<AccordionTrigger className="cursor-pointer flex-row-reverse justify-end p-0 py-1 text-sm font-normal text-[#0F1912] hover:no-underline [&[data-state=open]>svg]:rotate-180">
																<div className="flex items-center gap-2">
																	<Settings className="h-4 w-4 text-[#5A615D]" />
																	<span>Eq. no N/A : Deck Crane</span>
																</div>
															</AccordionTrigger>
															<AccordionContent className="ml-6 pt-1 pb-0">
																<div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm">
																	<Settings className="h-4 w-4 text-[#5A615D]" />
																	<span>Eq. no N/A : Deck Crane 250</span>
																</div>
															</AccordionContent>
														</AccordionItem>
													</Accordion>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
							<div className="mt-3 flex items-center gap-3 text-xs text-[#5A615D]">
								<div className="flex items-center gap-1">
									<Settings className="h-4 w-4" />
									<span>S2</span>
								</div>
								<div className="flex items-center gap-1">
									<Settings className="h-4 w-4" />
									<span>Utstyr/Equipment</span>
								</div>
								<div className="flex items-center gap-1">
									<Settings className="h-4 w-4" />
									<span>Utstyr/Equipment subcategory</span>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="historikk"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Historikk
						</AccordionTrigger>
						<AccordionContent className="p-0 pt-4">
							<div className="overflow-hidden rounded border">
								<table className="w-full text-left text-sm">
									<tbody>
										{historyData.map((row) => (
											<>
												<tr
													key={row.id}
													className="cursor-pointer border-t bg-[#F8F9F8] hover:bg-[#F0F1F0]"
													onClick={() => toggleRow(row.id)}>
													<td className="px-3 py-3">
														<span className="text-emerald-700">
															{row.workOrder.slice(-8)}
														</span>
														<span className="text-[#5A615D]"> (gjeldende)</span>
													</td>
													<td className="flex justify-end px-3 py-3">
														{expandedRows.has(row.id) ? (
															<ChevronUp className="h-4 w-4 text-[#0F1912]" />
														) : (
															<ChevronDown className="h-4 w-4 text-[#0F1912]" />
														)}
													</td>
												</tr>
												{expandedRows.has(row.id) && row.details.length > 0 && (
													<tr>
														<td
															colSpan={4}
															className="border-t bg-white p-0">
															<table className="w-full">
																<thead className="bg-[#F8F9F8] text-xs text-[#5A615D] uppercase">
																	<tr>
																		<th className="px-3 py-2 font-normal">
																			ARBEIDSORDRENUMMER (WO)
																		</th>
																		<th className="px-3 py-2 font-normal">
																			BESKRIVELSE
																		</th>
																		<th className="px-3 py-2 font-normal">
																			DATO FULLFØRT
																		</th>
																		<th className="w-10"></th>
																	</tr>
																</thead>
																<tbody>
																	{row.details.map((detail, idx) => (
																		<tr
																			key={idx}
																			className="border-t">
																			<td className="px-3 py-3 text-[#0F1912]">
																				{detail.workOrder}
																			</td>
																			<td className="px-3 py-3">
																				<div className="text-[#0F1912]">
																					{detail.description}
																				</div>
																				{detail.link && (
																					<Link
																						href="#"
																						className="text-emerald-700 underline">
																						{detail.link}
																					</Link>
																				)}
																			</td>
																			<td className="px-3 py-3 text-[#0F1912]">
																				{detail.date}
																			</td>
																			<td className="w-10"></td>
																		</tr>
																	))}
																</tbody>
															</table>
														</td>
													</tr>
												)}
											</>
										))}
									</tbody>
								</table>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<ProductDetailsModal
				isOpen={isProductModalOpen}
				onClose={() => setIsProductModalOpen(false)}
			/>
		</div>
	);
}
