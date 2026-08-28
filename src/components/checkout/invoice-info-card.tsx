import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/orders.types";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

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
	const t = useTranslations("Checkout.invoice");
	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="p-6">
				<div className="mb-4 flex items-start gap-2">
					<FileText className="mt-1 h-5 w-5" />
					<h2 className="text-foreground text-xl font-semibold">
						{t("title")}
					</h2>
				</div>

				<p className="text-muted-foreground mb-4 text-sm">{t("description")}</p>

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
