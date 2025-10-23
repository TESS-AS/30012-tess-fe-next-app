import React from "react";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";

interface OrderConfirmationProps {
	orderNumber: string;
	date: string;
	paymentMethod: string;
	name: string;
	company: string;
	address: string;
	phone: string;
	email: string;
	onTrackOrder: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
	orderNumber,
	date,
	paymentMethod,
	name,
	company,
	address,
	phone,
	email,
	onTrackOrder,
}) => {
	const t = useTranslations("OrderConfirmation");

	return (
		<div className="py-6">
			<h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
			<p className="text-muted-foreground mb-6">
				{t("description")}
			</p>

			<div className="mb-8 flex gap-4">
				<Button
					onClick={onTrackOrder}
					variant="default">
					{t("trackOrder")}
				</Button>
				<Button
					variant="outline"
					asChild
					className="font-medium">
					<Link href="/products">{t("continueShopping")}</Link>
				</Button>
			</div>

			<div className="space-y-4 rounded-lg border border-[#E8EAE9] bg-[#F8F9F8] p-6">
				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("orderNumber")}</span>
					<span className="font-medium">#{orderNumber}</span>
				</div>

				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("date")}</span>
					<span className="font-medium">{date}</span>
				</div>

				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("paymentMethod")}</span>
					<span className="font-medium">{paymentMethod}</span>
				</div>

				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("name")}</span>
					<span className="font-medium">{name}</span>
				</div>

				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("company")}</span>
					<span className="font-medium">{company}</span>
				</div>

				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("address")}</span>
					<span className="font-medium">{address}</span>
				</div>

				<div className="flex justify-between border-b border-[#C1C4C2] pt-1 pb-4">
					<span className="text-muted-foreground">{t("phone")}</span>
					<span className="font-medium">{phone}</span>
				</div>

				<div className="flex justify-between pt-1 pb-4">
					<span className="text-muted-foreground">{t("email")}</span>
					<span className="font-medium">{email}</span>
				</div>
			</div>

			<div className="text-muted-foreground mt-8 text-sm">
				{t("helpText")}{" "}
				<a
					href="mailto:tess@tess.no"
					className="text-[#009640] hover:underline">
					tess@tess.no
				</a>
			</div>
		</div>
	);
};
