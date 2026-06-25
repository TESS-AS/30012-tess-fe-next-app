import {
	ORDER_TSS_EMAIL_RECIPIENT,
	buildOrderConfirmationEmailHtml,
	buildOrderConfirmationEmailSubject,
} from "@/lib/email-templates";
import axiosClient from "@/services/axiosClient";
import { AddressFormState } from "@/types/address";
import { CartKitResponse } from "@/types/carts.types";
import { OrderResponse } from "@/types/orders.types";
import { DefaultAddress } from "@/types/user.types";

interface PlacerAddressShape {
	street: string;
	houseNumber: string;
	extraInfo: string;
	postalCode: string;
	city: string;
}

interface ContactInfo {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
}

interface OrderTotals {
	totalPrice: number;
	rabatterTotalPrice: number;
	surChargeTotalPrice: number;
	orderSummaryTotalPriceFinal: number;
}

interface SendOrderConfirmationEmailParams {
	orderResponse: OrderResponse;
	contactPerson: ContactInfo;
	paymentMethod: string;
	showVat: boolean;
	cartItems: CartKitResponse | undefined;
	calculatedPrices: Record<string, number>;
	cartKitTotals: Record<string, number>;
	totals: OrderTotals;
	placerAddress: PlacerAddressShape | null;
	updatedAddress?: AddressFormState | null;
	selectedAddress?: DefaultAddress;
}

function buildFallbackAddressLines(
	placerAddress: PlacerAddressShape | null,
	updatedAddress: AddressFormState | null | undefined,
	selectedAddress: DefaultAddress | undefined,
): string[] {
	if (placerAddress) {
		return [
			`${placerAddress.street} ${placerAddress.houseNumber}`.trim(),
			placerAddress.extraInfo,
			[placerAddress.postalCode, placerAddress.city].filter(Boolean).join(" "),
		];
	}
	if (updatedAddress) {
		return [
			`${updatedAddress.street ?? ""} ${updatedAddress.houseNumber ?? ""}`.trim(),
			updatedAddress.extraInfo ?? "",
			[updatedAddress.postalCode, updatedAddress.city].filter(Boolean).join(" "),
		];
	}
	if (selectedAddress) {
		return [
			[selectedAddress.addressLine1, selectedAddress.addressLine2]
				.filter(Boolean)
				.join(" "),
			selectedAddress.addressLine3,
			[selectedAddress.postalCode, selectedAddress.city]
				.filter(Boolean)
				.join(" "),
		];
	}
	return [];
}

export async function sendOrderConfirmationEmail({
	orderResponse,
	contactPerson,
	paymentMethod,
	showVat,
	cartItems,
	calculatedPrices,
	cartKitTotals,
	totals,
	placerAddress,
	updatedAddress,
	selectedAddress,
}: SendOrderConfirmationEmailParams): Promise<void> {
	const recipient = contactPerson.email?.trim();
	if (!recipient) return;

	const confirmation = orderResponse.order?.Ordrebekreftelse;
	const orderNumber = confirmation?.Ordrenummer || "";
	const date = confirmation?.Dato || "";
	const company = confirmation?.Firma || "";
	const confirmationAddress = confirmation?.Addresse?.[0];

	const fallbackAddressLines = buildFallbackAddressLines(
		placerAddress,
		updatedAddress,
		selectedAddress,
	);

	const addressLines = (
		confirmationAddress
			? [
					confirmationAddress.addressLine1,
					confirmationAddress.addressLine2,
					[confirmationAddress.postalCode, confirmationAddress.addressLine4]
						.filter(Boolean)
						.join(" "),
				]
			: fallbackAddressLines
	).filter((l) => !!l && l.trim().length > 0);

	const cartLineRows = (cartItems?.cart ?? []).map((item) => ({
		itemNumber: item.itemNumber,
		// Prefer the parent product name (what the customer recognises in the
		// store), then the variant name, then fall back to the product number
		// so the row is never empty.
		itemName:
			item.productName || item.itemName || item.productNumber || item.itemNumber,
		quantity: item.quantity,
		totalPrice: calculatedPrices[item.itemNumber] ?? 0,
		// First media URL from the cart line. May be undefined for items
		// without a PIM image; the template hides the thumbnail column then.
		imageUrl: item.mediaId?.[0]?.url ?? item.mediaId?.[0]?.thumbnail_url,
	}));

	const cartKitRows = (cartItems?.cartKit ?? []).map((kit) => ({
		itemNumber: kit.hose.itemNumber,
		itemName: `${kit.hose.itemDescription || kit.hose.itemName || ""} (ID ${kit.hexagonId})`.trim(),
		quantity: kit.hose.quantity || 1,
		totalPrice: cartKitTotals?.[kit.hexagonId] ?? 0,
		// Kit (hose) lines don't carry a mediaId — leave imageUrl undefined.
	}));

	const lines = [...cartLineRows, ...cartKitRows];

	const sumAfterDiscount =
		totals.orderSummaryTotalPriceFinal - totals.rabatterTotalPrice;
	const vat = sumAfterDiscount * 0.25;
	const totalIncVat =
		sumAfterDiscount + totals.surChargeTotalPrice + (showVat ? vat : 0);

	const htmlBody = buildOrderConfirmationEmailHtml({
		orderNumber,
		date,
		paymentMethod: paymentMethod === "faktura" ? "Faktura" : paymentMethod,
		name: `${contactPerson.firstName} ${contactPerson.lastName}`.trim(),
		company,
		addressLines,
		phone: contactPerson.phone,
		email: contactPerson.email,
		lines,
		totals: {
			originalPrice: totals.totalPrice,
			discounts: totals.rabatterTotalPrice,
			sumAfterDiscount,
			deliverySurcharge: totals.surChargeTotalPrice,
			vat,
			totalIncVat,
			showVat,
		},
	});

	try {
		const formData = new FormData();
		formData.append("toEmail", recipient);
		formData.append("subject", buildOrderConfirmationEmailSubject(orderNumber));
		formData.append("htmlBody", htmlBody);
		formData.append("cc[]", ORDER_TSS_EMAIL_RECIPIENT);
		formData.append("category", "OrderConfirmation");

		await axiosClient.post("/sendgrid/sendEmail", formData);
	} catch (err) {
		console.error("Failed to send order confirmation email", err);
	}
}
