"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceDisplay } from "@/components/ui/price-display";
import { HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useOrderSummary } from "@/hooks/useOrderSummary";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { Separator } from "@radix-ui/react-select";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
	const { cartItems, isLoading } = useAppContext();
	const isCartEmpty = !cartItems || cartItems.length === 0 || isLoading;

	const summary = useOrderSummary();

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
			<div className="bg-card border-lightGray rounded-lg border p-6">
				<h2 className="text-xl font-semibold">{t("OrderSummary.title")}</h2>
				<div className="mt-4 space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Opprinnelig pris</span>
						<PriceDisplay amount={orderSummaryTotalPriceFromAppContext} />
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Rabatter</span>
						<PriceDisplay amount={discounts} />
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Sum etter rabatt (eks. mva.)</span>
						<PriceDisplay amount={sumAfterDiscount} />
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Tilleggsavgift</span>
						<PriceDisplay
							amount={deliverySurcharge}
							isPositive
						/>
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">MVA(25%)</span>
						<PriceDisplay amount={vat} />
					</div>
					<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
					<div className="flex justify-between">
						<span className="text-base font-bold text-[#0F1912]">
							Total inkl. mva.
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
								{t("Jeg godtar ")}
								<a
									href="/vilkar"
									className="text-[#009640] underline hover:text-[#009640]/80"
									target="_blank"
									rel="noopener noreferrer">
									{t("vilkårene")}
								</a>
								{t(" for kjøp")}
							</label>
						</div>
					)}
				</div>

				{profile?.defaultCustomerNumber !==
					HIDE_CHECKOUT_FOR_SPECIFIC_CUSTOMER_NUMBER &&
					(!profile?.punchout ? (
						<Button
							className="mt-6 w-full"
							disabled={
								isCartEmpty ||
								isCheckoutLoading ||
								(!acceptedTerms && currentStep === 2)
							}
							onClick={handleCheckout}>
							{isCheckoutLoading || isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								t(
									currentStep === null
										? "OrderSummary.continueToPayment"
										: `OrderSummary.punchoutCartStep${currentStep + 1}`,
								)
							)}
						</Button>
					) : (
						<Button
							variant="outlineGreen"
							className="mt-6 w-full text-[#009640]"
							disabled={
								isCartEmpty ||
								isCheckoutLoading ||
								(!acceptedTerms && currentStep === 2)
							}
							onClick={handleCheckout}>
							{isCheckoutLoading || isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								t("OrderSummary.punchoutCart")
							)}
						</Button>
					))}

				<Button
					variant="link"
					className="mt-2 w-full hover:no-underline"
					disabled={
						isCartEmpty ||
						isCheckoutLoading ||
						(!acceptedTerms && currentStep === 2)
					}
					onClick={() => router.push("/")}>
					<>
						{isCheckoutLoading || isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							t("OrderSummary.or")
						)}
						<span className="text-[#009640] underline">
							{t("OrderSummary.continueShopping")}
						</span>
						<ArrowRight className="h-4 w-4 font-bold text-[#009640]" />
					</>
				</Button>
			</div>
		</div>
	);
}
