"use client";

import CheckoutSteps from "@/components/checkout/checkout-steps";
import OrderSummary from "@/components/checkout/order-summary";

export default function CheckoutPage() {
	return (
		<main className="container min-h-screen">
			<div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 py-10 md:grid-cols-2">
				<CheckoutSteps />
				<OrderSummary />
			</div>
		</main>
	);
}
