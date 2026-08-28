import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/orders.types";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import { InvoiceDimensions } from "./invoice-dimensions";

interface Props {
	orderData: Order;
	setOrderData: (updater: (prev: Order) => Order) => void;
}

export const InvoiceInfoCard = ({ orderData, setOrderData }: Props) => {
	const t = useTranslations("Checkout.invoice");
	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="p-6">
				<div className="mb-2 flex items-start gap-2">
					<FileText className="mt-1 h-5 w-5" />
					<h2 className="text-foreground text-xl font-semibold">
						{t("title")}
					</h2>
				</div>

				<p className="text-muted-foreground mb-4 text-sm">
					{t("description")}
				</p>

				<InvoiceDimensions
					orderData={orderData}
					setOrderData={setOrderData}
				/>
			</CardContent>
		</Card>
	);
};
