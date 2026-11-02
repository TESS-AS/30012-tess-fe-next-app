"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useCreateThmView,
	useDeleteThmView,
	useSaveThmView,
	useThmViews,
} from "@/hooks/useThmViews";
import { useThmWorkOrderHoses } from "@/hooks/useThmWorkOrderHoses";
import { useRouter } from "@/i18n/navigation";
import {
	type ColumnDef,
	type ColumnPreferences,
	pickInitialView,
	preferencesToViewColumns,
	viewColumnsToPreferences,
} from "@/lib/thm-column-views";
import { cn } from "@/lib/utils";
import { getThmWorkOrderHoses } from "@/services/thm-projects.service";
import type { ThmHoseListItem } from "@/types/thm-projects.types";
import {
	Calendar,
	ChartNoAxesCombined,
	ChevronDown,
	Download,
	Filter,
	Image as ImageIcon,
	Info,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";

import { HoseMediaDrawer } from "./HoseMediaDrawer";
import { ThmCustomizeColumnsModal } from "./ThmCustomizeColumnsModal";

interface ThmWorkOrderListProps {
	workOrderNumber: string;
	onS1NameResolved?: (name: string | null) => void;
}

type ColumnKey =
	| "posId"
	| "s2"
	| "status"
	| "uploaded"
	| "synced"
	| "bildestatus"
	| "hoseStd"
	| "hoseDim"
	// Extended columns — hidden by default, user opts in via Customize
	// columns. BE returns these in /asset/getHose when the saved view
	// includes the matching nested-path key (COLUMN_KEY_TO_BE below).
	| "itemDescription"
	| "s1Code"
	| "s1Name"
	| "s2Code"
	| "s2Name"
	| "equipmentSubunit"
	| "customerEq"
	| "customerNumber"
	| "numberOfHoses"
	| "genericHoseTypeName"
	| "generalCommentPtc"
	| "originalHoseComment"
	| "outerCover"
	| "gs1"
	| "hoselengthMm"
	| "wpBar"
	| "hoseDimensionName"
	| "hoseOtherInfo"
	| "pinPricked"
	| "hoseMediumTemperature"
	| "hoseFunction"
	| "registrationComment"
	| "drawingNumber"
	| "posNumber"
	| "artNumber"
	| "customerArtNumber"
	| "criticalityName"
	| "pollutionExposure"
	| "uxExposure"
	| "inspectedDate"
	| "inspector"
	| "hoseCondition"
	| "approved"
	| "replacementComplexity"
	| "typeFittingEnd1"
	| "genericDimensionEnd1"
	| "genderEnd1"
	| "angleEnd1"
	| "materialQualityEnd1"
	| "typeSubCategoryEnd1"
	| "typeFittingEnd2"
	| "genericDimensionEnd2"
	| "genderEnd2"
	| "angleEnd2"
	| "materialQualityEnd2"
	| "typeSubCategoryEnd2"
	| "ptcWorkOrderNumber"
	| "statusId";

const COLUMNS: ColumnDef<ColumnKey>[] = [
	{ key: "posId", label: "POS ID" },
	{ key: "s2", label: "S2" },
	{ key: "status", label: "Status" },
	{ key: "uploaded", label: "Uploaded" },
	{ key: "synced", label: "Synced" },
	{ key: "bildestatus", label: "Bildestatus" },
	{ key: "hoseStd", label: "Hose Std" },
	{ key: "hoseDim", label: "Hose Dim" },
	{ key: "itemDescription", label: "Item description" },
	{ key: "s1Code", label: "S1 Code" },
	{ key: "s1Name", label: "S1 Name" },
	{ key: "s2Code", label: "S2 Code" },
	{ key: "s2Name", label: "S2 Name" },
	{ key: "equipmentSubunit", label: "Equipment subunit" },
	{ key: "customerEq", label: "Customer eq" },
	{ key: "customerNumber", label: "Customer no." },
	{ key: "numberOfHoses", label: "No of hoses" },
	{ key: "genericHoseTypeName", label: "Generic hose type" },
	{ key: "generalCommentPtc", label: "General comment" },
	{ key: "originalHoseComment", label: "Original hose comment" },
	{ key: "outerCover", label: "Outer cover" },
	{ key: "gs1", label: "GS1" },
	{ key: "hoselengthMm", label: "Hose length (mm)" },
	{ key: "wpBar", label: "WP (bar)" },
	{ key: "hoseDimensionName", label: "Hose dimension" },
	{ key: "hoseOtherInfo", label: "Hose other info" },
	{ key: "pinPricked", label: "Pin pricked" },
	{ key: "hoseMediumTemperature", label: "Hose medium temp" },
	{ key: "hoseFunction", label: "Hose function" },
	{ key: "registrationComment", label: "Registration comment" },
	{ key: "drawingNumber", label: "Drawing no." },
	{ key: "posNumber", label: "Pos no." },
	{ key: "artNumber", label: "Art no." },
	{ key: "customerArtNumber", label: "Customer art no." },
	{ key: "criticalityName", label: "Criticality" },
	{ key: "pollutionExposure", label: "Pollution exposure" },
	{ key: "uxExposure", label: "UX exposure" },
	{ key: "inspectedDate", label: "Inspected date" },
	{ key: "inspector", label: "Inspector" },
	{ key: "hoseCondition", label: "Hose condition" },
	{ key: "approved", label: "Approved" },
	{ key: "replacementComplexity", label: "Replacement complexity" },
	{ key: "typeFittingEnd1", label: "Type fitting end 1" },
	{ key: "genericDimensionEnd1", label: "Generic dim end 1" },
	{ key: "genderEnd1", label: "Gender end 1" },
	{ key: "angleEnd1", label: "Angle end 1" },
	{ key: "materialQualityEnd1", label: "Material end 1" },
	{ key: "typeSubCategoryEnd1", label: "Sub category end 1" },
	{ key: "typeFittingEnd2", label: "Type fitting end 2" },
	{ key: "genericDimensionEnd2", label: "Generic dim end 2" },
	{ key: "genderEnd2", label: "Gender end 2" },
	{ key: "angleEnd2", label: "Angle end 2" },
	{ key: "materialQualityEnd2", label: "Material end 2" },
	{ key: "typeSubCategoryEnd2", label: "Sub category end 2" },
	{ key: "ptcWorkOrderNumber", label: "PTC work order no." },
	{ key: "statusId", label: "Status ID" },
];

const ALL_COLUMN_KEYS = COLUMNS.map((c) => c.key);

/** FE ColumnKey → BE nested-path key (matches `getHose` response shape).
 *  BE stores views keyed on these strings — must match exactly.
 *  Confirm with Mathias if any of these don't align with `getHose` output. */
const COLUMN_KEY_TO_BE: Record<ColumnKey, string> = {
	posId: "hoseLine.hexagonId",
	s2: "hoseLine.s2",
	status: "hoseData.registrationComment",
	uploaded: "hoseData.uploadedAt",
	synced: "hoseData.syncedAt",
	bildestatus: "hoseHeader.mediaCount",
	hoseStd: "hoseLine.hoseStandard",
	hoseDim: "hoseData.hoseDimension",
	itemDescription: "hoseLine.itemDescription",
	s1Code: "hoseLine.s1.s1Code",
	s1Name: "hoseLine.s1.s1Name",
	s2Code: "hoseLine.s2.s2Code",
	s2Name: "hoseLine.s2.s2Name",
	equipmentSubunit: "hoseLine.equipmentSubunit",
	customerEq: "hoseLine.customerEq",
	customerNumber: "hoseHeader.customerNumber",
	numberOfHoses: "hoseLine.numberOfHoses",
	genericHoseTypeName: "hoseLine.genericHoseType.genericHoseTypeName",
	generalCommentPtc: "hoseLine.generalCommentPtc",
	originalHoseComment: "hoseLine.originalHoseComment",
	outerCover: "hoseLine.outerCover",
	gs1: "hoseLine.gs1",
	hoselengthMm: "hoseData.hoselengthMm",
	wpBar: "hoseData.wpBar",
	hoseDimensionName: "hoseData.hoseDimension.hoseDimension",
	hoseOtherInfo: "hoseData.hoseOtherInfo",
	pinPricked: "hoseData.pinPricked",
	hoseMediumTemperature: "hoseData.hoseMediumTemperature",
	hoseFunction: "hoseData.hoseFunction",
	registrationComment: "hoseData.registrationComment",
	drawingNumber: "customerData.drawingNumber",
	posNumber: "customerData.posNumber",
	artNumber: "customerData.artNumber",
	customerArtNumber: "customerData.customerArtNumber",
	criticalityName: "customerData.criticality.criticalityName",
	pollutionExposure: "customerData.pollutionExposure",
	uxExposure: "customerData.uxExposure",
	inspectedDate: "maintenanceDetails.inspectedDate",
	inspector: "maintenanceDetails.inspector",
	hoseCondition: "maintenanceDetails.hoseCondition",
	approved: "maintenanceDetails.approved",
	replacementComplexity: "maintenanceDetails.replacementComplexity",
	typeFittingEnd1: "hoseFitting1.typeFittingEnd.fittingEnd",
	genericDimensionEnd1: "hoseFitting1.genericDimensionEnd.genericDimensionName",
	genderEnd1: "hoseFitting1.genderEnd",
	angleEnd1: "hoseFitting1.angleEnd",
	materialQualityEnd1: "hoseFitting1.materialQualityEnd",
	typeSubCategoryEnd1: "hoseFitting1.typeSubCategoryEnd",
	typeFittingEnd2: "hoseFitting2.typeFittingEnd.fittingEnd",
	genericDimensionEnd2: "hoseFitting2.genericDimensionEnd.genericDimensionName",
	genderEnd2: "hoseFitting2.genderEnd",
	angleEnd2: "hoseFitting2.angleEnd",
	materialQualityEnd2: "hoseFitting2.materialQualityEnd",
	typeSubCategoryEnd2: "hoseFitting2.typeSubCategoryEnd",
	ptcWorkOrderNumber: "hoseLine.ptcWorkOrderNumber",
	statusId: "hoseData.status.statusId",
};

const DEFAULT_PREFS: ColumnPreferences<ColumnKey> = {
	order: ALL_COLUMN_KEYS,
	visible: Object.fromEntries(ALL_COLUMN_KEYS.map((k) => [k, true])) as Record<
		ColumnKey,
		boolean
	>,
};

// Shown as the "View Name:" label when the user hasn't created a view yet.
const FALLBACK_VIEW_NAME = "Default View";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 300;

function StatusBadge({ status }: { status: ThmHoseListItem["status"] }) {
	if (status === "NotTouched") {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDE7EA] px-2.5 py-0.5 text-xs font-medium text-[#B0261A]">
				<span className="h-1.5 w-1.5 rounded-full bg-[#B0261A]" />
				Not touched
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCF7E0] px-2.5 py-0.5 text-xs font-medium text-[#1C6D2C]">
			<svg
				className="h-3 w-3"
				viewBox="0 0 20 20"
				fill="currentColor">
				<path
					fillRule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
					clipRule="evenodd"
				/>
			</svg>
			Updated from mobile
		</span>
	);
}

function BildestatusCell({
	imageCount,
	hasImages,
	onOpen,
}: {
	imageCount: number | null;
	hasImages: boolean;
	onOpen: () => void;
}) {
	const label = imageCount == null ? "(-)" : `(${imageCount})`;
	return (
		<button
			type="button"
			onClick={onOpen}
			className={cn(
				"-mx-1 inline-flex items-center gap-2 rounded-sm px-1 hover:bg-[#F3F4F3]",
				hasImages ? "text-[#1C6D2C]" : "text-[#5A615D]",
			)}>
			<ImageIcon className="h-4 w-4" />
			<span className={cn("text-sm", hasImages && "underline")}>{label}</span>
		</button>
	);
}

function ColumnHeader({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-1 text-sm font-semibold text-[#0F1912]">
			<span>{label}</span>
			<Info className="h-3.5 w-3.5 text-[#8A8F8C]" />
			<span className="ml-1 flex flex-col text-[#8A8F8C]">
				<ChevronDown className="h-3 w-3 -rotate-180" />
				<ChevronDown className="-mt-1 h-3 w-3" />
			</span>
		</div>
	);
}

function FilterCell({ isDate }: { isDate?: boolean }) {
	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				className="inline-flex items-center gap-1 rounded border border-[#D3D3D3] bg-white px-1.5 py-0.5 text-xs text-[#5A615D]">
				<span>[R]</span>
				<ChevronDown className="h-3 w-3" />
			</button>
			<div className="relative flex-1">
				{isDate ? (
					<Calendar className="pointer-events-none absolute top-1/2 left-1 h-3 w-3 -translate-y-1/2 text-[#8A8F8C]" />
				) : (
					<Search className="pointer-events-none absolute top-1/2 left-1 h-3 w-3 -translate-y-1/2 text-[#8A8F8C]" />
				)}
				<Input
					readOnly
					className="h-6 rounded-none border-0 border-b border-dashed border-[#8A8F8C] bg-transparent pr-1 pl-4 text-xs shadow-none focus-visible:ring-0"
				/>
			</div>
		</div>
	);
}

const str = (v: string | undefined | null) => (v && v.trim() ? v : "—");
const num = (v: number | undefined | null) =>
	v == null || !Number.isFinite(v) ? "—" : v.toLocaleString();
const bool = (v: boolean | undefined | null) =>
	v == null ? "—" : v ? "Yes" : "No";

function cellText(key: ColumnKey, row: ThmHoseListItem): string {
	switch (key) {
		case "posId":
			return row.posId;
		case "s2":
			return row.s2;
		case "status":
			return row.status === "NotTouched"
				? "Not touched"
				: "Updated from mobile";
		case "uploaded":
			return row.uploaded.toUpperCase();
		case "synced":
			return row.synced.toUpperCase();
		case "bildestatus":
			return row.imageCount == null ? "(-)" : `(${row.imageCount})`;
		case "hoseStd":
			return row.hoseStd;
		case "hoseDim":
			return row.hoseDim;
		case "itemDescription":
			return str(row.itemDescription);
		case "s1Code":
			return str(row.s1Code);
		case "s1Name":
			return str(row.s1Name);
		case "s2Code":
			return str(row.s2Code);
		case "s2Name":
			return str(row.s2Name);
		case "equipmentSubunit":
			return str(row.equipmentSubunit);
		case "customerEq":
			return str(row.customerEq);
		case "customerNumber":
			return str(row.customerNumber);
		case "numberOfHoses":
			return num(row.numberOfHoses);
		case "genericHoseTypeName":
			return str(row.genericHoseTypeName);
		case "generalCommentPtc":
			return str(row.generalCommentPtc);
		case "originalHoseComment":
			return str(row.originalHoseComment);
		case "outerCover":
			return str(row.outerCover);
		case "gs1":
			return str(row.gs1);
		case "hoselengthMm":
			return num(row.hoselengthMm);
		case "wpBar":
			return num(row.wpBar);
		case "hoseDimensionName":
			return str(row.hoseDimensionName);
		case "hoseOtherInfo":
			return str(row.hoseOtherInfo);
		case "pinPricked":
			return bool(row.pinPricked);
		case "hoseMediumTemperature":
			return str(row.hoseMediumTemperature);
		case "hoseFunction":
			return str(row.hoseFunction);
		case "registrationComment":
			return str(row.registrationComment);
		case "drawingNumber":
			return str(row.drawingNumber);
		case "posNumber":
			return str(row.posNumber);
		case "artNumber":
			return str(row.artNumber);
		case "customerArtNumber":
			return str(row.customerArtNumber);
		case "criticalityName":
			return str(row.criticalityName);
		case "pollutionExposure":
			return str(row.pollutionExposure);
		case "uxExposure":
			return str(row.uxExposure);
		case "inspectedDate":
			return str(row.inspectedDate);
		case "inspector":
			return str(row.inspector);
		case "hoseCondition":
			return str(row.hoseCondition);
		case "approved":
			return bool(row.approved);
		case "replacementComplexity":
			return str(row.replacementComplexity);
		case "typeFittingEnd1":
			return str(row.typeFittingEnd1);
		case "genericDimensionEnd1":
			return str(row.genericDimensionEnd1);
		case "genderEnd1":
			return str(row.genderEnd1);
		case "angleEnd1":
			return str(row.angleEnd1);
		case "materialQualityEnd1":
			return str(row.materialQualityEnd1);
		case "typeSubCategoryEnd1":
			return str(row.typeSubCategoryEnd1);
		case "typeFittingEnd2":
			return str(row.typeFittingEnd2);
		case "genericDimensionEnd2":
			return str(row.genericDimensionEnd2);
		case "genderEnd2":
			return str(row.genderEnd2);
		case "angleEnd2":
			return str(row.angleEnd2);
		case "materialQualityEnd2":
			return str(row.materialQualityEnd2);
		case "typeSubCategoryEnd2":
			return str(row.typeSubCategoryEnd2);
		case "ptcWorkOrderNumber":
			return str(row.ptcWorkOrderNumber);
		case "statusId":
			return num(row.statusId);
	}
}

function renderCell(
	key: ColumnKey,
	row: ThmHoseListItem,
	onOpenMedia: (row: ThmHoseListItem) => void,
) {
	if (key === "status") return <StatusBadge status={row.status} />;
	if (key === "bildestatus") {
		return (
			<BildestatusCell
				imageCount={row.imageCount}
				hasImages={row.hasImages}
				onOpen={() => onOpenMedia(row)}
			/>
		);
	}
	return cellText(key, row);
}

function xmlEscape(value: string) {
	return value
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function columnLetter(index: number) {
	let n = index + 1;
	let letters = "";
	while (n > 0) {
		const remainder = (n - 1) % 26;
		letters = String.fromCharCode(65 + remainder) + letters;
		n = Math.floor((n - 1) / 26);
	}
	return letters;
}

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let crc = i;
		for (let bit = 0; bit < 8; bit++) {
			crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
		}
		table[i] = crc >>> 0;
	}
	return table;
})();

function crc32(data: Uint8Array) {
	let crc = 0xffffffff;
	for (let i = 0; i < data.length; i++) {
		crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files: Array<{ name: string; data: Uint8Array }>) {
	const encoder = new TextEncoder();
	const locals: Uint8Array[] = [];
	const central: Uint8Array[] = [];
	let offset = 0;

	for (const file of files) {
		const name = encoder.encode(file.name);
		const crc = crc32(file.data);
		const local = new DataView(new ArrayBuffer(30));
		local.setUint32(0, 0x04034b50, true);
		local.setUint16(4, 20, true);
		local.setUint16(8, 0, true);
		local.setUint32(14, crc, true);
		local.setUint32(18, file.data.length, true);
		local.setUint32(22, file.data.length, true);
		local.setUint16(26, name.length, true);
		locals.push(new Uint8Array(local.buffer), name, file.data);

		const directory = new DataView(new ArrayBuffer(46));
		directory.setUint32(0, 0x02014b50, true);
		directory.setUint16(4, 20, true);
		directory.setUint16(6, 20, true);
		directory.setUint32(16, crc, true);
		directory.setUint32(20, file.data.length, true);
		directory.setUint32(24, file.data.length, true);
		directory.setUint16(28, name.length, true);
		directory.setUint32(42, offset, true);
		central.push(new Uint8Array(directory.buffer), name);
		offset += 30 + name.length + file.data.length;
	}

	const centralSize = central.reduce((sum, part) => sum + part.length, 0);
	const end = new DataView(new ArrayBuffer(22));
	end.setUint32(0, 0x06054b50, true);
	end.setUint16(8, files.length, true);
	end.setUint16(10, files.length, true);
	end.setUint32(12, centralSize, true);
	end.setUint32(16, offset, true);

	return new Blob([...locals, ...central, new Uint8Array(end.buffer)], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
}

function inlineCell(ref: string, value: string) {
	return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
}

function downloadWorkOrderExcel(
	filename: string,
	columns: Array<{ key: ColumnKey; label: string }>,
	rows: ThmHoseListItem[],
) {
	const encode = (xml: string) => new TextEncoder().encode(xml);
	const sheetRows = [
		`<row r="1">${columns
			.map((column, index) => inlineCell(`${columnLetter(index)}1`, column.label))
			.join("")}</row>`,
		...rows.map((row, rowIndex) => {
			const excelRow = rowIndex + 2;
			const cells = columns
				.map((column, index) =>
					inlineCell(
						`${columnLetter(index)}${excelRow}`,
						cellText(column.key, row),
					),
				)
				.join("");
			return `<row r="${excelRow}">${cells}</row>`;
		}),
	].join("");

	const blob = zipStore([
		{
			name: "[Content_Types].xml",
			data: encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`),
		},
		{
			name: "_rels/.rels",
			data: encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
		},
		{
			name: "xl/workbook.xml",
			data: encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Hoses" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
		},
		{
			name: "xl/_rels/workbook.xml.rels",
			data: encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
		},
		{
			name: "xl/styles.xml",
			data: encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`),
		},
		{
			name: "xl/worksheets/sheet1.xml",
			data: encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${sheetRows}</sheetData>
</worksheet>`),
		},
	]);

	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

const DATE_COLUMNS = new Set<ColumnKey>(["uploaded", "synced", "inspectedDate"]);

export function ThmWorkOrderList({
	workOrderNumber,
	onS1NameResolved,
}: ThmWorkOrderListProps) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [customizeOpen, setCustomizeOpen] = useState(false);
	const [activeViewId, setActiveViewId] = useState<number | null>(null);
	const [mediaDrawerRow, setMediaDrawerRow] = useState<ThmHoseListItem | null>(
		null,
	);
	const [downloading, setDownloading] = useState(false);

	// Debounce the search input — a keystroke shouldn't refire the request
	// mid-typing, which on a large WO means a slow BE round-trip per letter.
	useEffect(() => {
		const t = setTimeout(
			() => setDebouncedSearch(search.trim()),
			SEARCH_DEBOUNCE_MS,
		);
		return () => clearTimeout(t);
	}, [search]);

	// Reset to page 1 whenever the filter set changes — otherwise we could
	// land on a page number that no longer exists in the filtered result.
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, pageSize, workOrderNumber]);

	const { data: views = [], isLoading: viewsLoading } = useThmViews();
	const createView = useCreateThmView();
	const saveView = useSaveThmView();
	const deleteView = useDeleteThmView();

	// Sync the active view id with what the server has: on first load, pick
	// the default (or first). If the active view got deleted (by us, or in
	// another tab), fall back to the same rule.
	useEffect(() => {
		if (activeViewId != null && views.some((v) => v.viewId === activeViewId)) {
			return;
		}
		setActiveViewId(pickInitialView(views)?.viewId ?? null);
	}, [views, activeViewId]);

	const activeView = useMemo(
		() => views.find((v) => v.viewId === activeViewId) ?? null,
		[views, activeViewId],
	);

	const prefs = useMemo<ColumnPreferences<ColumnKey>>(
		() =>
			activeView
				? viewColumnsToPreferences(
						activeView.columns,
						ALL_COLUMN_KEYS,
						COLUMN_KEY_TO_BE,
					)
				: DEFAULT_PREFS,
		[activeView],
	);

	const visibleColumns = useMemo(
		() => prefs.order.filter((key) => prefs.visible[key]),
		[prefs],
	);

	const { data, isLoading } = useThmWorkOrderHoses(
		workOrderNumber
			? {
					workOrderNumber,
					page,
					pageSize,
					search: debouncedSearch || undefined,
				}
			: null,
	);

	const rows = data?.data ?? [];
	const total = data?.meta.totalItems ?? 0;

	useEffect(() => {
		if (data?.title) onS1NameResolved?.(data.title);
	}, [data?.title, onS1NameResolved]);
	const totalPages = data?.meta.totalPages ?? 1;

	const title = data?.title ?? workOrderNumber;

	const goToDashboard = () => {
		router.push(
			`/profile?tab=thm-dashboard&workOrder=${encodeURIComponent(workOrderNumber)}`,
		);
	};

	const handleResetFilters = () => {
		setSearch("");
		setDebouncedSearch("");
		setPage(1);
	};

	const handleDownload = async () => {
		if (!workOrderNumber || downloading) return;
		setDownloading(true);
		try {
			const pageSizeFetch = 100;
			const first = await getThmWorkOrderHoses({
				workOrderNumber,
				page: 1,
				pageSize: pageSizeFetch,
				search: debouncedSearch || undefined,
			});
			const allRows = [...first.data];
			for (let nextPage = 2; nextPage <= first.meta.totalPages; nextPage++) {
				const next = await getThmWorkOrderHoses({
					workOrderNumber,
					page: nextPage,
					pageSize: pageSizeFetch,
					search: debouncedSearch || undefined,
				});
				allRows.push(...next.data);
			}
			if (allRows.length === 0) {
				toast.error("Ingen data å laste ned.");
				return;
			}
			const columns = visibleColumns.map((key) => ({
				key,
				label: COLUMNS.find((column) => column.key === key)?.label ?? key,
			}));
			downloadWorkOrderExcel(
				`work-order-${workOrderNumber}.xlsx`,
				columns,
				allRows,
			);
		} catch (error) {
			console.error("Excel download failed", error);
			toast.error("Kunne ikke laste ned Excel.");
		} finally {
			setDownloading(false);
		}
	};

	const currentViewName = activeView?.viewName ?? FALLBACK_VIEW_NAME;

	const handleSavePrefs = async (
		next: ColumnPreferences<ColumnKey>,
		meta: { viewName: string },
	) => {
		const nextName = meta.viewName || currentViewName;
		const payload = {
			viewName: nextName,
			// Preserve the existing default flag when updating; the first view a
			// user creates becomes the default automatically.
			isDefault: activeView?.isDefault ?? views.length === 0,
			columns: preferencesToViewColumns(next, COLUMN_KEY_TO_BE),
		};
		try {
			if (activeView) {
				await saveView.mutateAsync({ viewId: activeView.viewId, payload });
				toast.success(`Visningen "${nextName}" ble lagret.`);
			} else {
				const created = await createView.mutateAsync(payload);
				setActiveViewId(created.viewId);
				toast.success(`Visningen "${nextName}" ble opprettet.`);
			}
		} catch (e) {
			console.error("Save view failed", e);
			toast.error("Kunne ikke lagre visningen. Prøv igjen senere.");
		}
	};

	const handleCopyView = async () => {
		const nextName = activeView
			? `${activeView.viewName} (Copy)`
			: currentViewName;
		const payload = {
			viewName: nextName,
			isDefault: false,
			columns: preferencesToViewColumns(prefs, COLUMN_KEY_TO_BE),
		};
		try {
			const created = await createView.mutateAsync(payload);
			setActiveViewId(created.viewId);
			setCustomizeOpen(false);
			toast.success(`Visningen "${nextName}" ble kopiert.`);
		} catch (e) {
			console.error("Copy view failed", e);
			toast.error("Kunne ikke kopiere visningen. Prøv igjen senere.");
		}
	};

	const handleDeleteView = async () => {
		if (!activeView) {
			setCustomizeOpen(false);
			return;
		}
		const deletedName = activeView.viewName;
		try {
			await deleteView.mutateAsync(activeView.viewId);
			// Optimistically flip to whatever the next best view is; the effect
			// above will reconcile once the refetch lands.
			const remaining = views.filter((v) => v.viewId !== activeView.viewId);
			setActiveViewId(pickInitialView(remaining)?.viewId ?? null);
			setCustomizeOpen(false);
			toast.success(`Visningen "${deletedName}" ble slettet.`);
		} catch (e) {
			console.error("Delete view failed", e);
			toast.error("Kunne ikke slette visningen. Prøv igjen senere.");
		}
	};

	const columnLookup = new Map(COLUMNS.map((c) => [c.key, c]));

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h1 className="text-2xl font-semibold text-[#0F1912]">
					<span className="font-semibold">Hoses in Survey Workorder:</span>{" "}
					<span className="font-normal">{title}</span>
				</h1>
				<Button
					variant="outline"
					size="sm"
					onClick={goToDashboard}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<ChartNoAxesCombined className="h-4 w-4" />
					Dashboard
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<div className="relative min-w-[280px] flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#8A8F8C]" />
					<Input
						placeholder="Søk på POS, S2, Status ..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-9 pl-9"
					/>
				</div>
				<span className="text-sm text-[#5A615D]">
					Total in list: <span className="font-semibold">{total}</span>
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={handleResetFilters}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<Filter className="h-4 w-4" />
					Reset filters
				</Button>
				<Select
					value={activeViewId != null ? String(activeViewId) : ""}
					onValueChange={(v) => setActiveViewId(Number(v))}
					disabled={viewsLoading || views.length === 0}>
					<SelectTrigger className="h-9 w-[260px] bg-white">
						<SelectValue placeholder={`View: ${FALLBACK_VIEW_NAME}`} />
					</SelectTrigger>
					<SelectContent>
						{views.map((v) => (
							<SelectItem
								key={v.viewId}
								value={String(v.viewId)}>
								View: {v.viewName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCustomizeOpen(true)}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<SlidersHorizontal className="h-4 w-4" />
					Customize columns
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => void handleDownload()}
					disabled={downloading || isLoading}
					className="gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
					<Download className="h-4 w-4" />
					{downloading ? "Downloading..." : "Download"}
				</Button>
			</div>

			<div className="overflow-x-auto rounded-md border border-[#C1C4C2] bg-white">
				<table className="w-full min-w-max border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7E6] bg-white">
							{visibleColumns.map((key) => (
								<th
									key={key}
									className="px-4 py-3 text-left">
									<ColumnHeader label={columnLookup.get(key)?.label ?? key} />
								</th>
							))}
						</tr>
						<tr className="border-b border-[#E5E7E6] bg-white">
							{visibleColumns.map((key) => (
								<th
									key={key}
									className="px-4 py-2">
									<FilterCell isDate={DATE_COLUMNS.has(key)} />
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							Array.from({ length: 6 }).map((_, i) => (
								<tr
									key={i}
									className="border-b border-[#E5E7E6]">
									{visibleColumns.map((key) => (
										<td
											key={key}
											className="px-4 py-4">
											<Skeleton className="h-4 w-full" />
										</td>
									))}
								</tr>
							))
						) : rows.length === 0 ? (
							<tr>
								<td
									colSpan={visibleColumns.length}
									className="px-4 py-10 text-center text-sm text-[#5A615D]">
									Ingen slanger funnet.
								</td>
							</tr>
						) : (
							rows.map((row, i) => (
								<tr
									key={`${row.posId}-${i}`}
									className="border-b border-[#E5E7E6] hover:bg-[#F7F9F8]">
									{visibleColumns.map((key) => (
										<td
											key={key}
											className="px-4 py-4 text-[#0F1912]">
											{renderCell(key, row, setMediaDrawerRow)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<PaginationFooter
				page={page}
				pageSize={pageSize}
				totalItems={total}
				totalPages={totalPages}
				onPageChange={setPage}
				onPageSizeChange={setPageSize}
			/>

			<ThmCustomizeColumnsModal<ColumnKey>
				open={customizeOpen}
				onOpenChange={setCustomizeOpen}
				columns={COLUMNS}
				value={prefs}
				defaults={DEFAULT_PREFS}
				viewName={currentViewName}
				onSave={handleSavePrefs}
				onCopyView={handleCopyView}
				onDeleteView={handleDeleteView}
			/>

			<HoseMediaDrawer
				open={mediaDrawerRow != null}
				onOpenChange={(o) => {
					if (!o) setMediaDrawerRow(null);
				}}
				hexagonId={mediaDrawerRow?.hexagonId ?? null}
				seq={mediaDrawerRow?.posId ?? null}
				equipmentName={mediaDrawerRow?.s2 ?? null}
			/>
		</div>
	);
}

function PaginationFooter({
	page,
	pageSize,
	totalItems,
	totalPages,
	onPageChange,
	onPageSizeChange,
}: {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	onPageChange: (p: number) => void;
	onPageSizeChange: (s: number) => void;
}) {
	if (totalItems === 0) return null;

	const clamp = (n: number) => Math.min(Math.max(n, 1), totalPages);
	const rangeStart = (page - 1) * pageSize + 1;
	const rangeEnd = Math.min(page * pageSize, totalItems);

	// Compact window: current ±2, plus first/last with ellipses.
	const pages = pageWindow(page, totalPages);

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#C1C4C2] bg-white px-4 py-3 text-sm">
			<div className="flex items-center gap-2 text-[#5A615D]">
				<span>
					Showing{" "}
					<span className="font-semibold text-[#0F1912]">{rangeStart}</span>–
					<span className="font-semibold text-[#0F1912]">{rangeEnd}</span> of{" "}
					<span className="font-semibold text-[#0F1912]">{totalItems}</span>
				</span>
				<span className="mx-2 h-4 w-px bg-[#E5E7E6]" />
				<span>Per page:</span>
				<Select
					value={String(pageSize)}
					onValueChange={(v) => onPageSizeChange(Number(v))}>
					<SelectTrigger className="h-8 w-[80px] bg-white">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((s) => (
							<SelectItem
								key={s}
								value={String(s)}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Pagination className="mx-0 w-auto justify-end">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							aria-disabled={page <= 1}
							className={cn(page <= 1 && "pointer-events-none opacity-50")}
							onClick={(e) => {
								e.preventDefault();
								if (page > 1) onPageChange(clamp(page - 1));
							}}
						/>
					</PaginationItem>
					{pages.map((p, i) =>
						p === "…" ? (
							<PaginationItem key={`ellipsis-${i}`}>
								<span className="px-2 text-[#5A615D]">…</span>
							</PaginationItem>
						) : (
							<PaginationItem key={p}>
								<PaginationLink
									href="#"
									isActive={p === page}
									onClick={(e) => {
										e.preventDefault();
										onPageChange(p);
									}}>
									{p}
								</PaginationLink>
							</PaginationItem>
						),
					)}
					<PaginationItem>
						<PaginationNext
							href="#"
							aria-disabled={page >= totalPages}
							className={cn(
								page >= totalPages && "pointer-events-none opacity-50",
							)}
							onClick={(e) => {
								e.preventDefault();
								if (page < totalPages) onPageChange(clamp(page + 1));
							}}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

function pageWindow(current: number, total: number): Array<number | "…"> {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const out: Array<number | "…"> = [];
	const add = (n: number | "…") => {
		if (out[out.length - 1] !== n) out.push(n);
	};
	add(1);
	if (current > 3) add("…");
	for (
		let p = Math.max(2, current - 1);
		p <= Math.min(total - 1, current + 1);
		p++
	) {
		add(p);
	}
	if (current < total - 2) add("…");
	add(total);
	return out;
}
