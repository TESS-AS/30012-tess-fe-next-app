"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Barcode,
	ChevronRight,
	Download,
	Ellipsis,
	FileText,
	Settings,
	ShoppingCart,
	SquarePen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
	hoseId: string;
	onBack: (hoseId: string) => void;
}

export default function HoseDetailsPage({ onBack }: Props) {
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
							<p className="text-sm text-[#5A615D]">Detaljer om slange...</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="andre-detaljer"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Andre detaljer
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<p className="text-sm text-[#5A615D]">Tilleggsinformasjon...</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="inspeksjon"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Inspeksjon
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<p className="text-sm text-[#5A615D]">Historikk og status...</p>
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
									<AccordionTrigger className="p-0 text-sm font-normal text-[#0F1912] hover:no-underline">
										<div className="flex items-center gap-2">
											<ChevronRight className="h-4 w-4" />
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
												<AccordionTrigger className="p-0 text-sm font-normal text-[#0F1912] hover:no-underline">
													<div className="flex items-center gap-2">
														<ChevronRight className="h-4 w-4" />
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
															<AccordionTrigger className="p-0 text-sm font-normal text-[#0F1912] hover:no-underline">
																<div className="flex items-center gap-2">
																	<ChevronRight className="h-4 w-4" />
																	<Settings className="h-4 w-4 text-[#5A615D]" />
																	<span>Eq. no N/A : Deck Crane</span>
																</div>
															</AccordionTrigger>
															<AccordionContent className="ml-6 pt-1 pb-0">
																<div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm">
																	<ChevronRight className="h-4 w-4" />
																	<Settings className="h-4 w-4 text-[#5A615D]" />
																	<span>Eq. no N/A : Deck Crane 250</span>
																</div>
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
													</Accordion>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem
						value="historikk"
						className="border-none">
						<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
							Historikk
						</AccordionTrigger>
						<AccordionContent className="p-0">
							<div className="overflow-hidden rounded border">
								<table className="w-full text-left text-sm">
									<thead className="bg-[#F8F9F8] text-[#5A615D]">
										<tr>
											<th className="px-3 py-2">Arbeidsordrenummer (WO)</th>
											<th className="px-3 py-2">Beskrivelse</th>
											<th className="px-3 py-2">Dato fullført</th>
										</tr>
									</thead>
									<tbody>
										<tr className="border-t">
											<td className="px-3 py-2 text-emerald-700">
												000000000000025252525
											</td>
											<td className="px-3 py-2">
												KUNDE-ID OPPDATERT AV FIQMAR1
											</td>
											<td className="px-3 py-2">11.08.2025</td>
										</tr>
									</tbody>
								</table>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
