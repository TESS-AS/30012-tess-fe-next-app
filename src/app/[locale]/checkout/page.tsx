"use client";

import CheckoutSteps from "@/components/checkout/checkout-steps";
import OrderSummary from "@/components/checkout/order-summary";
import {
	PayPalScriptProvider,
	ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";

const initialOptions: ReactPayPalScriptOptions = {
	clientId:
		"AdZvm8qHEQ_fY23qfg7I8hsLXFk_J6y9S1g60cdo03gQCVBTOOM4ykJKqWvxksrGteq0WcEW3w26XvG5",
	components: "buttons",
	currency: "USD",
};

export default function CheckoutPage() {
	return (
		<PayPalScriptProvider options={initialOptions}>
			<main className="container min-h-screen">
				<div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 py-10 md:grid-cols-2">
					<CheckoutSteps />
					<OrderSummary />
				</div>
			</main>
		</PayPalScriptProvider>
	);
}
