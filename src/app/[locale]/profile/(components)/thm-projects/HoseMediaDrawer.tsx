"use client";

import { useEffect, useMemo, useState } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetHoseMediaDrawer } from "@/hooks/useGetHoseMediaDrawer";
import { cn } from "@/lib/utils";
import type {
	HoseMediaCategory,
	HoseMediaCategoryKey,
	HoseMediaEnd1Metadata,
	HoseMediaEnd2Metadata,
	HoseMediaHoseMetadata,
	HoseMediaImage,
	HoseMediaInspectionMetadata,
	HoseMediaS2Metadata,
} from "@/types/assets.types";
import { Maximize2, X } from "lucide-react";

interface HoseMediaDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	hexagonId: string | null;
	/** Displayed as "SEQ" in the header — comes from the row (posId). */
	seq: string | null;
	/** Displayed as "Equipment" in the header — comes from the row (s2). */
	equipmentName: string | null;
}

const CATEGORY_LABEL: Record<HoseMediaCategoryKey, string> = {
	s2: "S2",
	hose: "Hose",
	end1: "End 1",
	end2: "End 2",
	inspection: "Inspection",
};

const CATEGORY_ORDER: HoseMediaCategoryKey[] = [
	"s2",
	"hose",
	"end1",
	"end2",
	"inspection",
];

type TabKey = "all" | HoseMediaCategoryKey;

export function HoseMediaDrawer({
	open,
	onOpenChange,
	hexagonId,
	seq,
	equipmentName,
}: HoseMediaDrawerProps) {
	const { data, isLoading, error } = useGetHoseMediaDrawer(hexagonId, open);

	const [activeTab, setActiveTab] = useState<TabKey>("all");

	useEffect(() => {
		if (open) setActiveTab("all");
	}, [open, hexagonId]);

	const orderedCategories = useMemo<HoseMediaCategory[]>(() => {
		if (!data) return [];
		const byKey = new Map(data.categories.map((c) => [c.key, c]));
		return CATEGORY_ORDER.map((k) => byKey.get(k)).filter(
			(c): c is HoseMediaCategory => !!c,
		);
	}, [data]);

	const openAccordions =
		activeTab === "all" ? orderedCategories.map((c) => c.key) : [activeTab];

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full gap-0 p-0 sm:max-w-[420px]">
				<Header
					seq={seq}
					equipmentName={equipmentName}
					onClose={() => onOpenChange(false)}
				/>

				<Tabs
					active={activeTab}
					onSelect={setActiveTab}
					totalCount={data?.totalCount ?? 0}
					categories={orderedCategories}
					disabled={isLoading || !data}
				/>

				<div className="flex-1 overflow-y-auto px-4 pb-6">
					{isLoading ? (
						<Loading />
					) : error ? (
						<ErrorState />
					) : orderedCategories.length === 0 ? (
						<EmptyState />
					) : (
						<Accordion
							type="multiple"
							value={openAccordions}
							onValueChange={(vals) => {
								if (activeTab !== "all" && !vals.includes(activeTab)) {
									setActiveTab("all");
								}
							}}
							className="space-y-2">
							{orderedCategories.map((category) => (
								<CategoryAccordion
									key={category.key}
									category={category}
								/>
							))}
						</Accordion>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}

function Header({
	seq,
	equipmentName,
	onClose,
}: {
	seq: string | null;
	equipmentName: string | null;
	onClose: () => void;
}) {
	return (
		<div className="border-b border-[#E5E7E6] px-4 pt-4 pb-3">
			<div className="flex items-start justify-between">
				<h2 className="text-base font-semibold text-[#0F1912]">Images</h2>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="text-[#0F1912] hover:text-black">
					<X className="h-4 w-4" />
				</button>
			</div>
			<div className="mt-2 flex gap-4 text-sm text-[#0F1912]">
				<span>
					<span className="text-[#5A615D]">SEQ:</span>{" "}
					<span className="font-semibold">{seq ?? "—"}</span>
				</span>
				<span>
					<span className="text-[#5A615D]">Equipment:</span>{" "}
					<span className="font-semibold">{equipmentName ?? "—"}</span>
				</span>
			</div>
		</div>
	);
}

function Tabs({
	active,
	onSelect,
	totalCount,
	categories,
	disabled,
}: {
	active: TabKey;
	onSelect: (k: TabKey) => void;
	totalCount: number;
	categories: HoseMediaCategory[];
	disabled: boolean;
}) {
	const tabs: Array<{ key: TabKey; label: string; count: number }> = [
		{ key: "all", label: "All images", count: totalCount },
		...categories.map((c) => ({
			key: c.key as TabKey,
			label: CATEGORY_LABEL[c.key],
			count: c.count,
		})),
	];
	return (
		<div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-[#E5E7E6] px-4 py-3">
			{tabs.map((t) => {
				const isActive = t.key === active;
				return (
					<button
						key={t.key}
						type="button"
						disabled={disabled}
						onClick={() => onSelect(t.key)}
						className={cn(
							"text-sm transition-colors",
							isActive
								? "font-semibold text-[#00873C] underline underline-offset-4"
								: "text-[#0F1912] hover:text-[#00873C]",
							disabled && "opacity-50",
						)}>
						{t.label} ({t.count})
					</button>
				);
			})}
		</div>
	);
}

function CategoryAccordion({ category }: { category: HoseMediaCategory }) {
	return (
		<AccordionItem
			value={category.key}
			className="overflow-hidden rounded-md border border-[#E5E7E6]">
			<AccordionTrigger className="bg-[#F3F4F3] px-4 py-3 text-sm font-semibold text-[#0F1912] hover:no-underline">
				{CATEGORY_LABEL[category.key]} ({category.count})
			</AccordionTrigger>
			<AccordionContent className="bg-white px-4 pt-3 pb-4">
				<Metadata category={category} />
				{category.images.length > 0 ? (
					<Gallery images={category.images} />
				) : (
					<p className="mt-3 text-sm text-[#5A615D]">No images.</p>
				)}
			</AccordionContent>
		</AccordionItem>
	);
}

function Metadata({ category }: { category: HoseMediaCategory }) {
	const rows = metadataRowsForCategory(category);
	if (rows.length === 0) return null;
	return (
		<dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 pb-3 text-xs">
			{rows.map((r) => (
				<div
					key={r.label}
					className="flex gap-2">
					<dt className="text-[#5A615D]">{r.label}:</dt>
					<dd className="font-semibold text-[#0F1912]">{r.value}</dd>
				</div>
			))}
		</dl>
	);
}

function Gallery({ images }: { images: HoseMediaImage[] }) {
	return (
		<div className="mt-3 grid grid-cols-3 gap-2">
			{images.map((img) => (
				<figure
					key={img.imageId}
					className="relative aspect-square overflow-hidden rounded-md bg-[#F3F4F3]">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={img.imageUrl}
						alt={img.originalFileName}
						className="h-full w-full object-cover"
						loading="lazy"
					/>
					<span
						aria-hidden="true"
						className="absolute right-1.5 bottom-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-[#0F1912] shadow-sm">
						<Maximize2 className="h-3.5 w-3.5" />
					</span>
				</figure>
			))}
		</div>
	);
}

function Loading() {
	return (
		<div className="space-y-2 pt-3">
			{[0, 1, 2, 3, 4].map((i) => (
				<Skeleton
					key={i}
					className="h-12 w-full rounded-md"
				/>
			))}
		</div>
	);
}

function ErrorState() {
	return <p className="pt-6 text-sm text-[#5A615D]">Could not load images.</p>;
}

function EmptyState() {
	return (
		<p className="pt-6 text-sm text-[#5A615D]">
			No images available for this hose.
		</p>
	);
}

// ---- metadata mapping ---------------------------------------------------

interface Row {
	label: string;
	value: string;
}

function metadataRowsForCategory(category: HoseMediaCategory): Row[] {
	switch (category.key) {
		case "s2":
			return s2Rows(category.metadata);
		case "hose":
			return hoseRows(category.metadata);
		case "end1":
			return end1Rows(category.metadata);
		case "end2":
			return end2Rows(category.metadata);
		case "inspection":
			return inspectionRows(category.metadata);
	}
}

function s2Rows(m: HoseMediaS2Metadata): Row[] {
	return [
		{ label: "S2 Equipment", value: display(m.s2Name) },
		{ label: "Customer Equipment No", value: display(m.s2Code) },
	];
}

function hoseRows(m: HoseMediaHoseMetadata): Row[] {
	return [
		{ label: "Hose Standard", value: display(m.hoseStandard) },
		{
			label: "Total length",
			value: m.hoseLengthMm != null ? `${m.hoseLengthMm} mm` : "—",
		},
		{ label: "Hose Dim", value: display(m.hoseDimension) },
		{ label: "Outer Cover", value: display(m.outerCover) },
		{ label: "Working Pressure", value: workingPressure(m.wpBar, m.wpPsi) },
	];
}

function end1Rows(m: HoseMediaEnd1Metadata): Row[] {
	return [
		{ label: "Type Fitting End 1", value: display(m.typeFittingEnd1) },
		{ label: "Type Sub Category End 1", value: display(m.typeSubCategoryEnd1) },
		{ label: "Generic Dim End 1", value: display(m.genericDimensionName1) },
		{ label: "Gender End 1", value: display(m.genderEnd1) },
		{ label: "Angle End 1", value: display(m.angleEnd1) },
		{ label: "Material Quality End 1", value: display(m.materialQualityEnd1) },
	];
}

function end2Rows(m: HoseMediaEnd2Metadata): Row[] {
	return [
		{ label: "Type Fitting End 2", value: display(m.typeFittingEnd2) },
		{ label: "Type Sub Category End 2", value: display(m.typeSubCategoryEnd2) },
		{ label: "Generic Dim End 2", value: display(m.genericDimensionName2) },
		{ label: "Gender End 2", value: display(m.genderEnd2) },
		{ label: "Angle End 2", value: display(m.angleEnd2) },
		{ label: "Material Quality End 2", value: display(m.materialQualityEnd2) },
	];
}

function inspectionRows(m: HoseMediaInspectionMetadata): Row[] {
	return [
		{ label: "Condition", value: display(m.hoseCondition) },
		{
			label: "Approved",
			value: m.approved == null ? "—" : m.approved ? "YES" : "NO",
		},
		{ label: "Comments", value: display(m.inspectionComment) },
	];
}

function display(v: string | null | undefined): string {
	if (v == null) return "—";
	const trimmed = v.trim();
	return trimmed.length > 0 ? trimmed : "—";
}

function workingPressure(wpBar: number | null, wpPsi: number | null): string {
	const parts: string[] = [];
	if (wpBar != null) parts.push(`${wpBar} BAR`);
	if (wpPsi != null) parts.push(`${wpPsi} PSI`);
	return parts.length ? parts.join(", ") : "—";
}
