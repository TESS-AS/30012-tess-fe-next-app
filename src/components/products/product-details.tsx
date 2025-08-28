"use client";

import { useCallback, useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IAttribute } from "@/types/product.types";
import { Clipboard } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductDetailsProps {
	description?: string;
	attributes?: IAttribute[];
	technicalInfo?: string;
	application?: string;
	users?: string;
	remarks?: string;
	productNumber?: string;
	usp?: Record<string, string>;
}

export function ProductDetails({
	productNumber,
	technicalInfo,
	application,
	users,
	remarks,
	usp,
}: ProductDetailsProps) {
	const t = useTranslations();

	const handleCopyGtin = useCallback(() => {
		if (productNumber) navigator.clipboard.writeText(productNumber);
	}, [productNumber]);

	const uspList = useMemo(() => {
		if (!usp) return [];
		return Object.values(usp).filter((val) => val && val.trim() !== "");
	}, [usp]);

	return (
		<div className="mt-1">
			<Tabs
				defaultValue="usp"
				className="w-full">
				<div className="flex items-center justify-between">
					<TabsList className="ring-muted/40 grid max-h-[33px] max-w-[210px] grid-cols-2 gap-0 rounded-sm bg-[#E8EAE9] ring-1">
						<TabsTrigger
							value="usp"
							className="text-muted-foreground rounded-md p-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-green-900 data-[state=active]:text-white data-[state=active]:shadow-none">
							{t("Product.description")}
						</TabsTrigger>

						<TabsTrigger
							value="details"
							disabled={!technicalInfo && !application && !users && !remarks}
							className="text-muted-foreground rounded-md p-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-green-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-green-900 data-[state=active]:text-white data-[state=active]:shadow-none">
							{t("Product.details")}
						</TabsTrigger>
					</TabsList>
					{productNumber && (
						<button
							type="button"
							onClick={handleCopyGtin}
							className="group ml-2 inline-flex items-center gap-1.5 text-[14px] font-light focus:outline-none">
							<span className="uppercase">GTIN:</span>
							<span className="font-light">{productNumber}</span>
							<Clipboard className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
						</button>
					)}
				</div>

				<TabsContent
					value="usp"
					className="mt-4">
					{uspList.length > 0 ? (
						<ul className="list-disc space-y-1 pl-4">
							{uspList.map((point, idx) => (
								<li
									key={idx}
									className="text-sm">
									{point}
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm">{t("Product.noDescriptionAvailable")}</p>
					)}
				</TabsContent>

				<TabsContent
					value="details"
					className="mt-4 space-y-1">
					{technicalInfo && (
						<p className="text-sm">
							<span className="font-semibold">
								{t("Product.technicalInfo")}:{" "}
							</span>
							<span>{technicalInfo}</span>
						</p>
					)}

					{application && (
						<p className="text-sm">
							<span className="font-semibold">
								{t("Product.application")}:{" "}
							</span>
							<span>{application}</span>
						</p>
					)}

					{users && (
						<p className="text-sm">
							<span className="font-semibold">{t("Product.users")}: </span>
							<span>{users}</span>
						</p>
					)}

					{remarks && (
						<p className="text-sm">
							<span className="font-semibold">{t("Product.remarks")}: </span>
							<span>{remarks}</span>
						</p>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
