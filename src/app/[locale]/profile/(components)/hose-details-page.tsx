"use client";

import { useState } from "react";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useGetHoseDetails } from "@/hooks/useGetHoseDetails";
import { useGetHoseHistory } from "@/hooks/useGetHoseHistory";
import type { LocationNode } from "@/hooks/useGetHoseSystems";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useAppContext } from "@/lib/appContext";
import { postCartKit } from "@/services/carts.service";
import {
	ChevronLeft,
	ChevronRight,
	Download,
	Ellipsis,
	ShoppingCart,
	SquarePen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { AssetIdSelector } from "./asset-id-selector";
import { HoseActionsDropdown } from "./hose-actions-dropdown";
import { AdditionalEquipmentAccordion } from "./hose-details-accordions/additional-equipment";
import { DocumentsAccordion } from "./hose-details-accordions/documents";
import { HistoricAccordion } from "./hose-details-accordions/historic";
import { HoseAccordion } from "./hose-details-accordions/hose";
import { InspectionsAccordion } from "./hose-details-accordions/inspections";
import { OtherDetailsAccordion } from "./hose-details-accordions/other-details";
import { S2EquipmentsAccordion } from "./hose-details-accordions/s2-equipments";
import { StructureAccordion } from "./hose-details-accordions/structure";
import ProductDetailsModal from "./product-details-modal";

interface Props {
	hexagonId: string;
	onBack: () => void;
	hoseSystems: {
		loading: boolean;
		locations: LocationNode[];
		selectedS1Code: string | undefined;
	};
}

export default function HoseDetailsPage({
	hexagonId,
	onBack,
	hoseSystems,
}: Props) {
	const t = useTranslations("HoseDetailsPage");
	const { data: profile } = usePunchoutProfile();
	const { setIsCartChanging } = useAppContext();
	const { hoseHistory, isLoading, error } = useGetHoseHistory(hexagonId);
	const { hoseDetails, isLoading: isLoadingDetails } = useGetHoseDetails(
		hexagonId,
		profile?.defaultCustomerNumber,
	);
	const { locations, loading, selectedS1Code } = hoseSystems;

	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const [isProductModalOpen, setIsProductModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState(
		hoseDetails?.hoseLine?.assetId?.toString() || "",
	);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	// Update selectedAssetId when hoseDetails loads
	const title = hoseDetails?.hoseLine?.itemDescription
		? `${hexagonId} · ${hoseDetails.hoseLine.itemDescription}`
		: `${hexagonId}`;

	const keyInfo = {
		location: hoseDetails?.hoseLine?.s2?.s2Name || "—",
		assetId: hoseDetails?.hoseLine?.assetId?.toString() || "—",
		images: 0, // TODO: Get from API when available
		status: [
			{
				label: hoseDetails?.hoseLine?.currentStatus || "Unknown",
				ok: hoseDetails?.hoseLine?.currentStatus === "Processed",
			},
			{
				label: hoseDetails?.hoseLine?.state || "UNKNOWN",
				ok: hoseDetails?.hoseLine?.state === "GOOD",
			},
		],
	};

	const assetIdOptions = hoseDetails?.hoseLine?.assetId
		? [
				{
					value: hoseDetails.hoseLine.assetId.toString(),
					label: hoseDetails.hoseLine.assetId.toString().padStart(27, "0"),
					status: hoseDetails.hoseLine.currentStatus || "Unknown",
				},
			]
		: [];

	const documents = [
		{ id: "doc1", name: "Dokument 1" },
		{ id: "doc2", name: "Dokument 2" },
	];

	const handleAddToCart = async () => {
		if (!hoseDetails?.hoseLine?.hexagonId || !profile) {
			toast.error("Missing required information to add to cart");
			return;
		}

		setIsAddingToCart(true);
		try {
			const items = [
				{
					hexagonId: parseInt(hoseDetails.hoseLine.hexagonId),
					quantity: 1,
					warehouseNumber: profile.defaultWarehouseNumber || "",
					companyNumber: profile.defaultCompanyNumber || "",
				},
			];

			await postCartKit(items);

			setIsCartChanging(true);
			setTimeout(() => setIsCartChanging(false), 100);

			toast.success("Item added to cart successfully");
		} catch (error) {
			toast.error("Failed to add item to cart");
		} finally {
			setIsAddingToCart(false);
		}
	};

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
		<div className="mx-auto space-y-4">
			<div className="flex items-center justify-between rounded-md">
				<Button
					variant="ghost"
					onClick={onBack}
					className="gap-2 px-0 text-[#0F1912] hover:bg-transparent hover:text-[#003D1A]">
					<ChevronLeft className="h-5 w-5" />
					Gå tilbake til listen
				</Button>

				<div className="flex items-center gap-3">
					<Button
						disabled={
							profile?.defaultCustomerNumber ===
							SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
						}
						onClick={() => setIsEditMode(!isEditMode)}
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<SquarePen /> {isEditMode ? "Avbryt" : "Rediger slangedetaljer"}
					</Button>
					<Button
						onClick={handleAddToCart}
						disabled={isAddingToCart || !hoseDetails}
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<ShoppingCart /> {isAddingToCart ? t("adding") : t("addToCart")}
					</Button>
					<HoseActionsDropdown
						selectedCount={1}
						isAddingToCart={isAddingToCart}
						onAddToCart={handleAddToCart}
						onContactSupport={() => console.log("Contact support")}
						onReportReplacement={() => console.log("Report replacement")}
						onDiscardEquipment={() => console.log("Discard equipment")}
						onPrintCertificate={() => console.log("Print certificate")}
						onPrintTags={() => console.log("Print tags")}
						onPrintTestCertificates={() => {}}
						onExport={() => console.log("Export")}
						triggerButton={
							<Button
								className="border-[#C1C4C2] text-[#0F1912]"
								variant="outline">
								<Ellipsis /> Handlinger
							</Button>
						}
						align="end"
					/>
				</div>
			</div>
			{/* <div className="rounded-lg bg-white shadow">
				<div className="border-b border-[#E8EAE9] px-6 py-3">
					<Button
						variant="ghost"
						onClick={onBack}
						className="gap-2 px-0 text-[#0F1912] hover:bg-transparent hover:text-[#003D1A]">
						<ChevronLeft className="h-5 w-5" />
						{t("backToList")}
					</Button>
				</div>

				<div className="flex items-stretch justify-between gap-4 px-6 py-4">
					<div className="flex flex-1 flex-col border-r border-[#E8EAE9] pr-4">
						<h3 className="mb-2 font-bold text-[#0F1912]">
							{t("hoseEquipment")}
						</h3>
						<p className="text-sm text-[#5A615D]">{title}</p>
					</div>

					<div className="flex flex-1 flex-col border-r border-[#E8EAE9] pr-4">
						<h3 className="mb-2 font-bold text-[#0F1912]">
							{t("keyInformation")}
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
							<h3 className="mb-2 font-bold text-[#0F1912]">{t("images")}</h3>
							<Link
								href="#"
								className="flex items-center text-sm text-emerald-700 hover:underline">
								{t("viewAll")} <ChevronRight className="h-4 w-4" />
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
						<h3 className="mb-2 font-bold text-[#0F1912]">{t("status")}</h3>
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
						disabled={
							profile?.defaultCustomerNumber ===
							SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
						}
						onClick={() => setIsEditMode(!isEditMode)}
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<SquarePen /> {isEditMode ? t("cancel") : t("edit")}
					</Button>
					<Button
						onClick={handleAddToCart}
						disabled={isAddingToCart || !hoseDetails}
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<ShoppingCart /> {isAddingToCart ? t("adding") : t("addToCart")}
					</Button>
					<Button
						disabled
						className="border-[#C1C4C2] text-[#0F1912]"
						variant="outline">
						<Download /> {t("export")}
					</Button>
					<HoseActionsDropdown
						selectedCount={1}
						isAddingToCart={isAddingToCart}
						onAddToCart={handleAddToCart}
						onContactSupport={() => console.log("Contact support")}
						onReportReplacement={() => console.log("Report replacement")}
						onDiscardEquipment={() => console.log("Discard equipment")}
						onPrintCertificate={() => console.log("Print certificate")}
						onPrintTags={() => console.log("Print tags")}
						onPrintTestCertificates={() => {}}
						onExport={() => console.log("Export")}
						triggerButton={
							<Button
								className="border-[#C1C4C2] text-[#0F1912]"
								variant="outline">
								<Ellipsis /> {t("more")}
							</Button>
						}
						align="end"
					/>
				</div>
			</div> */}

			<div className="rounded-md bg-white px-6 py-4">
				<Accordion
					type="multiple"
					defaultValue={["s2-utstyr"]}
					className="space-y-3">
					<S2EquipmentsAccordion
						isEditMode={isEditMode}
						hoseDetails={hoseDetails}
					/>

					<HoseAccordion
						isEditMode={isEditMode}
						setIsProductModalOpen={setIsProductModalOpen}
						hoseDetails={hoseDetails}
						isLoading={isLoadingDetails}
					/>

					<AdditionalEquipmentAccordion
						isEditMode={isEditMode}
						hoseDetails={hoseDetails}
					/>

					<OtherDetailsAccordion
						isEditMode={isEditMode}
						hoseDetails={hoseDetails}
					/>

					{profile?.defaultCustomerNumber !==
						SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER && (
						<>
							<InspectionsAccordion
								isEditMode={isEditMode}
								hoseDetails={hoseDetails}
							/>

							<DocumentsAccordion
								documents={documents}
								isEditMode={isEditMode}
							/>

							<StructureAccordion
								isEditMode={isEditMode}
								s1Codes={locations}
							/>

							<HistoricAccordion
								historyData={hoseHistory}
								expandedRows={expandedRows}
								toggleRow={toggleRow}
								isEditMode={isEditMode}
							/>
						</>
					)}
				</Accordion>
			</div>

			<ProductDetailsModal
				isOpen={isProductModalOpen}
				onClose={() => setIsProductModalOpen(false)}
			/>
		</div>
	);
}
