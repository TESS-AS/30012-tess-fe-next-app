import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/orders.types";
import { FileText } from "lucide-react";

import { UserDimensionsInput } from "./user-dimensions";

interface Props {
	orderData: Order;
	setOrderData: (data: any) => void;
	dimensionInputMode: "select" | "search" | "manual";
	setDimensionInputMode: (mode: "select" | "search" | "manual") => void;
}

export const InvoiceInfoCard = ({
	orderData,
	setOrderData,
	dimensionInputMode,
	setDimensionInputMode,
}: Props) => {
	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="p-6">
				<div className="mb-4 flex items-start gap-2">
					<FileText className="mt-1 h-5 w-5" />
					<h2 className="text-foreground text-xl font-semibold">
						Tilleggsinformasjon for faktura
					</h2>
				</div>

				<p className="text-muted-foreground mb-4 text-sm">
					Opplysningene vises på fakturaen og hjelper økonomiavdelingen med
					riktig bokføring.
				</p>

				<UserDimensionsInput
					orderData={orderData}
					setOrderData={setOrderData}
					dimensionInputMode={dimensionInputMode}
					setDimensionInputMode={setDimensionInputMode}
				/>
			</CardContent>
		</Card>
	);
};
