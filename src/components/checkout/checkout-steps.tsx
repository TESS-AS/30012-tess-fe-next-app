"use client";

import { useCallback, useEffect, useState } from "react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { companyFields, shippingFields } from "@/constants/checkout";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import {
	getCustomerDimensions,
	getUserDimensions,
} from "@/services/dimensions.service";
import { salesOrder } from "@/services/orders.service";
import {
	CustomerDimension,
	UserDimensionItem,
} from "@/types/dimensions.types";
import { Address, Order, PaymentMethod } from "@/types/orders.types";
import {
	formatCustomerDimensionsToHierarchy,
	formatUserDimensionsToHierarchy,
} from "@/utils/dimensionFormaters";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { CreditCard } from "lucide-react";
import Image from "next/image";

import styles from "./checkout-steps.module.css";
import { DimensionSearchInput } from "./dimension-search-input";
import { FormField } from "./form-field";
import { StepHeader } from "./step-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";


// Main component
export default function CheckoutSteps() {
	const { cartItems, calculatedPrices, prices } = useAppContext();

	const { data: profile } = useGetProfileData();
	const [openStep, setOpenStep] = useState(1);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
	const [orderData, setOrderData] = useState<Order>({
		documentControl: {
			companyCode: "",
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
		salesOrderLines: [],
	});
	const [customerDimensions, setCustomerDimensions] = useState<
		CustomerDimension[]
	>([]);
	const [userDimensions, setUserDimensions] = useState<UserDimensionItem[]>([]);
	const [customerDimension, setCustomerDimension] = useState<string>("");
	const [userDimension, setUserDimension] = useState<string>("");
	const [userDimensionOne, setUserDimensionOne] = useState<string>("");
	const [userDimensionTwo, setUserDimensionTwo] = useState<string>("");
	const [userDimensionThree, setUserDimensionThree] = useState<string>("");
	const [customerDimensionOne, setCustomerDimensionOne] = useState<string>("");
	const [customerDimensionTwo, setCustomerDimensionTwo] = useState<string>("");
	const [customerDimensionThree, setCustomerDimensionThree] =
		useState<string>("");
	const [activeTab, setActiveTab] = useState<"customer" | "user">("customer");
	const [activeDimension, setActiveDimension] = useState<number | null>(null);
	const [useCustomerSearchInput, setCustomerSearchInput] = useState<"search" | "select" | "manual">("manual");
	const [useUserSearchInput, setUserSearchInput] = useState<"search" | "select" | "manual">("manual");
	const isPunchoutUser = profile?.punchout;

	const customerDimensionsRef = useClickOutside<HTMLDivElement>(() => {
		setCustomerDimensionOne("");
		setCustomerDimensionTwo("");
		setCustomerDimensionThree("");
		setActiveDimension(null);
	});

	const userDimensionsRef = useClickOutside<HTMLDivElement>(() => {
		setUserDimensionOne("");
		setUserDimensionTwo("");
		setUserDimensionThree("");
		setActiveDimension(null);
	});

	const updateOrderData = (parts: string[]) => {
		setOrderData((prev) => {
			const updatedOrder = { ...prev };

			if (parts.length === 1) {
				updatedOrder.salesOrderHeader = {
					...prev.salesOrderHeader,
					customersOrderReference: parts[0],
				};
			} else if (parts.length === 2) {
				updatedOrder.salesOrderHeader = {
					...prev.salesOrderHeader,
					customersOrderReference: parts[0],
					customerReference: parts[1],
				};
			} else if (parts.length === 3) {
				updatedOrder.salesOrderHeader = {
					...prev.salesOrderHeader,
					customersOrderReference: parts[0],
					customerReference: parts[1],
				};
				updatedOrder.salesOrderLines = prev.salesOrderLines.map((line) => ({
					...line,
					accountPart3: parts[2],
				}));
			}

			return updatedOrder;
		});
	};


	useEffect(() => {
		if (cartItems?.length && profile) {
			setOrderData((prev) => ({
				...prev,
				documentControl: {
					companyCode:
						profile?.defaultCompanyNumber < 10
							? `0${profile?.defaultCompanyNumber}`
							: profile?.defaultCompanyNumber?.toString(),
				},
				salesOrderLines: cartItems.map((item) => ({
					warehouseNumber:
						`${profile?.defaultWarehouseNumber} ${profile?.defaultWarehosueName}` ||
						"",
					orderType: "",
					itemCode: item?.productNumber || "",
					orderedQuantity: item.quantity,
					salesPrice: calculatedPrices[item.itemNumber] || 0,
					requestedDeliveryDate: "",
					accountPart3: "", // Dimension 3
					accountPart4: String(profile?.userId || ""), // userId
					accountPart5: "",
					text: "",
				})),
			}));
		}
	}, [cartItems, profile]);

	useEffect(() => {
		const loadDimensions = async () => {
			const customerDimensions = await getCustomerDimensions(profile?.defaultCompanyNumber.toString() || "110036");
			setCustomerDimensions(customerDimensions);
			const userDimensions = await getUserDimensions();
			setUserDimensions(userDimensions);
		};
		loadDimensions();
	}, []);

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


	// add new text input manual 

	const isStepValid = (step: number) => {
		if (step === 1) {
			if (!orderData.salesOrderAddresses?.[0]) return false;
			
			const hasValidShippingFields = shippingFields
				.filter((f) => f.required)
				.every((f) => {
					const value = orderData.salesOrderAddresses[0][f.field as keyof Address];
					return value !== undefined && value !== null && value !== "";
				});

			return hasValidShippingFields;

			// if (activeTab === "customer") {
			// 	if (!useCustomerSearchInput) {
			// 		return hasValidShippingFields && customerDimension !== "";
			// 	} else {
			// 		const hasLevel1 = customerDimensionOne !== "";
			// 		const hasLevel2 = hasLevel1 && customerDimensionTwo !== "";
			// 		const hasLevel3 = hasLevel2 && customerDimensionThree !== "";

			// 		return hasValidShippingFields && hasLevel1;
			// 	}
			// } else {
			// 	if (!useUserSearchInput) {
			// 		return hasValidShippingFields && userDimension !== "";
			// 	} else {
			// 		const hasLevel1 = userDimensionOne !== "";
			// 		const hasLevel2 = hasLevel1 && userDimensionTwo !== "";
			// 		const hasLevel3 = hasLevel2 && userDimensionThree !== "";

			// 		return hasValidShippingFields && hasLevel1;
			// 	}
			// }
		}
		if (step === 2) {
			return !isPunchoutUser && !!paymentMethod;
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
			salesOrderLines: orderData.salesOrderLines,
		};
		try {
			const response = await salesOrder(payload);
			
			const parser = new DOMParser();
			const doc = parser.parseFromString(response, 'text/html');
			
			const form = doc.getElementById('punchoutForm') as HTMLFormElement;
			
			if (form) {
				const actionUrl = form.action;
				const method = form.method;
				
				const submitForm = document.createElement('form');
				submitForm.method = method;
				submitForm.action = actionUrl;
				
				Array.from(form.getElementsByTagName('input')).forEach(input => {
					const newInput = document.createElement('input');
					newInput.type = 'hidden';
					newInput.name = input.name;
					newInput.value = input.value;
					submitForm.appendChild(newInput);
				});
				document.body.appendChild(submitForm);
				submitForm.submit();
				document.body.removeChild(submitForm);
			} else {
				console.error('Punchout form not found in response');
			}
		} catch (error) {
			console.error("Order submission failed:", error);
		}
	};

	const handleContinueToPayment = () => {
		if (isPunchoutUser) {
			handleSubmit();
			return;
		}
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
									field.label === "Company"
										? orderData.documentControl.companyCode
										: `${profile?.defaultWarehouseNumber} ${profile?.defaultWarehosueName}`
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
					</div>
					<div className="space-y-4">
						<Tabs
							defaultValue="customer"
							value={activeTab}
							onValueChange={(val) => setActiveTab(val as "customer" | "user")}
							className="w-full">
							<TabsList className="mb-4 grid w-full grid-cols-2">
								<TabsTrigger value="customer">Customer Dimensions</TabsTrigger>
								<TabsTrigger value="user">User Dimensions</TabsTrigger>
							</TabsList>
							<TabsContent value="customer">
								<div className="flex items-center gap-4 mb-4">
									<Label className="text-sm">Dimension Input Mode:</Label>
									<RadioGroup
										defaultValue={useCustomerSearchInput}
										onValueChange={(value) => setCustomerSearchInput(value as "search" | "select" | "manual")}
										className="flex items-center gap-4">
										<div className="flex items-center gap-1">
											<RadioGroupItem value="select" id="select" />
											<Label htmlFor="select">Select</Label>
										</div>
										<div className="flex items-center gap-1">
											<RadioGroupItem value="search" id="search" />
											<Label htmlFor="search">Search</Label>
										</div>
										<div className="flex items-center gap-1">
											<RadioGroupItem value="manual" id="manual" />
											<Label htmlFor="manual">Manual</Label>
										</div>
									</RadioGroup>
								</div>

								<div className="space-y-2">
									{useCustomerSearchInput === "select" && (
										<>
										<Label>Customer Dimensions</Label>
										<Select
											value={customerDimension}
											onValueChange={(value) => {
												const parts = value.split("<");
												setCustomerDimension(value);
												updateOrderData(parts);
											}}>
											<SelectTrigger>
												<SelectValue placeholder="Select Customer Dimension" />
											</SelectTrigger>
											<SelectContent>
												{formatCustomerDimensionsToHierarchy(
													customerDimensions,
												).map((item, index) => (
													<SelectItem
														key={`${item.value}-${index}`}
														value={item.value}>
														{item.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										</>
									)}
									
									{useCustomerSearchInput === "search" && (<div ref={customerDimensionsRef}>
										<DimensionSearchInput
											level={1}
											value={customerDimensionOne}
											onChange={(value) => {
												setCustomerDimensionOne(value);
												setActiveDimension(value ? 1 : null);
											}}
											placeholder="Customer Dimension 1"
											onSelect={(dimension) => {
												setCustomerDimensionOne(dimension.dimensionName);
												setActiveDimension(null);
												setOrderData((prev) => ({
													...prev,
													salesOrderHeader: {
														...prev.salesOrderHeader,
														customersOrderReference: dimension.customerNumber,
													},
												}));
											}}
											isVisible={activeDimension === null || activeDimension === 1}
										/>
										<DimensionSearchInput
											level={2}
											value={customerDimensionTwo}
											onChange={(value) => {
												setCustomerDimensionTwo(value);
												setActiveDimension(value ? 2 : null);
											}}
											placeholder="Customer Dimension 2"
											onSelect={(dimension) => {
												setCustomerDimensionTwo(dimension.dimensionName);
												setActiveDimension(null);
												setOrderData((prev) => ({
													...prev,
													salesOrderHeader: {
														...prev.salesOrderHeader,
														customerReference: dimension.customerNumber,
													},
												}));
											}}
											isVisible={activeDimension === null || activeDimension === 2}
										/>
										<DimensionSearchInput
											level={3}
											value={customerDimensionThree}
											onChange={(value) => {
												setCustomerDimensionThree(value);
												setActiveDimension(value ? 3 : null);
											}}
											placeholder="Customer Dimension 3"
											onSelect={(dimension) => {
												setCustomerDimensionThree(dimension.dimensionName);
												setActiveDimension(null);
												setOrderData((prev) => ({
													...prev,
													salesOrderLines: prev.salesOrderLines.map((line) => ({
														...line,
														accountPart3: dimension.customerNumber,
													})),
												}));
											}}
											isVisible={activeDimension === null || activeDimension === 3}
										/>
									</div>)}
									{useCustomerSearchInput === "manual" && (
										<div className="relative mb-4">
											<Input
												type="text"
												value={customerDimension}
												placeholder="Customer Dimension 1"
												onChange={(e) => {
													setCustomerDimension(e.target.value)
													setOrderData((prev) => ({
														...prev,
														salesOrderHeader: {
															...prev.salesOrderHeader,
															customersOrderReference: e.target.value,
														},
													}));
												}}
												className="mb-4"
											/>
											<Input
												type="text"
												value={customerDimensionTwo}
												placeholder="Customer Dimension 2"
												onChange={(e) => {
													setCustomerDimensionTwo(e.target.value)
													setOrderData((prev) => ({
														...prev,
														salesOrderHeader: {
															...prev.salesOrderHeader,
															customerReference: e.target.value,
														},
													}));
												}}
												className="mb-4"
											/>
											<Input
												type="text"
												value={customerDimensionThree}
												placeholder="Customer Dimension 3"
												onChange={(e) => {
													setCustomerDimensionThree(e.target.value)
													setOrderData((prev) => ({
														...prev,
														salesOrderLines: prev.salesOrderLines.map((line) => ({
															...line,
															accountPart3: e.target.value,
														})),
													}));
												}}
											/>
										</div>
									)}
								</div>
							</TabsContent>
							<TabsContent value="user">
								<div className="flex items-center gap-4 mb-4">
									<Label className="text-sm">Dimension Input Mode:</Label>
									<RadioGroup
										defaultValue={useUserSearchInput}
										onValueChange={(value) => setUserSearchInput(value as "search" | "select" | "manual")}
										className="flex items-center gap-4">
										<div className="flex items-center gap-1">
											<RadioGroupItem value="select" id="select" />
											<Label htmlFor="select">Select</Label>
										</div>
										<div className="flex items-center gap-1">
											<RadioGroupItem value="search" id="search" />
											<Label htmlFor="search">Search</Label>
										</div>
										<div className="flex items-center gap-1">
											<RadioGroupItem value="manual" id="manual" />
											<Label htmlFor="manual">Manual</Label>
										</div>
									</RadioGroup>
								</div>
								<div className="space-y-2">
								
									{useUserSearchInput === "select" && (
									<>
										<Label>User Dimensions</Label>
										<Select
											value={userDimension}
											onValueChange={(value) => {
												const parts = value.split("<");
												setUserDimension(value);
												updateOrderData(parts);
											}}>
											<SelectTrigger>
												<SelectValue placeholder="Select User Dimension" />
											</SelectTrigger>
											<SelectContent>
												{formatUserDimensionsToHierarchy(userDimensions).map(
													(dim, index) => (
														<SelectItem
															key={`${dim.value}-${index}`}
															value={dim.value}>
															{dim.label}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</>
									)}
									{useUserSearchInput === "search" && (
										<div ref={userDimensionsRef}>
											<DimensionSearchInput
												level={1}
												value={userDimensionOne}
												onChange={(value) => {
													setUserDimensionOne(value);
													setActiveDimension(value ? 1 : null);
												}}
												placeholder="User Dimension 1"
												onSelect={(dimension) => {
													setUserDimensionOne(dimension.dimensionName);
													setActiveDimension(null);
													setOrderData((prev) => ({
														...prev,
														salesOrderHeader: {
															...prev.salesOrderHeader,
															customersOrderReference: dimension.customerNumber,
														},
													}));
												}}
												isVisible={activeDimension === null || activeDimension === 4}
											/>
											<DimensionSearchInput
												level={2}
												value={userDimensionTwo}
												onChange={(value) => {
													setUserDimensionTwo(value);
													setActiveDimension(value ? 2 : null);
												}}
												placeholder="User Dimension 2"
												onSelect={(dimension) => {
													setUserDimensionTwo(dimension.dimensionName);
													setActiveDimension(null);
													setOrderData((prev) => ({
														...prev,
														salesOrderHeader: {
															...prev.salesOrderHeader,
															customerReference: dimension.customerNumber,
														},
													}));
												}}
												isVisible={activeDimension === null || activeDimension === 5}
											/>
											<DimensionSearchInput
												level={3}
												value={userDimensionThree}
												onChange={(value) => {
													setUserDimensionThree(value);
													setActiveDimension(value ? 3 : null);
												}}
												placeholder="User Dimension 3"
												onSelect={(dimension) => {
													setUserDimensionThree(dimension.dimensionName);
													setActiveDimension(null);
													setOrderData((prev) => ({
														...prev,
														salesOrderLines: prev.salesOrderLines.map((line) => ({
															...line,
															accountPart3: dimension.customerNumber,
														})),
													}));
												}}
												isVisible={activeDimension === null || activeDimension === 6}
											/>
										</div>
									)}
									{useUserSearchInput === "manual" && (
										<div className="relative mb-4">
											<Input
												type="text"
												value={userDimension}
												placeholder="User Dimension 1"
												onChange={(e) => {
													setUserDimension(e.target.value)
													setOrderData((prev) => ({
														...prev,
														salesOrderHeader: {
															...prev.salesOrderHeader,
															customersOrderReference: e.target.value,
														},
													}));
												}}
												className="mb-4"
											/>
											<Input
												type="text"
												value={userDimensionTwo}
												placeholder="User Dimension 2"
												onChange={(e) => {
													setUserDimensionTwo(e.target.value)
													setOrderData((prev) => ({
														...prev,
														salesOrderHeader: {
															...prev.salesOrderHeader,
															customerReference: e.target.value,
														},
													}));
												}}
												className="mb-4"
											/>
											<Input
												type="text"
												value={userDimensionThree}
												placeholder="User Dimension 3"
												onChange={(e) => {
													setUserDimensionThree(e.target.value)
													setOrderData((prev) => ({
														...prev,
														salesOrderLines: prev.salesOrderLines.map((line) => ({
															...line,
															accountPart3: e.target.value,
														})),
													}));
												}}
											/>
										</div>
									)}
									
								</div>
							</TabsContent>
						</Tabs>
					</div>


					<Button
						className="w-full"
						onClick={handleContinueToPayment}
						disabled={!isStepValid(1)}>
						{isPunchoutUser ? "Submit" : "Continue to Payment"}
					</Button>
				</div>
			)}

			{!isPunchoutUser && (
				<StepHeader
					step={2}
					title="Payment"
					isComplete={isStepValid(2)}
					onClick={() => isStepValid(1) && setOpenStep(2)}
				/>
			)}
			{!isPunchoutUser && openStep === 2 && (
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
