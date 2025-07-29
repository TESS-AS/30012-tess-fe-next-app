import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaymentMethodCardProps {
	value: string;
	onChange: (value: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
	value,
	onChange,
}) => {
	const t = useTranslations("Checkout.payment");
	return (
		<Card className="rounded-lg shadow-none">
			<CardContent className="p-6">
				<div className="mb-6 flex items-start gap-2">
					<Wallet className="mt-1 h-5 w-5" />
					<h2 className="text-foreground text-xl font-semibold">
						{t("title")}
					</h2>
				</div>

				<RadioGroup
					value={value}
					onValueChange={onChange}>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							value="faktura"
							id="faktura"
						/>
						<Label
							htmlFor="faktura"
							className="text-sm font-medium">
							{t("invoice")}
						</Label>
					</div>
				</RadioGroup>
			</CardContent>
		</Card>
	);
};
