"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { companyFields, shippingFields } from "@/constants/checkout";
import { Order, PaymentMethod } from "@/types/orders.types";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CreditCard } from "lucide-react";
import Image from "next/image";

import styles from "./checkout-steps.module.css";
import { FormField } from "./form-field";
import { StepHeader } from "./step-header";

// Main component
export default function CheckoutSteps() {
	const [openStep, setOpenStep] = useState(1);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
	const [orderData, setOrderData] = useState<
		Partial<Order> & {
			header: { companyName?: string; warehouseName?: string };
		}
	>({
		source: "EC",
		companyNumber: "01",
		sequenceNo: "12345678",
		orderDate: "2025-01-01",
		orderTime: "12:12:00",
		header: {
			customerNo: "CUST123",
			warehouseNumber: "L10",
			companyName: "Test Company AS",
			warehouseName: "Oslo Warehouse",
			deliveryTerms: "Standard",
			paymentTerms: "Net 30",
		},
		address: {
			addressName: "",
			addressLine1: "",
			addressLine2: "",
			addressLine3: "",
			city: "",
			postalCode: "",
			countryCode: "NO",
		},
	});

	const handleAddressChange = (field: string, value: string) => {
		setOrderData((prev) => ({
			...prev,
			address: {
				...prev.address!,
				[field]: value,
			},
		}));
	};

	const isStepValid = (step: number) => {
		if (step === 1) {
			return shippingFields
				.filter((f) => f.required)
				.every(
					(f) => orderData.address?.[f.field as keyof typeof orderData.address],
				);
		}
		if (step === 2) {
			return !!paymentMethod;
		}
		return true;
	};

	const handleSubmit = () => {
		const finalOrderData: Partial<Order> = {
			...orderData,
			source: "EC",
		};
		// Here you would integrate with your payment gateway based on paymentMethod
		if (paymentMethod === "card") {
			// Redirect to card payment gateway
			console.log("Redirecting to card payment...");
		} else {
			// Redirect to PayPal
			console.log("Redirecting to PayPal...");
		}
	};

	const handleContinueToPayment = () => {
		if (isStepValid(1)) {
			setOpenStep(2);
		}
	};

	return (
		<div className="w-full overflow-hidden rounded-md border bg-white">
			<StepHeader
				step={1}
				title="Shipping"
				isComplete={isStepValid(1)}
				onClick={() => setOpenStep(1)}
			/>
			{openStep === 1 && (
				<div className="space-y-6 p-6">
					<div className="grid grid-cols-2 gap-6">
						{companyFields.map((field) => (
							<FormField
								key={field.id}
								{...field}
								value={
									orderData.header?.[
										field.field as keyof typeof orderData.header
									] || ""
								}
								onChange={() => {}}
							/>
						))}
						{shippingFields.map((field) => (
							<FormField
								key={field.id}
								{...field}
								value={
									orderData.address?.[
										field.field as keyof typeof orderData.address
									] || ""
								}
								onChange={(value) => handleAddressChange(field.field, value)}
							/>
						))}
					</div>
					<Button
						className="w-full"
						onClick={handleContinueToPayment}
						disabled={!isStepValid(1)}>
						Continue to Payment
					</Button>
				</div>
			)}

			<StepHeader
				step={2}
				title="Payment"
				isComplete={isStepValid(2)}
				onClick={() => isStepValid(1) && setOpenStep(2)}
			/>
			{openStep === 2 && (
				<div className="space-y-6 p-6">
					<RadioGroup
						value={paymentMethod}
						onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
						className="space-y-4">
						<Card className="relative cursor-pointer rounded-md hover:bg-gray-50">
							<RadioGroupItem
								value="card"
								id="card"
								className="absolute top-4 right-4"
							/>
							<Label
								htmlFor="card"
								className="flex cursor-pointer items-center gap-4 p-4">
								<div className="flex items-center gap-2">
									<CreditCard className="h-6 w-6 text-blue-600" />
									<span className="font-medium">Credit/Debit Card</span>
									<Image
										src={"/icons/visa.png"}
										alt="Visa"
										width={24}
										height={24}
										className="ms-1"
									/>
									<Image
										src={"/icons/mastercard.png"}
										alt="MasterCard"
										width={24}
										height={24}
										className="mx-1"
									/>
									<Image
										src={"/icons/maestro.png"}
										alt="Maestro"
										width={20}
										height={20}
									/>
								</div>
							</Label>
						</Card>

						<Card className="relative cursor-pointer rounded-md hover:bg-gray-50">
							<RadioGroupItem
								value="paypal"
								id="paypal"
								className="absolute top-4 right-4"
							/>
							<Label
								htmlFor="paypal"
								className="flex cursor-pointer items-center gap-4 p-4">
								<div className="flex items-center gap-2">
									<Image
										src={"/images/paypal.png"}
										alt="PayPal"
										width={24}
										height={24}
									/>
									<span className="font-medium">PayPal</span>
								</div>
							</Label>
						</Card>
					</RadioGroup>

					{paymentMethod !== "paypal" ? (
						<Button
							className="w-full"
							onClick={handleSubmit}
							disabled={!isStepValid(2)}>
							Pay with Card
						</Button>
					) : (
						<div className={styles.paypalWrapper}>
							<PayPalButtons
								createOrder={(data, actions) => {
									return actions.order.create({
										purchase_units: [
											{
												amount: {
													value: "100.00",
													currency_code: "USD",
												},
											},
										],
										intent: "CAPTURE",
									});
								}}
								onApprove={(data, actions) => {
									if (!actions.order) {
										console.error("Order actions not available");
										return Promise.reject("Order actions not available");
									}
									return actions.order.capture().then((details) => {
										console.log("Payment Approved:", details);
										handleSubmit(); // Finalize order
									});
								}}
								onError={(err) => {
									console.error("PayPal error:", err);
								}}
								onCancel={() => {
									console.log("Payment cancelled by user");
								}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
