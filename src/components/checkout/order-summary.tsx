"use client";

import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price-display";
import { useOrderSummary } from "@/hooks/useOrderSummary";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useAppContext } from "@/lib/appContext";
import { Separator } from "@radix-ui/react-select";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrderSummaryProps {
	handleCheckout: () => void;
	isCheckoutLoading?: boolean;
}

export default function OrderSummary({
	handleCheckout,
	isCheckoutLoading,
}: OrderSummaryProps) {
	const t = useTranslations();
	const { data: profile } = usePunchoutProfile();
	const { cartItems, isLoading } = useAppContext();
	const prices = useOrderSummary();

	return (
		<div className="space-y-6">
			<div className="bg-card border-lightGray rounded-lg border p-6">
				<h2 className="text-xl font-semibold">{t("OrderSummary.title")}</h2>
				<div className="mt-4 space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-[#5A615D]">
							{t("OrderSummary.originalPrice")}
						</span>
						<PriceDisplay amount={prices.originalPrice} />
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">
							{t("OrderSummary.discounts")}
						</span>
						<PriceDisplay
							amount={prices.discounts}
							isPositive
						/>
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">
							{t("OrderSummary.sumAfterDiscount")}
						</span>
						<PriceDisplay amount={prices.originalPrice} />
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">
							{t("OrderSummary.deliverySurcharge")}
						</span>
						<PriceDisplay
							amount={prices.deliverySurcharge}
							isPositive
						/>
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">{t("OrderSummary.vat")}</span>
						<PriceDisplay amount={prices.vat} />
					</div>
					<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
					<div className="flex justify-between">
						<span className="text-base font-bold text-[#0F1912]">
							{t("OrderSummary.totalIncVat")}
						</span>
						<PriceDisplay
							amount={prices.totalIncVat}
							className="text-base font-bold text-[#0F1912]"
						/>
					</div>
				</div>
				{!profile?.punchout ? (
					<Button
						className="mt-6 w-full"
						disabled={cartItems?.length === 0 || isLoading || isCheckoutLoading}
						onClick={handleCheckout}>
						{isCheckoutLoading || isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							t("OrderSummary.continueToPayment")
						)}
					</Button>
				) : (
					<Button
						variant="outlineGreen"
						className="mt-6 w-full text-[#009640]"
						disabled={cartItems?.length === 0 || isLoading || isCheckoutLoading}
						onClick={handleCheckout}>
						{isCheckoutLoading || isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							t("OrderSummary.punchoutCart")
						)}
					</Button>
				)}
				<Button
					variant="link"
					className="mt-2 w-full hover:no-underline"
					disabled={cartItems?.length === 0 || isLoading || isCheckoutLoading}
					onClick={handleCheckout}>
					<>
						{isCheckoutLoading || isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							t("OrderSummary.or")
						)}
						<span className="text-[#009640] underline">
							{t("OrderSummary.continueShopping")}
						</span>{" "}
						<ArrowRight className="h-4 w-4 font-bold text-[#009640]" />
					</>
				</Button>
			</div>
		</div>
	);
}
