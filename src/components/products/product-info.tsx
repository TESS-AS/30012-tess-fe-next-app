"use client";

import { useCallback, useState } from "react";

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
	const [copied, setCopied] = useState(false);

	const handleCopyGtin = useCallback(() => {
		if (gtin) {
			navigator.clipboard.writeText(gtin);
			setCopied(true);
			setTimeout(() => setCopied(false), 1000);
		}
	}, [gtin]);

	return (
		<div>
			<div className="mt-1 flex items-center justify-between">
				<h1 className="text-3xl font-semibold">{name}</h1>

				<div className="flex items-center gap-8">
					{productNumber && (
						<div className="relative">
							<button
								type="button"
								onClick={handleCopyGtin}
								className="inline-flex items-center gap-1.5 text-sm font-light focus:outline-none">
								<span className="uppercase">GTIN:</span>
								<span className="font-light">{gtin}</span>
								<Files className="h-4 w-4 cursor-pointer text-gray-500" />
							</button>

							{copied && (
								<div className="absolute top-full right-0 mt-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
									{t("copied")}
								</div>
							)}
						</div>
					)}

					<a
						href={pdfUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-700 hover:text-green-900">
						<FileText className="h-4 w-4" />
					</a>
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
