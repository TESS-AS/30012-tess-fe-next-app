import React from "react";

import { Loader2, Check, File, MapPin } from "lucide-react";

import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

interface OrderTrackingModalProps {
	open: boolean;
	onClose: () => void;
	orderNumber: string;
	orderDate: string;
	email: string;
	phone: string;
	paymentMethod: string;
	address: string;
	totalAmount: string;
	paymentReceived?: boolean;
	orderReceived?: boolean;
	invoiceSent?: boolean;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
	open,
	onClose,
	orderNumber,
	orderDate,
	email,
	phone,
	paymentMethod,
	address,
	totalAmount,
	paymentReceived = false,
	orderReceived = false,
	invoiceSent = false,
}) => {
	return (
		<Modal
			open={open}
			onOpenChange={onClose}>
			<div className="space-y-6">
				<div className="flex items-center justify-between border-b border-[#C1C4C2] pb-2">
					<h2 className="text-lg font-semibold">
						Spor leveringen av bestilling #{orderNumber}
					</h2>
				</div>

				<div className="grid grid-cols-2 gap-4 pb-20">
					<div className="space-y-4">
						<div className="flex justify-between border-b border-[#C1C4C2] pb-2 text-sm">
							<span className="text-base font-medium">Bestillingsdato</span>
							<span className="text-base">{orderDate}</span>
						</div>

						<div className="flex justify-between border-b border-[#C1C4C2] pb-2 text-sm">
							<span className="text-base font-medium">E-post</span>
							<span className="text-base">{email}</span>
						</div>

						<div className="flex justify-between border-b border-[#C1C4C2] pb-2 text-sm">
							<span className="text-base font-medium">Telefon</span>
							<span className="text-base">{phone}</span>
						</div>

						<div className="flex justify-between border-b border-[#C1C4C2] pb-2 text-sm">
							<span className="text-base font-medium">Betalingsmåte</span>
							<span className="text-base">{paymentMethod}</span>
						</div>

						<div className="flex justify-between border-b border-[#C1C4C2] pb-2 text-sm">
							<span className="text-base font-medium">Leveringsadresse</span>
							<span className="text-base">{address}</span>
						</div>

						<div className="flex justify-between border-b border-[#C1C4C2] pb-2 text-sm">
							<span className="text-base font-medium">Totalpris</span>
							<span className="text-lg font-bold text-[#0F1912]">
								{totalAmount} NOK
							</span>
						</div>
					</div>

					<div className="ml-3 space-y-4 border-l border-dashed border-[#C1C4C2]">
						<div className="ml-[-11px] flex items-start gap-3">
							<MapPin className="mt-1 h-5 w-5 bg-white text-[#009640]" />
							<div className="flex-1">
								<p className="font-[600]">Betaling mottatt</p>
								<p className="text-sm text-[#5A615D]">{orderDate}, 10:47</p>
							</div>
						</div>

						<div className="ml-[-11px] flex items-start gap-3">
							<MapPin className="mt-1 h-5 w-5 bg-white text-[#009640]" />
							<div className="flex-1">
								<p className="font-[600]">Bestilling lagt inn</p>
								<p className="text-sm text-[#5A615D]">{orderDate}, 10:45</p>
							</div>
						</div>

						{invoiceSent && (
							<Button
								variant="outline"
								className="ml-8 font-medium text-[#0F1912]">
								<File className="h-4 w-4" /> Via faktura
							</Button>
						)}
					</div>
				</div>

				<div className="flex gap-4 border-t border-[#C1C4C2] pt-4">
					<Button variant="default">Bestillingsdetaljer</Button>
					<Button
						variant="outline"
						className="font-medium"
						onClick={onClose}>
						Kanseller bestilling
					</Button>
				</div>
			</div>
		</Modal>
	);
};
