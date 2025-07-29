import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Truck, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeliveryMethodCardProps {
	showWarning?: boolean;
	onDismissWarning?: () => void;
}

export const DeliveryMethodCard: React.FC<DeliveryMethodCardProps> = ({
	showWarning = true,
	onDismissWarning,
}) => {
	const t = useTranslations("Checkout.delivery");
	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="p-6">
				{/* Header */}
				<div className="mb-2 flex items-center gap-2">
					<Truck className="text-foreground h-5 w-5" />
					<h2 className="text-foreground text-lg font-semibold">
						{t("title")}
					</h2>
				</div>

				{/* Warning */}
				{showWarning && (
					<div className="relative mb-4 rounded-md bg-yellow-50 p-4">
						<div className="flex items-start gap-2">
							<AlertCircle className="mt-0.5 h-5 w-5" />
							<div>
								<p className="font-bold">{t("warning.title")}</p>
							</div>
						</div>
						<p className="mt-1 text-sm">{t("warning.message")}</p>
						<button
							className="absolute top-3 right-3 cursor-pointer hover:text-yellow-700"
							onClick={onDismissWarning}
							aria-label={t("warning.closeLabel")}>
							<X className="h-4 w-4" />
						</button>
					</div>
				)}

				{/* Delivery options */}
				<RadioGroup
					defaultValue="address"
					className="space-y-3">
					<div className="flex items-start gap-2 pl-1">
						<RadioGroupItem
							value="address"
							id="address"
						/>
						<div>
							<p className="text-foreground text-sm font-medium">
								{t("options.address.title")}
							</p>
							<p className="text-muted-foreground text-xs">
								{t("options.address.estimate")}
							</p>
						</div>
					</div>
				</RadioGroup>
			</CardContent>
		</Card>
	);
};
