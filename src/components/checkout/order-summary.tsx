"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Modal,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { PriceDisplay } from "@/components/ui/price-display";
import {
	HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER,
	SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER,
	SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER,
} from "@/constants/checkout";
import { useOrderSummary } from "@/hooks/useOrderSummary";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { excelOrderConfirmationForCart } from "@/services/orders.service";
import { createRequisition } from "@/services/requisitions.service";
import { Separator } from "@radix-ui/react-select";
import { ArrowRight, ChevronLeft, Info, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Textarea } from "../ui/textarea";

interface OrderSummaryProps {
	handleCheckout: () => void;
	isCheckoutLoading?: boolean;
	currentStep: number | null;
}

export default function OrderSummary({
	handleCheckout,
	isCheckoutLoading,
	currentStep,
}: OrderSummaryProps) {
	const router = useRouter();
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const t = useTranslations();

	const { data: profile } = usePunchoutProfile();
	const {
		cartItems,
		isLoading,
		arePricesLoading,
		handleClearCart,
		handleArchiveCart,
		unitPrices,
	} = useAppContext();
	const isCartEmpty =
		(!cartItems?.cart || cartItems.cart.length === 0) &&
		(!cartItems?.cartKit || cartItems.cartKit.length === 0);

	const summary = useOrderSummary();
	const [isRequisitionViewOpen, setIsRequisitionViewOpen] = useState(false);
	const [requisitionDescription, setRequisitionDescription] = useState("");
	const [isSavingRequisition, setIsSavingRequisition] = useState(false);
	const [requisitionSaved, setRequisitionSaved] = useState(false);
	const [isExcelExportViewOpen, setIsExcelExportViewOpen] = useState(false);
	const [warehouseCode, setWarehouseCode] = useState("");
	const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
	const [warehouseCodeError, setWarehouseCodeError] = useState<string | null>(
		null,
	);
	const [excelArchivePromptOpen, setExcelArchivePromptOpen] = useState(false);

	const isTessEmployee = profile?.role === "employee";
	const isExcelExportCustomer =
		 SHOW_EXCEL_EXPORT_CUSTOMER_NUMBER.includes(profile?.defaultCustomerNumber || "");

	const validateExcelExport = () => {
		const trimmedWarehouseCode = warehouseCode.trim();

		setWarehouseCodeError(null);

		let ok = true;
		if (!trimmedWarehouseCode) {
			setWarehouseCodeError("Lagerkode er påkrevd");
			ok = false;
		}
		return ok;
	};

	const handleExcelExportButtonClick = () => {
		if (!validateExcelExport()) return;
		const cartLines = cartItems?.cart ?? [];
		if (cartLines.length === 0) {
			toast("Handlekurven er tom.", {
				type: "warning",
				position: "top-right",
				autoClose: 3000,
			});
			return;
		}
		setExcelArchivePromptOpen(true);
	};

	const runExcelExport = async (archiveCartAfter: boolean) => {
		if (isDownloadingExcel) return;
		try {
			setIsDownloadingExcel(true);
			setExcelArchivePromptOpen(false);

			const cartLines = cartItems?.cart ?? [];
			const payload = {
				salesOrderHeader: {
					warehouseCode: warehouseCode.trim(),
				},
				salesOrderLines: cartLines
					.filter((l) => l.itemNumber && l.quantity)
					.map((l) => ({
						itemCode: l.itemNumber,
						orderedQuantity: l.quantity,
						salesPrice: unitPrices?.[l.itemNumber] ?? 0,
					})),
			};

			const { blob, filename } = await excelOrderConfirmationForCart(payload);

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			if (archiveCartAfter) {
				await handleArchiveCart();
				toast("Excel-fil lastet ned og handlekurv arkivert.", {
					type: "success",
					position: "top-right",
					autoClose: 3000,
				});
			} else {
				toast("Excel-fil lastet ned. Handlekurven er uendret.", {
					type: "success",
					position: "top-right",
					autoClose: 3000,
				});
			}
			setIsExcelExportViewOpen(false);
			setWarehouseCode("");
			setWarehouseCodeError(null);
		} catch (error) {
			console.error("Excel export failed", error);
			toast("Kunne ikke generere Excel-fil. Prøv igjen.", {
				type: "error",
				position: "top-right",
				autoClose: 3000,
			});
		} finally {
			setIsDownloadingExcel(false);
		}
	};

	const openExcelExportView = () => {
		setIsRequisitionViewOpen(false);
		setIsExcelExportViewOpen(true);
		setWarehouseCodeError(null);
	};

	const handleSaveRequisition = async () => {
		setIsSavingRequisition(true);
		try {
			const customerNumber = profile?.defaultCustomerNumber?.toString() ?? "";
			if (!customerNumber) {
				toast("Mangler kundenummer. Velg kunde før du lagrer rekvisisjon.", {
					type: "error",
					position: "top-right",
					autoClose: 3000,
				});
				return;
			}

			const itemsFromCart = (cartItems?.cart ?? [])
				.filter((l) => l.itemNumber && l.quantity)
				.map((l) => ({
					itemNumber: l.itemNumber,
					quantity: l.quantity,
				}));

			const itemsFromCartKit = (cartItems?.cartKit ?? []).flatMap((kit) => {
				const lines: Array<{ itemNumber: string; quantity: number }> = [];
				if (kit.hose?.itemNumber && kit.hose.quantity) {
					lines.push({
						itemNumber: kit.hose.itemNumber,
						quantity: kit.hose.quantity,
					});
				}
				const comps = [kit.ferrule1, kit.ferrule2, kit.insert1, kit.insert2];
				for (const c of comps) {
					if (c?.itemNumber && c.quantity) {
						lines.push({ itemNumber: c.itemNumber, quantity: c.quantity });
					}
				}

				const serviceItems = (
					Object.values(kit.services ?? {}) as unknown[]
				).filter(
					(
						v,
					): v is {
						itemNumber: string;
						quantity?: number;
					} => {
						if (v == null || typeof v !== "object") return false;
						const { itemNumber } = v as { itemNumber?: unknown };
						return (
							typeof itemNumber === "string" && itemNumber.trim().length > 0
						);
					},
				);

				for (const s of serviceItems) {
					lines.push({
						itemNumber: s.itemNumber,
						quantity: s.quantity || 1,
					});
				}
				return lines;
			});

			const items = [...itemsFromCart, ...itemsFromCartKit];
			if (items.length === 0) {
				toast("Handlekurven er tom.", {
					type: "warning",
					position: "top-right",
					autoClose: 3000,
				});
				return;
			}

			await createRequisition({
				customerNumber,
				description: requisitionDescription.trim(),
				items,
			});

			await handleClearCart();

			toast(
				`Rekvisisjon opprettet på ${customerNumber}. Mottaker kan godkjenne eller endre`,
				{
					type: "success",
					position: "top-right",
					autoClose: 3000,
				},
			);
			setRequisitionSaved(true);
			setIsRequisitionViewOpen(false);
			setRequisitionDescription("");
		} catch (error) {
			console.error("Failed to create requisition", error);
			toast("Kunne ikke lagre rekvisisjon. Prøv igjen.", {
				type: "error",
				position: "top-right",
				autoClose: 3000,
			});
		} finally {
			setIsSavingRequisition(false);
		}
	};
	const {
		originalPrice,
		discounts,
		sumAfterDiscount,
		deliverySurcharge,
		vat,
		totalIncVat,
		orderSummaryTotalPriceFromAppContext,
	} = isCartEmpty
		? {
				originalPrice: 0,
				discounts: 0,
				sumAfterDiscount: 0,
				deliverySurcharge: 0,
				vat: 0,
				totalIncVat: 0,
				orderSummaryTotalPriceFromAppContext: 0,
			}
		: summary;
	return (
		<div className="space-y-6">
			<Modal
				open={excelArchivePromptOpen}
				onOpenChange={setExcelArchivePromptOpen}>
				<ModalHeader>
					<ModalTitle>{t("Checkout.excelArchiveCartTitle")}</ModalTitle>
				</ModalHeader>
				<p className="text-sm text-[#5A615D]">
					{t("Checkout.excelArchiveCartDescription")}
				</p>
				<ModalFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						disabled={isDownloadingExcel}
						onClick={() => runExcelExport(false)}>
						{t("Checkout.excelArchiveCartNo")}
					</Button>
					<Button
						type="button"
						variant="greenSolid"
						disabled={isDownloadingExcel}
						onClick={() => runExcelExport(true)}>
						{t("Checkout.excelArchiveCartYes")}
					</Button>
				</ModalFooter>
			</Modal>

			<div className="bg-card border-lightGray rounded-lg border p-4 sm:p-6">
				{isExcelExportCustomer && isExcelExportViewOpen ? (
					<div className="space-y-4">
						<div className="text-sm text-green-700">
							<button
								type="button"
								className="flex items-center gap-2"
								onClick={() => {
									setIsExcelExportViewOpen(false);
									setWarehouseCode("");
									setWarehouseCodeError(null);
								}}>
								<ChevronLeft /> Gå tilbake
							</button>
						</div>

						<p className="text-lg font-medium text-gray-900">
							Legg til lagerkode
						</p>

						<div className="space-y-2">
							<Label htmlFor="warehouseCode">Lagerkode</Label>
							<div className="relative">
								<Input
									id="warehouseCode"
									placeholder="F.eks. 007B"
									value={warehouseCode}
									onChange={(e) => {
										setWarehouseCode(e.target.value);
										if (warehouseCodeError) setWarehouseCodeError(null);
									}}
									className="pr-10"
								/>
								{warehouseCode.trim().length > 0 && (
									<button
										type="button"
										className="absolute top-1/2 right-3 -translate-y-1/2 text-[#5A615D] hover:text-[#0F1912]"
										onClick={() => setWarehouseCode("")}
										aria-label="Clear">
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
							{warehouseCodeError && (
								<p className="text-sm text-red-600">{warehouseCodeError}</p>
							)}
							<p className="text-sm text-[#5A615D]">
								Lagerkoden bestemmer mottaker og fakturering. Hver avdeling har
								sin egen kode.
							</p>
						</div>

						<Button
							variant="greenSolid"
							className="w-full"
							disabled={isCartEmpty || isCheckoutLoading || arePricesLoading}
							onClick={handleExcelExportButtonClick}>
							{isCheckoutLoading || isLoading || arePricesLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Last ned handlekurv som Excel-fil"
							)}
						</Button>

						<div className="flex items-start gap-2 rounded-md bg-[#F0FCF2] p-3 text-sm text-[#5A615D]">
							<Info className="mt-0.5 h-4 w-4 shrink-0 text-[#009640]" />
							<span>
								Etter nedlasting kan du velge om handlekurven skal arkiveres
								eller beholdes.
							</span>
						</div>
					</div>
				) : isRequisitionViewOpen ? (
					<div className="space-y-4">
						<div className="text-sm text-green-700">
							<button
								type="button"
								className="flex items-center gap-2"
								onClick={() => {
									setIsRequisitionViewOpen(false);
									setRequisitionDescription("");
								}}>
								<ChevronLeft /> Gå tilbake
							</button>
						</div>
						<p className="text-lg font-medium text-gray-900">
							Gi rekvisisjonen et navn
						</p>
						<div className="space-y-2">
							<Label htmlFor="requisitionDescription">Beskrivelse</Label>
							<div className="relative">
								<Textarea
									id="requisitionDescription"
									placeholder="Skriv inn beskrivelse"
									value={requisitionDescription}
									onChange={(e) => setRequisitionDescription(e.target.value)}
									className="pr-10"
								/>
								{requisitionDescription.trim().length > 0 && (
									<button
										type="button"
										className="absolute top-1/2 right-3 -translate-y-1/2 text-[#5A615D] hover:text-[#0F1912]"
										onClick={() => setRequisitionDescription("")}
										aria-label="Clear">
										<X className="h-4 w-4" />
									</button>
								)}
							</div>
						</div>

						<Button
							variant="greenSolid"
							className="w-full"
							disabled={
								isSavingRequisition ||
								isCartEmpty ||
								requisitionDescription.trim().length === 0
							}
							onClick={handleSaveRequisition}>
							{isSavingRequisition ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Lagre som rekvisisjon"
							)}
						</Button>
					</div>
				) : (
					<>
						<h2 className="text-xl font-semibold">{t("OrderSummary.title")}</h2>
						<div className="mt-4 space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-[#5A615D]">
									{t("OrderSummary.originalPrice")}
								</span>
								<PriceDisplay amount={orderSummaryTotalPriceFromAppContext} />
							</div>
							<div className="flex justify-between">
								<span className="text-[#5A615D]">
									{t("OrderSummary.discounts")}
								</span>
								<PriceDisplay amount={discounts} />
							</div>
							<div className="flex justify-between">
								<span className="text-[#5A615D]">
									{t("OrderSummary.sumAfterDiscount")}
								</span>
								<PriceDisplay amount={sumAfterDiscount} />
							</div>
							<div className="flex justify-between">
								<span className="text-[#5A615D]">
									{t("OrderSummary.deliverySurcharge")}
								</span>
								<PriceDisplay
									amount={deliverySurcharge}
									isPositive
								/>
							</div>
							{profile?.defaultCustomerNumber !==
								SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER && (
								<div className="flex justify-between">
									<span className="text-[#5A615D]">
										{t("OrderSummary.vat")}
									</span>
									<PriceDisplay amount={vat} />
								</div>
							)}
							<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
							<div className="flex justify-between">
								<span className="text-base font-bold text-[#0F1912]">
									{t("OrderSummary.totalIncVat")}
								</span>
								<PriceDisplay
									amount={totalIncVat}
									className="text-base font-bold text-[#0F1912]"
								/>
							</div>

							{currentStep === 2 && (
								<div className="mt-3 flex items-start gap-2">
									<Checkbox
										id="terms"
										checked={acceptedTerms}
										onCheckedChange={(checked) =>
											setAcceptedTerms(checked as boolean)
										}
									/>
									<label
										htmlFor="terms"
										className="cursor-pointer text-sm text-[#0F1912]">
										{t("OrderSummary.termsText")}
										<a
											href="/vilkar"
											className="mx-1 text-[#009640] underline hover:text-[#009640]/80"
											target="_blank"
											rel="noopener noreferrer">
											{t("OrderSummary.termsLink")}
										</a>
										{t("OrderSummary.termsEnd")}
									</label>
								</div>
							)}
						</div>

						{isExcelExportCustomer ? (
							<Button
								variant="greenSolid"
								className="mt-2 w-full"
								disabled={
									isCartEmpty ||
									isCheckoutLoading ||
									arePricesLoading ||
									(!acceptedTerms && currentStep === 2)
								}
								onClick={openExcelExportView}>
								{isCheckoutLoading || isLoading || arePricesLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Last ned handlekurv som Excel-fil"
								)}
							</Button>
						) : (
							profile?.defaultCustomerNumber !==
								HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER &&
							(!profile?.punchout ? (
								// isTessEmployee
								isTessEmployee ? (
									<Button
										variant="greenSolid"
										className="mt-2 w-full"
										disabled={
											isCartEmpty ||
											isCheckoutLoading ||
											(!acceptedTerms && currentStep === 2)
										}
										onClick={() => {
											if (requisitionSaved) {
												router.push("/profile?tab=rekvisisjoner");
												return;
											}
											setRequisitionSaved(false);
											setIsRequisitionViewOpen(true);
										}}>
										{requisitionSaved
											? "Gå til rekvisisjon"
											: "Lagre som rekvisisjon"}
									</Button>
								) : (
									<Button
										variant="greenSolid"
										className="mt-6 w-full"
										disabled={
											isCartEmpty ||
											isCheckoutLoading ||
											arePricesLoading ||
											(!acceptedTerms && currentStep === 2)
										}
										onClick={handleCheckout}>
										{isCheckoutLoading || isLoading || arePricesLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											t(
												currentStep === null
													? "OrderSummary.continueToPayment"
													: `OrderSummary.punchoutCartStep${currentStep + 1}`,
											)
										)}
									</Button>
								)
							) : (
								<Button
									variant="outlineGreen"
									className="mt-6 w-full text-[#009640]"
									disabled={
										isCartEmpty ||
										isCheckoutLoading ||
										arePricesLoading ||
										(!acceptedTerms && currentStep === 2)
									}
									onClick={() => {
										handleCheckout();
									}}>
									{isCheckoutLoading || isLoading || arePricesLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("OrderSummary.punchoutCart")
									)}
								</Button>
							))
						)}

						<Button
							variant="link"
							className="mt-2 w-full hover:no-underline"
							disabled={
								isCheckoutLoading || (!acceptedTerms && currentStep === 2)
							}
							onClick={async () => {
								if (isTessEmployee && requisitionSaved) {
									await handleClearCart();
									router.push("/");
									return;
								}
								router.push("/");
								localStorage.removeItem("hosesAndEquipments_page");
							}}>
							{isCheckoutLoading || isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : isTessEmployee && requisitionSaved ? (
								"Lukk"
							) : (
								<>
									{t("OrderSummary.or")}
									<span className="text-[#009640] underline">
										{t("OrderSummary.continueShopping")}
									</span>
									<ArrowRight className="h-4 w-4 font-bold text-[#009640]" />
								</>
							)}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
