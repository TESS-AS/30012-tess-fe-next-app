import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GetAssetsResponse } from "@/types/assets.types";
import { useTranslations } from "next-intl";

import { Cell } from "./cell";

interface Props {
	isEditMode: boolean;
	setIsProductModalOpen: (isOpen: boolean, itemNumber?: string) => void;
	hoseDetails: GetAssetsResponse | null;
	isLoading: boolean;
}

export const HoseAccordion = ({
	isEditMode,
	setIsProductModalOpen,
	hoseDetails,
	isLoading,
}: Props) => {
	const t = useTranslations("HoseAccordion");

	const hoseData = hoseDetails?.hoseData;
	const customerData = hoseDetails?.customerData;
	const hoseLine = hoseDetails?.hoseLine;

	console.log(hoseData, "dataa e hossiiit");
	return (
		<AccordionItem
			value="slange"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				{t("title")}
			</AccordionTrigger>
			<AccordionContent className="p-0">
				<div className="flex">
					<table className="w-1/2 border-r border-[#E8EAE9] text-sm">
						<tbody>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("posId")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={customerData?.posNumber || "—"}
										searchable
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">{t("description")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseLine?.itemDescription || "—"}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("lengthMm")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={
											hoseData?.hoselengthMm
												? String(hoseData.hoselengthMm)
												: "—"
										}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("workingPressureBar")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.wpBar ? String(hoseData.wpBar) : "—"}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("workingPressurePsi")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.wpPsi ? String(hoseData.wpPsi) : "—"}
										placeholder={t("placeholders.psi")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">{t("hoseType")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									{isEditMode ? (
										<Cell
											value={hoseData?.hoseType?.hoseTypeName || "—"}
											searchable
											isEditMode={isEditMode}
										/>
									) : hoseData?.hoseType?.hoseTypeName ? (
										<button
											type="button"
											onClick={() =>
												setIsProductModalOpen(true, hoseData.hoseType.hoseTypeName)
											}
											className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-[#0F1912] transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-green-600 active:border-2 active:border-green-600 active:bg-white active:shadow-sm">
											{hoseData.hoseType.hoseTypeName}
										</button>
									) : (
										<span>—</span>
									)}
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("class")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.class?.className || "—"}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">{t("ferrule1")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									{isEditMode ? (
										<Cell
											value={hoseData?.ferrule1 || "—"}
											isEditMode={isEditMode}
										/>
									) : hoseData?.ferrule1 ? (
										<button
											type="button"
											onClick={() =>
												setIsProductModalOpen(true, hoseData.ferrule1)
											}
											className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-[#0F1912] transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-green-600 active:border-2 active:border-green-600 active:bg-white active:shadow-sm">
											{hoseData.ferrule1}
										</button>
									) : (
										<span>—</span>
									)}
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("ferrule2")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									{isEditMode ? (
										<Cell
											value={hoseData?.ferrule2 || "—"}
											isEditMode={isEditMode}
										/>
									) : hoseData?.ferrule2 ? (
										<button
											type="button"
											onClick={() =>
												setIsProductModalOpen(true, hoseData.ferrule2)
											}
											className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-[#0F1912] transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-green-600 active:border-2 active:border-green-600 active:bg-white active:shadow-sm">
											{hoseData.ferrule2}
										</button>
									) : (
										<span>—</span>
									)}
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">{t("insert1")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									{isEditMode ? (
										<Cell
											value={hoseData?.insert1 || "—"}
											isEditMode={isEditMode}
										/>
									) : hoseData?.insert1 ? (
										<button
											type="button"
											onClick={() =>
												setIsProductModalOpen(true, hoseData.insert1)
											}
											className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-[#0F1912] transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-green-600 active:border-2 active:border-green-600 active:bg-white active:shadow-sm">
											{hoseData.insert1}
										</button>
									) : (
										<span>—</span>
									)}
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("insert2")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									{isEditMode ? (
										<Cell
											value={hoseData?.insert2 || "—"}
											isEditMode={isEditMode}
										/>
									) : hoseData?.insert2 ? (
										<button
											type="button"
											onClick={() =>
												setIsProductModalOpen(true, hoseData.insert2)
											}
											className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-[#0F1912] transition-colors hover:border-gray-400 hover:bg-gray-100 hover:text-green-600 active:border-2 active:border-green-600 active:bg-white active:shadow-sm">
											{hoseData.insert2}
										</button>
									) : (
										<span>—</span>
									)}
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("couplingOrientation")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={
											hoseData?.couplingOrientation?.orientationCode || "—"
										}
										placeholder={t("placeholders.angle")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("pinPricked")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.pinPricked ? "Ja" : "Nei"}
										placeholder={t("placeholders.yesNo")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("mediumTemperature")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.hoseMediumTemperature || ""}
										placeholder={t("placeholders.mediumTemperature")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("function")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.hoseFunction || ""}
										placeholder={t("placeholders.function")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("hoseWarranty")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.hoseWarranty === "YES" ? "Ja" : "Nei"}
										placeholder={t("placeholders.yesNo")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("warrantyComment")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseData?.hoseWarrantyComment || ""}
										placeholder={t("placeholders.addComment")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>
						</tbody>
					</table>

					<table className="w-1/2 text-sm">
						<tbody>
							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("rfid")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseLine?.rfid || ""}
										placeholder={t("placeholders.rfid")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("genericHoseType")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={
											hoseLine?.genericHoseTypeId?.genericHoseTypeName || ""
										}
										placeholder={t("placeholders.genericHoseType")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("couplingTypeEnd1")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.couplingEnd1")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("genericDimEnd1")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.dimensionEnd1")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("genderEnd1")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.gender")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">{t("angleEnd1")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.angleEnd1")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("materialQualityEnd1")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.materialEnd1")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("couplingTypeEnd2")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.couplingEnd2")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("genericDimEnd2")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.dimensionEnd2")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">{t("genderEnd2")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.gender")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">{t("angleEnd2")}</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.angleEnd2")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("materialQualityEnd2")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.materialEnd2")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("generalCommentPtc")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseLine?.generalCommentPtc || ""}
										placeholder={t("placeholders.addComment")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("commentEnd1Ptc")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.commentEnd1")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("commentEnd2Ptc")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										placeholder={t("placeholders.commentEnd2")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-white">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("additionalComment")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseLine?.additionalComment || ""}
										placeholder={t("placeholders.additionalInfo")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>

							<tr className="bg-[#F8F9F8]">
								<td className="px-4 py-3 text-[#5A615D]">
									{t("originalHoseComment")}
								</td>
								<td className="px-4 py-3 text-[#0F1912]">
									<Cell
										value={hoseLine?.originalHoseComment || ""}
										placeholder={t("placeholders.originalComment")}
										isEditMode={isEditMode}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
