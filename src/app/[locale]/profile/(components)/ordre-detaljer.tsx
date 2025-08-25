import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

interface OrdreDetaljerProps {
	orderId: string;
	onBack: () => void;
}

export function OrdreDetaljer({ orderId, onBack }: OrdreDetaljerProps) {
	// Mock data - replace with real data fetching
	const orderDetails = {
		orderId: orderId,
		status: "Mottatt",
		contact: {
			name: "Ola Nordmann",
			email: "ola.nordmann@bedrift.no",
			phone: "+47 123 45 678",
		},
		address: {
			type: "Hjemmeadresse",
			street: "Storgata 15",
			postalCode: "0155",
			city: "Oslo",
		},
		delivery: {
			type: "Levering til adresse",
			estimatedTime: "2 til 7 virkedager",
		},
		payment: {
			type: "Faktura",
			project: "Prosjekt: Prosjekt 123",
			department: "Avdeling: Salg",
			category: "Kategori: Kontor",
		},
		items: [
			{
				image: "/path/to/product-image.jpg",
				productNumber: "HYLSE COBRATES",
				itemNumber: "P_65033",
				quantity: 1,
				price: "1049.50",
			},
			{
				image: "/path/to/product-image.jpg",
				productNumber: "HYLSE COBRATES",
				itemNumber: "P_65033",
				quantity: 1,
				price: "1049.50",
			},
		],
		summary: {
			originalPrice: "4198,00",
			discount: "-999.00",
			subtotal: "3 199,00",
			vat: "1049,50",
			vatRate: "25",
		},
	};

	return (
		<div className="space-y-4">
			{/* Header with back button */}
			<div className="flex items-center gap-2">
				<div
					className="flex cursor-pointer items-center gap-2 font-medium text-[#2D3530]"
					onClick={onBack}>
					<span className="text-sm">Mine bestillinger</span>
					<ChevronRight className="h-4 w-4" />
				</div>
				<span className="text-sm font-medium text-[#2D3530]">
					{orderDetails.orderId}
				</span>
			</div>

			{/* Main content */}
			<div className="rounded-lg border border-[#C1C4C2] bg-white p-6 shadow-sm">
				<div className="grid grid-cols-4 gap-8">
					{/* Contact Person */}
					<div className="rounded-lg p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F1912]">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
									fill="currentColor"
								/>
							</svg>
							Kontaktperson
						</h2>
						<div className="space-y-2 text-sm">
							<p className="font-medium">{orderDetails.contact.name}</p>
							<p className="text-[#5A615D]">{orderDetails.contact.email}</p>
							<p className="text-[#5A615D]">{orderDetails.contact.phone}</p>
						</div>
					</div>

					{/* Address */}
					<div className="rounded-lg p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F1912]">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
									fill="currentColor"
								/>
							</svg>
							Adresse
						</h2>
						<div className="space-y-2 text-sm">
							<p className="font-medium">{orderDetails.address.type}</p>
							<p className="text-[#5A615D]">{orderDetails.address.street}</p>
							<p className="text-[#5A615D]">
								{orderDetails.address.postalCode} {orderDetails.address.city}
							</p>
						</div>
					</div>

					{/* Delivery */}
					<div className="rounded-lg p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F1912]">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM6 18.5C5.17 18.5 4.5 17.83 4.5 17C4.5 16.17 5.17 15.5 6 15.5C6.83 15.5 7.5 16.17 7.5 17C7.5 17.83 6.83 18.5 6 18.5ZM18 18.5C17.17 18.5 16.5 17.83 16.5 17C16.5 16.17 17.17 15.5 18 15.5C18.83 15.5 19.5 16.17 19.5 17C19.5 17.83 18.83 18.5 18 18.5ZM17 12V9.5H19.5L21.46 12H17Z"
									fill="currentColor"
								/>
							</svg>
							Levering
						</h2>
						<div className="space-y-2 text-sm">
							<p className="font-medium">{orderDetails.delivery.type}</p>
							<p className="text-[#5A615D]">
								Estimert leveringstid: {orderDetails.delivery.estimatedTime}
							</p>
						</div>
					</div>

					{/* Payment */}
					<div className="rounded-lg p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0F1912]">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
									fill="currentColor"
								/>
							</svg>
							Betaling
						</h2>
						<div className="space-y-2 text-sm">
							<p className="font-medium">{orderDetails.payment.type}</p>
							<p className="text-[#5A615D]">{orderDetails.payment.project}</p>
							<p className="text-[#5A615D]">
								{orderDetails.payment.department}
							</p>
							<p className="text-[#5A615D]">{orderDetails.payment.category}</p>
						</div>
					</div>
				</div>

				{/* Products */}
				<div className="mt-8">
					<h2 className="mb-4 text-lg font-semibold text-[#0F1912]">
						Dine varer
					</h2>
					<div className="space-y-4">
						{orderDetails.items.map((item, index) => (
							<Card
								key={index}
								className="rounded-lg border border-[#C1C4C2] p-6 shadow-sm">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-6">
										<div className="relative h-16 w-16 rounded bg-[#F7F7F7] p-2">
											<div className="h-full w-full rounded bg-gray-100" />
										</div>
										<div className="flex flex-col gap-0.5">
											<p className="text-base text-[#0F1912]">
												{item.productNumber}
											</p>
											<p className="text-sm text-[#5A615D]">
												{item.itemNumber}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-8">
										<p className="mr-40 text-sm text-[#0F1912]">
											x{item.quantity}
										</p>
										<p className="font-bold text-[#0F1912]">{item.price} kr</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Order Summary */}
				<div className="mt-8 rounded-lg border border-[#C1C4C2] p-6 shadow-sm">
					<h2 className="mb-4 text-lg font-semibold text-[#0F1912]">
						Ordreoversikt
					</h2>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-[#5A615D]">
								Opprinnelig pris (eks. mva.)
							</span>
							<span className="text-[#0F1912]">
								{orderDetails.summary.originalPrice} kr
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-[#5A615D]">Rabatt</span>
							<span className="text-[#22C55E]">
								{orderDetails.summary.discount} kr
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-[#5A615D]">
								Sum etter rabatt (eks. mva.)
							</span>
							<span className="text-[#0F1912]">
								{orderDetails.summary.subtotal} kr
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-[#5A615D]">
								MVA ({orderDetails.summary.vatRate}%)
							</span>
							<span className="text-[#0F1912]">
								{orderDetails.summary.vat} kr
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
