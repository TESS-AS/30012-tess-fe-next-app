import { InvoiceInfoCard } from "@/components/checkout/invoice-info-card";
import { PaymentMethodCard } from "@/components/checkout/payment-method-card";

export default function StepPayment({
	paymentMethod,
	setPaymentMethod,
	orderData,
	setOrderData,
	dimensionInputMode,
	setDimensionInputMode,
}: any) {
	return (
		<div className="flex flex-col gap-4">
			<PaymentMethodCard
				value={paymentMethod}
				onChange={setPaymentMethod}
			/>
			<InvoiceInfoCard
				orderData={orderData}
				setOrderData={setOrderData}
				dimensionInputMode={dimensionInputMode}
				setDimensionInputMode={setDimensionInputMode}
			/>
		</div>
	);
}
