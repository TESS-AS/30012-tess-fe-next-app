import { useState } from "react";

import { ConfirmationCard } from "@/components/checkout/confirmation-card";
import { EditAddressModal } from "@/components/checkout/edit-address-modal";
import { EditContactModal } from "@/components/checkout/edit-contact-modal";
import { EditDeliveryModal } from "@/components/checkout/edit-delivery-modal";
import { EditPaymentModal } from "@/components/checkout/edit-payment-modal";
import { useAppContext } from "@/lib/appContext";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import {
	ChevronDown,
	ChevronUp,
	MapPin,
	Truck,
	User2,
	Wallet,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Card } from "../ui/card";

export default function StepConfirmation({
	contactPerson,
	selectedAddress,
	orderData,
	modals,
	paymentMethod,
	setPaymentMethod,
	setOrderData,
	dimensionInputMode,
	setDimensionInputMode,
	handleContactPersonSave,
}: any) {
	const t = useTranslations("Checkout.confirmation");
	const tContact = useTranslations("Checkout.contactPerson");
	const phoneMissing = !contactPerson.phone?.trim();
	const {
		cartItems,
		calculatedPrices,
		setUpdatedAddress,
		cartKitTotals,
		getCalculatedPrice,
	} = useAppContext();

	const [expandedItems, setExpandedItems] = useState<{
		[key: string]: boolean;
	}>({});

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
			<ConfirmationCard
				title={t("contactPerson")}
				icon={<User2 className="h-5 w-5" />}
				onEdit={() => modals.setContactOpen(true)}>
				<p>
					{contactPerson.firstName} {contactPerson.lastName}
				</p>
				<p>{contactPerson.email}</p>
				{phoneMissing ? (
					<p className="font-medium text-[#C81E1E]">
						{tContact("phoneMissing")}
					</p>
				) : (
					<p>{contactPerson.phone}</p>
				)}
			</ConfirmationCard>

			<ConfirmationCard
				title={t("address")}
				icon={<MapPin className="h-5 w-5" />}
				onEdit={() => modals.setAddressOpen(true)}>
				<p>{selectedAddress?.addressName}</p>
				<p>
					{selectedAddress?.street} {selectedAddress?.houseNumber}
				</p>
				<p>
					{selectedAddress?.postalCode} {selectedAddress?.city}
				</p>
			</ConfirmationCard>

			<ConfirmationCard
				title={t("delivery")}
				icon={<Truck className="h-5 w-5" />}
				onEdit={() => modals.setDeliveryOpen(true)}>
				<p>{t("deliveryMethod")}</p>
				<p>{t("deliveryTime")}</p>
			</ConfirmationCard>

			<ConfirmationCard
				title={t("payment")}
				icon={<Wallet className="h-5 w-5" />}
				onEdit={() => modals.setPaymentOpen(true)}>
				<p>{paymentMethod === "faktura" ? t("invoice") : t("cardPayment")}</p>
				<p>
					{t("project")}:{" "}
					{orderData.salesOrderHeader.customersOrderReference ||
						t("notSpecified")}
				</p>
				<p>
					{t("department")}:{" "}
					{orderData.salesOrderHeader.customerReference || t("notSpecified")}
				</p>
				<p>
					{t("category")}:{" "}
					{orderData.salesOrderLines[0]?.accountPart3 || t("notSpecified")}
				</p>
			</ConfirmationCard>

			{/* Modals */}
			<EditContactModal
				open={modals.contactOpen}
				onClose={() => modals.setContactOpen(false)}
				onSave={handleContactPersonSave}
				initialData={contactPerson}
			/>
			<EditAddressModal
				open={modals.addressOpen}
				onClose={() => modals.setAddressOpen(false)}
				onSave={setUpdatedAddress}
				initialData={selectedAddress}
			/>
			<EditDeliveryModal
				open={modals.deliveryOpen}
				onClose={() => modals.setDeliveryOpen(false)}
				onSave={() => modals.setDeliveryOpen(false)}
				initialData={{ method: "address" }}
			/>
			<EditPaymentModal
				open={modals.paymentOpen}
				onClose={() => modals.setPaymentOpen(false)}
				onSave={() => modals.setPaymentOpen(false)}
				initialData={{
					method: paymentMethod,
					project: orderData.salesOrderHeader.customersOrderReference,
					department: orderData.salesOrderHeader.customerReference,
					category: orderData.salesOrderLines[0]?.accountPart3,
				}}
				paymentMethod={paymentMethod}
				setPaymentMethod={setPaymentMethod}
				orderData={orderData}
				setOrderData={setOrderData}
				dimensionInputMode={dimensionInputMode}
				setDimensionInputMode={setDimensionInputMode}
			/>

			<div className="col-span-1 flex flex-col md:col-span-2 lg:col-span-4">
				<h2 className="mb-4 text-xl font-semibold">{t("yourItems")}</h2>
				<div className="flex flex-col space-y-4">
					{cartItems?.cartKit && cartItems.cartKit.length > 0 && (
						<div className="space-y-4">
							{cartItems.cartKit.map((item, idx) => {
								return (
									<div
										key={idx}
										className="border-lightGray rounded-md border py-6">
										<div
											role="button"
											tabIndex={0}
											aria-expanded={!!expandedItems[item.hexagonId]}
											onClick={() =>
												setExpandedItems((prev) => ({
													...prev,
													[item.hexagonId]: !prev[item.hexagonId],
												}))
											}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setExpandedItems((prev) => ({
														...prev,
														[item.hexagonId]: !prev[item.hexagonId],
													}));
												}
											}}
											className="flex w-full cursor-pointer items-center justify-between px-4 py-3">
											<div className="flex items-center gap-3">
												{expandedItems[item.hexagonId] ? (
													<ChevronUp className="h-4 w-4 text-[#5A615D]" />
												) : (
													<ChevronDown className="h-4 w-4 text-[#5A615D]" />
												)}
												<span className="text-sm text-[#5A615D]">
													ID: {item.hexagonId}
												</span>
												<span className="font-medium text-[#0F1912]">
													{item.hose.itemDescription}
												</span>
											</div>
											<div className="flex items-center gap-6">
												<div className="flex items-center gap-6">
													<span className="font-semibold">
														{formatNorwegianCurrency(
															cartKitTotals?.[item.hexagonId] ?? 0,
														)}
													</span>
												</div>
											</div>
										</div>

										{expandedItems[item.hexagonId] && (
											<div className="border-t p-4">
												<div className="space-y-3">
													<div className="space-y-4 pl-8">
														<div className="flex items-start justify-between gap-2">
															<div className="flex flex-col">
																<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																	{item.hose.itemName}
																</p>
																<p className="text-xs text-[#5A615D]">
																	{item.hose.itemNumber}
																</p>
															</div>
															<p className="font-bold">
																{formatNorwegianCurrency(
																	getCalculatedPrice(
																		item.hose.itemNumber,
																		item.hose.quantity || 1,
																	),
																)}
															</p>
														</div>
														<div className="flex items-start justify-between gap-2">
															<div className="flex flex-col">
																<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																	{item.ferrule1.name}
																</p>
																<p className="text-xs text-[#5A615D]">
																	{item.ferrule1.itemNumber}
																</p>
															</div>

															<p className="font-bold">
																{formatNorwegianCurrency(
																	getCalculatedPrice(
																		item.ferrule1.itemNumber,
																		item.ferrule1.quantity || 1,
																	),
																)}
															</p>
														</div>
														<div className="flex items-start justify-between gap-2">
															<div className="flex flex-col">
																<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																	{item.ferrule2.name}
																</p>
																<p className="text-xs text-[#5A615D]">
																	{item.ferrule2.itemNumber}
																</p>
															</div>
															<p className="font-bold">
																{formatNorwegianCurrency(
																	getCalculatedPrice(
																		item.ferrule2.itemNumber,
																		item.ferrule2.quantity || 1,
																	),
																)}
															</p>
														</div>
														<div className="flex items-start justify-between gap-2">
															<div className="flex flex-col">
																<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																	{item.insert1.name}
																</p>
																<p className="text-xs text-[#5A615D]">
																	{item.insert1.itemNumber}
																</p>
															</div>
															<p className="font-bold">
																{formatNorwegianCurrency(
																	getCalculatedPrice(
																		item.insert1.itemNumber,
																		item.insert1.quantity || 1,
																	),
																)}
															</p>
														</div>
														<div className="flex items-start justify-between gap-2">
															<div className="flex flex-col">
																<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																	{item.insert2.name}
																</p>
																<p className="text-xs text-[#5A615D]">
																	{item.insert2.itemNumber}
																</p>
															</div>
															<p className="font-bold">
																{formatNorwegianCurrency(
																	getCalculatedPrice(
																		item.insert2.itemNumber,
																		item.insert2.quantity || 1,
																	),
																)}
															</p>
														</div>
													</div>
													{(
														Object.values(item.services ?? {}) as unknown[]
													).some((v) => {
														if (v == null || typeof v !== "object")
															return false;
														const itemNumber = (v as { itemNumber?: unknown })
															.itemNumber;
														return (
															typeof itemNumber === "string" &&
															itemNumber.trim().length > 0
														);
													}) && (
														<div className="space-y-4 pl-8">
															{Object.entries(item.services ?? {})
																.filter(([, v]) => {
																	if (v == null || typeof v !== "object")
																		return false;
																	const itemNumber = (
																		v as { itemNumber?: unknown }
																	).itemNumber;
																	return (
																		typeof itemNumber === "string" &&
																		itemNumber.trim().length > 0
																	);
																})
																.map(([key, service]) => {
																	const typedService = service as {
																		itemNumber?: string;
																		quantity?: number;
																	};
																	const itemNumber =
																		typedService.itemNumber ?? "";
																	const quantity = typedService.quantity || 1;
																	const label = key
																		.replace(/([a-z])([A-Z])/g, "$1 $2")
																		.replace(/_/g, " ")
																		.replace(/\s+/g, " ")
																		.trim();

																	const price = getCalculatedPrice(
																		itemNumber,
																		quantity,
																	);

																	return (
																		<div
																			key={`${key}-${itemNumber}`}
																			className="flex items-start justify-between gap-2">
																			<div className="flex flex-col">
																				<p className="mb-2 font-semibold text-[#0F1912] uppercase underline">
																					{label}
																				</p>
																				<p className="text-xs text-[#5A615D]">
																					{itemNumber}
																				</p>
																			</div>
																			<p className="font-bold">
																				{formatNorwegianCurrency(price)}
																			</p>
																		</div>
																	);
																})}
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
					{cartItems?.cart?.map((item: any) => (
						<Card
							key={item.itemNumber}
							className="rounded-lg border border-gray-200 p-4 shadow-none md:p-6">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-4 sm:gap-6">
									<div className="relative h-14 w-14 shrink-0 rounded bg-[#F7F7F7] p-2 sm:h-16 sm:w-16">
										{item.mediaId?.[0]?.url ? (
											<Image
												src={item.mediaId[0].url}
												alt={item.mediaId[0].filename || ""}
												fill
												sizes="64px"
												className="object-contain p-1"
												loading="eager"
											/>
										) : (
											<div className="h-full w-full rounded bg-gray-100" />
										)}
									</div>
									<div className="flex flex-col gap-0.5">
										<p className="text-sm text-[#0F1912] sm:text-base">
											{item.productNumber}
										</p>
										<p className="text-xs text-[#5A615D] sm:text-sm">{item.itemNumber}</p>
									</div>
								</div>
								<div className="flex items-center justify-between gap-4 pl-18 sm:gap-12 sm:pl-0 md:gap-50">
									<p className="font-medium text-[#0F1912]">x{item.quantity}</p>
									<p className="text-base font-bold whitespace-nowrap md:text-lg">
										{formatNorwegianCurrency(
											calculatedPrices[item.itemNumber] ?? 0,
										)}
									</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
