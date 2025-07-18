"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/appContext";
import { ArrowRight, Loader2 } from "lucide-react";
import { Separator } from "@radix-ui/react-select";
import { useRouter } from "next/navigation";

export default function OrderSummary() {
	const router = useRouter();
	const { cartItems, prices, calculatedPrices, isLoading } =
		useAppContext();

	const subtotal = cartItems?.reduce(
		(acc, item) =>
			acc + (calculatedPrices[item.itemNumber] || prices[item.itemNumber] || 0),
		0,
	);


	const handleCheckout = () => {
		router.push("/checkout");
	};
	
	return (
		<div className="space-y-6">
			<div className="bg-card border-lightGray rounded-lg border p-6">
				<h2 className="text-xl font-semibold">Ordreoversikt</h2>
				<div className="mt-4 space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Opprinnelig pris:</span>
						<span className="font-medium">{subtotal.toFixed(2)},- kr</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Rabatter</span>
						<span className="text-[#009640] font-medium">-999.00 kr</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">Sum etter rabatt (eks. mva.)</span>
						<span className="font-medium">3199.00 kr</span>
					</div>
					<div className="flex justify-between">
						<span className="text-[#5A615D]">MVA(25%)</span>
						<span className="font-medium">1049.50 kr</span>
					</div>
					<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
					<div className="flex justify-between">
						<span className="text-base font-bold text-[#0F1912]">
							Total inkl. mva.
						</span>
						<span className="text-base font-bold text-[#0F1912]">
							4248.50 kr
						</span>
					</div>
				</div>
				<Button
					className="mt-6 w-full"
					disabled={cartItems?.length === 0 || isLoading}
					onClick={handleCheckout}>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						"Gå til checkout"
					)}
				</Button>
				<Button
					variant="link"
					className="mt-2 w-full hover:no-underline"
					disabled={cartItems?.length === 0 || isLoading}
					onClick={handleCheckout}>
					<>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							"eller"
						)}
						<span className="text-[#009640] underline">
							Fortsett å handle
						</span>{" "}
						<ArrowRight className="h-4 w-4 font-bold text-[#009640]" />
					</>
				</Button>
			</div>
		</div>
	);
}
