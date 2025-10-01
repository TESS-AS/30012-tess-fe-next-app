"use client";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetColumnAttributes } from "@/hooks/useGetColumnAttributes"; // ✅ hook for attributes
import { useProductTabs } from "@/stores/useProductTabs";
import { useTranslations } from "next-intl";

interface ProductDetailsTableProps {
	variantData: any;
	productNumber?: string;
	locale: string;
	selectedItemNumber?: string;
	onSelectVariant?: (itemNumber: string) => void;
}

export function ProductDetailsTable({
	variantData,
	productNumber,
	locale,
	selectedItemNumber,
	onSelectVariant,
}: ProductDetailsTableProps) {
	const t = useTranslations("Product");
	const { activeTab, setActiveTab } = useProductTabs();

	const firstVariant = variantData?.itemVariants?.[0]?.itemNumber;

	const { data: columnAttributes, isLoading: loadingAttributes } =
		useGetColumnAttributes(firstVariant);

	const filteredAttributes =
		variantData?.itemTechnicalSpec?.itemAttributes?.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		) ?? [];

	return (
		<div
			className="rounded-md border border-gray-200 p-4"
			id="product-table-details">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				defaultValue="description"
				className="w-full py-5">
				<TabsList className="grid w-full grid-cols-4 overflow-hidden rounded-none bg-gray-50 p-0">
					{[
						{ value: "description", label: t("description") },
						{ value: "technical", label: t("specifications") },
						{
							value: "variants",
							label: `${t("allVariants")} (${
								variantData.itemVariants?.length || 0
							})`,
						},
						{
							value: "documents",
							label: `${t("documentsTitle")} (${
								variantData.itemDocuments?.length || 0
							})`,
						},
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="rounded-none px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:bg-gray-100 data-[state=active]:font-semibold data-[state=active]:text-gray-900 data-[state=active]:shadow-none">
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent
					value="description"
					className="mt-4 text-sm">
					{variantData?.description?.itemRemarks ||
					variantData?.description?.itemSpec ? (
						<div className="space-y-4">
							{variantData?.description?.itemRemarks && (
								<p className="whitespace-pre-line text-gray-700">
									{variantData.description.itemRemarks}
								</p>
							)}

							{Object.values(variantData?.description?.itemSpec ?? {}).filter(
								(usp: any) => usp && usp.trim() !== "",
							).length > 0 && (
								<div>
									<h3 className="text-base font-semibold text-gray-900">
										{t("uniqueSellingPoints")}
									</h3>
									<ul className="list-disc pl-5 text-gray-700">
										{Object.values(variantData.description.itemSpec ?? {})
											.filter(
												(usp): usp is string =>
													typeof usp === "string" && usp.trim() !== "",
											)
											.map((usp, i) => (
												<li key={i}>{usp}</li>
											))}
									</ul>
								</div>
							)}
						</div>
					) : (
						<p className="text-gray-500">{t("noDescriptionAvailable")}</p>
					)}
				</TabsContent>

				<TabsContent
					value="technical"
					className="mt-4 text-sm">
					{filteredAttributes.length ? (
						<div className="space-y-6">
							<h3 className="text-base font-semibold text-gray-900">
								{t("technicalData")}
							</h3>

							<div className="max-w-[50%]">
								<dl>
									{filteredAttributes.map((attr: any, index: number) => (
										<div
											key={attr.attribute_identifier || index}
											className={`grid grid-cols-2 gap-x-4 p-2 text-sm ${
												index % 2 === 0 ? "bg-gray-50" : "bg-white"
											}`}>
											<dt className="text-gray-700">
												{attr.name || attr.name_key_language}
											</dt>
											<dd className="text-gray-900">{attr.value_def}</dd>
										</div>
									))}
								</dl>
							</div>
						</div>
					) : (
						<p className="text-gray-500">{t("noSpecifications")}</p>
					)}
				</TabsContent>

				<TabsContent
					value="variants"
					className="mt-4 text-sm">
					{variantData.itemVariants?.length ? (
						<ProductVariantTable
							variants={variantData.itemVariants}
							productNumber={productNumber || ""}
							hasSearch
							selectedItemNumber={selectedItemNumber}
							onSelectVariant={onSelectVariant}
							columnAttributes={columnAttributes ?? undefined}
							loadingAttributes={loadingAttributes}
						/>
					) : (
						<p className="text-gray-500">{t("noVariants")}</p>
					)}
				</TabsContent>

				<TabsContent
					value="documents"
					className="mt-4 text-sm">
					{variantData.itemDocuments?.length ? (
						<ul className="list-disc pl-5">
							{variantData.itemDocuments.map((doc: string, i: number) => (
								<li key={i}>{doc}</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">{t("noDocumentsAvailable")}</p>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
