"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { companyFields, shippingFields } from "@/constants/checkout";
import { Address, Order, PaymentMethod } from "@/types/orders.types";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CreditCard } from "lucide-react";
import Image from "next/image";

import styles from "./checkout-steps.module.css";
import { FormField } from "./form-field";
import { StepHeader } from "./step-header";
import { salesOrder } from "@/services/orders.service";
import { useAppContext } from "@/lib/appContext";
import { CustomerDimension, UserDimensionsResponse } from "@/types/dimensions.types";
import { getCustomerDimensions, getUserDimensions, formatDimensionsToHierarchy } from "@/services/dimensions.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Main component
export default function CheckoutSteps() {
	const { cartItems } = useAppContext();	
	const [openStep, setOpenStep] = useState(1);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
	const [orderData, setOrderData] = useState<Order>({
		documentControl: {
			companyCode: "01",
		},
		salesOrderHeader: {
			customerReference: "",
			customersOrderNumberEdifact: "",
			customerNumber: "",
			dispatchDate: "",
			orderType: "",
			customersOrderReference: "",
			warehouseId: "",
			termsOfDelivery: "",
			termsOfPayment: "",
			paidAmount: 0,
			cashRegister: "",
			text: "",
		},
		salesOrderAddresses: [],
		salesOrderLines: cartItems.map((item) => ({
			warehouseId: "",
			orderType: "",
			itemCode: item?.productNumber || "",
			orderedQuantity: item.quantity,
			salesPrice: item.price || 0,
			requestedDeliveryDate: "",
			accountPart3: "", // Dimension 3
			accountPart4: "", // userId
			accountPart5: "",
			text: ""
		})),
	});
	const [customerDimensions, setCustomerDimensions] = useState<CustomerDimension[]>([]);
	const [userDimensions, setUserDimensions] = useState<UserDimensionsResponse[]>([]);
	const [customerDimension, setCustomerDimension] = useState<string>('');

	useEffect(() => {
		const loadDimensions = async () => {
			const customerDimensions = await getCustomerDimensions('110036')
			setCustomerDimensions(customerDimensions)
			const userDimensions = await getUserDimensions('110036')
			setUserDimensions(userDimensions)
		}
		loadDimensions()
			
	}, [])
	
	const handleAddressChange = (field: keyof Address, value: string) => {
		setOrderData((prev) => {
			const existingAddress = prev.salesOrderAddresses[0] || {
				name: "",
				addressLine1: "",
				addressLine2: "",
				addressLine3: "",
				postalCode: "",
				partyQualifier: "DP",
				country: "NO",
			};
	
			return {
				...prev,
				salesOrderAddresses: [
					{
						...existingAddress,
						[field]: value,
					},
				],
			};
		});
	};

	const isStepValid = (step: number) => {
		if (step === 1) {
			return shippingFields
				.filter((f) => f.required)
				.every(
					(f) => orderData.salesOrderAddresses[0]?.[f.field as keyof typeof orderData.salesOrderAddresses[0]],
				);
		}
		if (step === 2) {
			return !!paymentMethod;
		}
		return true;
	};

	const handleSubmit = async () => {
		const payload: Order = {
			...orderData,
			documentControl: {
				companyCode: "01",
			},
			salesOrderHeader: {
				...orderData.salesOrderHeader,
			},
			salesOrderAddresses: orderData.salesOrderAddresses,
			salesOrderLines: orderData.salesOrderLines
		};
		try {
			await salesOrder(payload);
			console.log("Order sent successfully!");
		} catch (error) {
			console.error("Order submission failed:", error);
		}
	};

	const handleContinueToPayment = () => {
		if (isStepValid(1)) {
			setOpenStep(2);
		}
	};
	console.log(orderData,"order data")

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
									orderData.documentControl?.[
										field.field as keyof typeof orderData.documentControl
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
									orderData.salesOrderAddresses[0]?.[
										field.field as keyof Address
									] ?? ""
								}
								onChange={(value) =>
									handleAddressChange(field.field as keyof Address, value)
								}
							/>
						))}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Customer Dimensions</Label>
								<Select 
									value={customerDimension} 
									onValueChange={(value) => {
										console.log('onValueChange called with:', value);
										const parts = value.split('<');
										console.log('Split parts:', parts);
										setCustomerDimension(value)
										setOrderData((prev) => {
											let updatedOrder = { ...prev };

											if (parts.length === 1) {
												updatedOrder.salesOrderHeader = {
													...prev.salesOrderHeader,
													customersOrderReference: parts[0]
												};
											}
											else if (parts.length === 2) {
												updatedOrder.salesOrderHeader = {
													...prev.salesOrderHeader,
													customersOrderReference: parts[0],
													customerReference: parts[1]
												};
											}
											else if (parts.length === 3) {
												updatedOrder.salesOrderHeader = {
													...prev.salesOrderHeader,
													customersOrderReference: parts[0],
													customerReference: parts[1]
												};
												updatedOrder.salesOrderLines = prev.salesOrderLines.map(line => ({
													...line,
													accountPart3: parts[2]
												}));
											}

											return updatedOrder;
										});
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Customer Dimension" />
									</SelectTrigger>
									<SelectContent>
										{formatDimensionsToHierarchy(customerDimensions).map((item, index) => (
										<SelectItem 
											key={`${item.value}-${index}`} 
											value={item.value}
										>
											{item.label}
										</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>User Dimensions</Label>
								<Select value={orderData.salesOrderHeader.customersOrderReference} onValueChange={(value) =>
									setOrderData((prev) => ({
										...prev,
										salesOrderHeader: {
											...prev.salesOrderHeader,
											customersOrderReference: value
										}
									}))
								}>
									<SelectTrigger>
										<SelectValue placeholder="Select User Dimension" />
									</SelectTrigger>
									<SelectContent>
										{userDimensions.map((dim, index) => (
											<SelectItem key={`${dim.id}-${index}`} value={dim?.id?.toString()}>
												{dim.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
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
