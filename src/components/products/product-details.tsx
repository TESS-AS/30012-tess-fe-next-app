"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductPrice } from "@/services/product.service";
import { IAttribute } from "@/types/product.types";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface ProductDetailsProps {
	description?: string;
	attributes?: IAttribute[];
	technicalInfo?: string;
	application?: string;
	users?: string;
	remarks?: string;
}

export function ProductDetails({
	description,
	attributes,
	technicalInfo,
	application,
	users,
	remarks,
}: ProductDetailsProps) {
	const t = useTranslations();

	return (
		<Tabs
			defaultValue="description"
			className="mt-6">
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger
					value="description"
					disabled={!description}>
					{t("Product.description")}
				</TabsTrigger>
				<TabsTrigger
					value="specifications"
					disabled={!attributes?.length}>
					{t("Product.specifications")}
				</TabsTrigger>
				<TabsTrigger
					value="details"
					disabled={!technicalInfo && !application && !users && !remarks}>
					{t("Product.details")}
				</TabsTrigger>
			</TabsList>

			<TabsContent
				value="description"
				className="mt-4">
				{description && (
					<div className="prose max-w-none">
						<p className="text-muted-foreground">{description}</p>
					</div>
				)}
			</TabsContent>

			<TabsContent
				value="specifications"
				className="mt-4">
				{attributes && (
					<div className="flex flex-wrap gap-2">
						{attributes.map((item, idx) => (
							<div
								key={idx}
								className="bg-card text-card-foreground inline-flex items-center rounded-lg border shadow-sm">
								<div className="bg-muted border-r px-3 py-2">
									<span className="text-sm font-medium">{item.name}</span>
								</div>
								<div className="px-3 py-2">
									<span className="text-sm">{item.valueDef}</span>
								</div>
							</div>
						))}
					</div>
				)}
			</TabsContent>

			<TabsContent
				value="details"
				className="mt-4 space-y-6">
				{technicalInfo && (
					<div>
						<h3 className="mb-2 font-semibold">{t("Product.technicalInfo")}</h3>
						<p className="text-muted-foreground">{technicalInfo}</p>
					</div>
				)}

				{application && (
					<div>
						<h3 className="mb-2 font-semibold">{t("Product.application")}</h3>
						<p className="text-muted-foreground">{application}</p>
					</div>
				)}

				{users && (
					<div>
						<h3 className="mb-2 font-semibold">{t("Product.users")}</h3>
						<p className="text-muted-foreground">{users}</p>
					</div>
				)}

				{remarks && (
					<div>
						<h3 className="mb-2 font-semibold">{t("Product.remarks")}</h3>
						<p className="text-muted-foreground">{remarks}</p>
					</div>
				)}
			</TabsContent>
		</Tabs>
	);
}
