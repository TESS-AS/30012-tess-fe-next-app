"use client";

import { useMemo, useState } from "react";

import { Copy, Minus, Plus } from "lucide-react";

interface ProductDetailTabsProps {
	columnAttributes: Record<string, any> | null;
	selectedItemNumber?: string;
	locale: string;
	name?: string;
	productNumber?: string;
	imageUrl?: string;
	application?: string;
	gtin?: string | null;
	variants?: Array<{ itemNumber?: string }>;
	firstItemNumber?: string;
}

export function ProductDetailTabs({
	columnAttributes,
	selectedItemNumber,
	locale,
	gtin,
}: ProductDetailTabsProps) {
	const [collapsed, setCollapsed] = useState(false);

	const allAttributes = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return [];
		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];
		return attrs.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		);
	}, [selectedItemNumber, columnAttributes, locale]);

	const filteredAttributes = useMemo(() => {
		if (!columnAttributes?.productData?.attributes) return [];
		return columnAttributes.productData.attributes.filter((attr: any) =>
			locale === "no"
				? attr.language === "Norwegian"
				: attr.language === "English",
		);
	}, [columnAttributes?.productData?.attributes, locale]);

	const sapNumber = useMemo(() => {
		if (!selectedItemNumber || !columnAttributes) return null;
		const attrs = columnAttributes[selectedItemNumber]?.attributes || [];
		const attr = attrs.find(
			(a: any) => a.name?.toLowerCase() === "sap nr",
		);
		return attr?.valueDef ?? null;
	}, [selectedItemNumber, columnAttributes]);

	if (allAttributes.length === 0 && filteredAttributes.length === 0) {
		return null;
	}

	const title =
		locale === "no" ? "Tekniske spesifikasjoner" : "Technical specifications";
	const variantInfoTitle =
		locale === "no" ? "Variantinformasjon" : "Variant information";
	const productInfoTitle =
		locale === "no" ? "Produktinformasjon" : "Product information";

	const copy = (value: string) => {
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			void navigator.clipboard.writeText(value);
		}
	};

	return (
		<section
			aria-label={title}
			className="mt-12 w-full overflow-hidden rounded-lg border"
			style={{ borderColor: "#C1C4C2", backgroundColor: "#F8F9F8" }}>
			<header className="flex items-center justify-between px-6 py-4">
				<h2 className="text-xl font-semibold text-gray-900">{title}</h2>
				<button
					type="button"
					onClick={() => setCollapsed((c) => !c)}
					aria-label={collapsed ? "Expand" : "Collapse"}
					className="text-gray-700 hover:text-black">
					{collapsed ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
				</button>
			</header>

			{!collapsed && (
				<div className="grid grid-cols-1 gap-6 px-6 pt-2 pb-6 lg:grid-cols-[minmax(240px,340px)_1fr]">
					{/* Left: Variantinformasjon (inner bordered box) */}
					{allAttributes.length > 0 && (
						<div
							className="rounded-lg border"
							style={{ borderColor: "#C1C4C2", backgroundColor: "#E8EAE9" }}>
							<div className="px-4 py-3">
								<h3 className="text-base font-semibold text-gray-900">
									{variantInfoTitle}
								</h3>
							</div>
							<div className="px-4 py-3">
								<dl className="space-y-2">
									{allAttributes.map((attr: any, index: number) => (
										<div
											key={attr.attribute_identifier || index}
											className="flex items-baseline justify-between gap-3">
											<dt className="text-sm font-semibold text-gray-900">
												{attr.name || attr.nameKeyLanguage || "-"}
											</dt>
											<dd className="text-right text-sm font-light text-gray-800">
												{attr.valueDef || attr.value_def || "-"}
											</dd>
										</div>
									))}
								</dl>

								{(gtin || sapNumber) && (
									<>
										<hr
											className="my-3"
											style={{ borderColor: "#C1C4C2" }}
										/>
										<dl className="space-y-2">
											{gtin && (
												<div className="flex items-center justify-between gap-3">
													<dt className="text-sm font-semibold text-gray-900">
														GTIN
													</dt>
													<dd className="flex items-center gap-2 text-sm font-light text-gray-800">
														<span>{gtin}</span>
														<button
															type="button"
															onClick={() => copy(gtin)}
															aria-label="Copy GTIN"
															className="text-green-700 hover:text-green-900">
															<Copy className="h-4 w-4" />
														</button>
													</dd>
												</div>
											)}
											{sapNumber && (
												<div className="flex items-center justify-between gap-3">
													<dt className="text-sm font-semibold text-gray-900">
														SAP
													</dt>
													<dd className="flex items-center gap-2 text-sm font-light text-gray-800">
														<span>{sapNumber}</span>
														<button
															type="button"
															onClick={() => copy(sapNumber)}
															aria-label="Copy SAP"
															className="text-green-700 hover:text-green-900">
															<Copy className="h-4 w-4" />
														</button>
													</dd>
												</div>
											)}
										</dl>
									</>
								)}
							</div>
						</div>
					)}

					{/* Right: Produktinformasjon (no inner border, wider content) */}
					{filteredAttributes.length > 0 && (
						<div className="px-4">
							<h3 className="mb-4 py-3 text-base font-semibold text-gray-900">
								{productInfoTitle}
							</h3>
							<dl className="space-y-3">
								{filteredAttributes.map((attr: any, index: number) => (
									<div
										key={attr.attribute_identifier || index}
										className="grid grid-cols-[140px_1fr] gap-4">
										<dt className="text-sm font-semibold text-gray-900">
											{attr.name || attr.nameKeyLanguage || "-"}
										</dt>
										<dd className="text-sm font-light text-gray-800">
											{attr.valueDef || attr.value_def || "-"}
										</dd>
									</div>
								))}
							</dl>
						</div>
					)}
				</div>
			)}
		</section>
	);
}
