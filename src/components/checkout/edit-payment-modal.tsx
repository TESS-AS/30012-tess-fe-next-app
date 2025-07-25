import React from "react";

import { Order } from "@/types/orders.types";
import { Wallet } from "lucide-react";

import { UserDimensionsInput } from "./user-dimensions";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Modal } from "../ui/modal";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface EditPaymentModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: any) => void;
	initialData?: {
		method: "invoice" | "card";
		project?: string;
		department?: string;
		category?: string;
	};
	paymentMethod: string;
	setPaymentMethod: (method: string) => void;
	orderData: Order;
	setOrderData: (data: any) => void;
	dimensionInputMode: "select" | "search" | "manual";
	setDimensionInputMode: (mode: "select" | "search" | "manual") => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
	open,
	onClose,
	onSave,
	initialData,
	paymentMethod,
	setPaymentMethod,
	orderData,
	setOrderData,
	dimensionInputMode,
	setDimensionInputMode,
}) => {
	return (
		<Modal
			open={open}
			onOpenChange={onClose}>
			<div className="mb-6 flex items-center gap-2">
				<Wallet className="h-5 w-5" />
				<h2 className="text-xl font-semibold">Betalingsmetode</h2>
			</div>

			<div className="space-y-6">
				<RadioGroup
					value={paymentMethod}
					onValueChange={setPaymentMethod}>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="faktura"
							id="faktura"
						/>
						<Label htmlFor="faktura">Faktura</Label>
					</div>
				</RadioGroup>

				<UserDimensionsInput
					orderData={orderData}
					setOrderData={setOrderData}
					dimensionInputMode={dimensionInputMode}
					setDimensionInputMode={setDimensionInputMode}
				/>
			</div>

			<div className="mt-8 flex justify-between">
				<Button
					variant="outline"
					onClick={onClose}>
					Avbryt
				</Button>
				<Button
					variant="default"
					onClick={() =>
						onSave({
							method: paymentMethod,
							orderData,
						})
					}>
					Lagre betalingsmetode
				</Button>
			</div>
		</Modal>
	);
};
