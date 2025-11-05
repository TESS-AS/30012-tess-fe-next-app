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
		<div id="product-table-details">
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				defaultValue="variants"
				className="w-full py-5">
				<TabsList className="flex h-auto w-full justify-start gap-6 rounded-none border-b border-gray-200 bg-transparent p-0">
					{[
						{
							value: "variants",
							label: `${t("allVariants")} (${
								variantData.itemVariants?.length || 0
							})`,
						},
						{ value: "description", label: t("productDescription") },
						// {
						// 	value: "documents",
						// 	label: `${t("documentsTitle")} (${
						// 		variantData.itemDocuments?.length || 0
						// 	})`,
						// },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="justify-start rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 text-left text-sm font-medium text-gray-500 shadow-none data-[state=active]:border-green-700 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-green-700 data-[state=active]:shadow-none">
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent
					value="description"
					className="mt-8 text-sm">
					{variantData?.description?.itemRemarks ||
					variantData?.description?.itemSpec ||
					filteredAttributes.length > 0 ? (
						<div className="grid grid-cols-12 gap-6">
							{/* Left side - Description text (60% width) */}
							<div className="col-span-12 lg:col-span-7">
								{variantData?.description?.itemRemarks && (
									<div className="space-y-4">
										<p className="whitespace-pre-line text-black">
											{variantData.description.itemRemarks}
										</p>
									</div>
								)}

								{Object.values(variantData?.description?.itemSpec ?? {}).filter(
									(usp: any) => usp && usp.trim() !== "",
								).length > 0 && (
									<div className="mt-4 space-y-4">
										{Object.values(variantData.description.itemSpec ?? {})
											.filter(
												(usp): usp is string =>
													typeof usp === "string" && usp.trim() !== "",
											)
											.map((usp, i) => (
												<p
													key={i}
													className="text-black">
													{usp}
												</p>
											))}
									</div>
								)}

								{!variantData?.description?.itemRemarks &&
									!variantData?.description?.itemSpec && (
										<p className="text-gray-500">
											{t("noDescriptionAvailable")}
										</p>
									)}
							</div>

							{/* Right side - Specifications box (40% width) */}
							{filteredAttributes.length > 0 && (
								<div className="col-span-12 lg:col-span-5">
									<div className="rounded-md border border-gray-100 bg-gray-50 p-4">
										<h3 className="mb-4 text-lg font-semibold text-gray-900">
											{t("specifications")}
										</h3>
										<div className="space-y-0">
											{filteredAttributes.map((attr: any, index: number) => (
												<div key={attr.attribute_identifier || index}>
													<div className="grid grid-cols-2 gap-4 py-3">
														<dt className="text-left text-sm font-medium text-gray-900">
															{attr.name || attr.name_key_language}
														</dt>
														<dd className="text-right text-sm text-gray-500">
															{attr.value_def || "-"}
														</dd>
													</div>
													{index < filteredAttributes.length - 1 && (
														<hr className="border-gray-200" />
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					) : (
						<p className="text-gray-500">{t("noDescriptionAvailable")}</p>
					)}
				</TabsContent>

				<TabsContent
					value="variants"
					className="mt-8 text-sm">
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

				{/* <TabsContent
					value="documents"
					className="mt-8 text-sm">
					{variantData.itemDocuments?.length ? (
						<ul className="list-disc pl-5">
							{variantData.itemDocuments.map((doc: string, i: number) => (
								<li key={i}>{doc}</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">{t("noDocumentsAvailable")}</p>
					)}
				</TabsContent> */}
			</Tabs>
		</div>
	);
}
