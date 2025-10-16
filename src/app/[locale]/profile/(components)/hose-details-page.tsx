"use client";

import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	ChevronRight,
	Download,
	Ellipsis,
	ShoppingCart,
	SquarePen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductDetailsModal from "./product-details-modal";
import { S2EquipmentsAccordion } from "./hose-details-accordions/s2-equipments";
import { HoseAccordion } from "./hose-details-accordions/hose";
import { AdditionalEquipmentAccordion } from "./hose-details-accordions/additional-equipment";
import { OtherDetailsAccordion } from "./hose-details-accordions/other-details";
import { InspectionsAccordion } from "./hose-details-accordions/inspections";
import { DocumentsAccordion } from "./hose-details-accordions/documents";
import { StructureAccordion } from "./hose-details-accordions/structure";
import { HistoricAccordion } from "./hose-details-accordions/historic";
import { AssetIdSelector } from "./asset-id-selector";
import { HoseActionsDropdown } from "./hose-actions-dropdown";

interface Props {
	hoseId: string;
	onBack: (hoseId: string) => void;
}

export default function HoseDetailsPage({ onBack }: Props) {
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState("25252525");
	const [isAddingToCart, setIsAddingToCart] = useState(false);

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

	const assetIdOptions = [
		{
			value: "25252525",
			label: "000000000000000000025252525",
			status: "Levert",
		},
		{
			value: "25252826",
			label: "000000000000000000025252826",
			status: "Installert",
		},
		{
			value: "25252827",
			label: "000000000000000000025252827",
			status: "Utrangert",
		},
		{
			value: "25252828",
			label: "000000000000000000025252828",
			status: "Resirkulert",
		},
	];

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
							<AssetIdSelector
								value={selectedAssetId}
								options={assetIdOptions}
								onValueChange={setSelectedAssetId}
							/>
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
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full`}>
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
						onClick={() => setIsEditMode(!isEditMode)}
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<SquarePen /> {isEditMode ? "Avbryt" : "Rediger"}
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
					<HoseActionsDropdown
						selectedCount={1}
						isAddingToCart={isAddingToCart}
						onAddToCart={() => {
							setIsAddingToCart(true);
							// Add to cart logic here
							setTimeout(() => setIsAddingToCart(false), 1000);
						}}
						onContactSupport={() => console.log("Contact support")}
						onReportReplacement={() => console.log("Report replacement")}
						onDiscardEquipment={() => console.log("Discard equipment")}
						onPrintCertificate={() => console.log("Print certificate")}
						onPrintTags={() => console.log("Print tags")}
						onPrintTestCertificates={() =>
							console.log("Print test certificates")
						}
						onExport={() => console.log("Export")}
						triggerButton={
							<Button
								className="border-[#C1C4C2] text-[#0F1912]"
								variant="outline">
								<Ellipsis /> Mer
							</Button>
						}
						align="end"
					/>
				</div>
			</div>

			<div className="rounded-md bg-white px-6 py-4">
				<Accordion
					type="multiple"
					className="space-y-3">
					<S2EquipmentsAccordion isEditMode={isEditMode} />

					<HoseAccordion
						isEditMode={isEditMode}
						setIsProductModalOpen={setIsProductModalOpen}
					/>

					<AdditionalEquipmentAccordion isEditMode={isEditMode} />

					<OtherDetailsAccordion isEditMode={isEditMode} />

					<InspectionsAccordion isEditMode={isEditMode} />

					<DocumentsAccordion
						documents={documents}
						isEditMode={isEditMode}
					/>

					<StructureAccordion isEditMode={isEditMode} />

					<HistoricAccordion
						historyData={historyData}
						expandedRows={expandedRows}
						toggleRow={toggleRow}
						isEditMode={isEditMode}
					/>
				</Accordion>
			</div>

			<ProductDetailsModal
				isOpen={isProductModalOpen}
				onClose={() => setIsProductModalOpen(false)}
			/>
		</div>
	);
}
