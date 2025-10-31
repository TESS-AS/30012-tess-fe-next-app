"use client";

import { Button } from "@/components/ui/button";
import { formatNorwegianCurrency } from "@/utils/formatCurrency";
import { Files, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductInfoProps {
	name: string;
	category: string;
	price?: number;
	pdfUrl?: string;
	productNumber?: string;
	gtin?: string | null;
}

export function ProductInfo({
	name,
	price,
	pdfUrl,
	productNumber,
	gtin,
}: ProductInfoProps) {
	const t = useTranslations("Product");

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-semibold">{name}</h1>
				<div className="flex items-center gap-8">
					<Button
						variant="outlineGreen"
						size="sm"
						className="text-sm">
						<FileText className="h-4 w-4" />
						Last ned
					</Button>
				</div>
			</div>

			{price && (
				<p className="text-primary mt-2 text-xl font-semibold">
					{formatNorwegianCurrency(price)}
				</p>
			)}
		</div>
	);
}
