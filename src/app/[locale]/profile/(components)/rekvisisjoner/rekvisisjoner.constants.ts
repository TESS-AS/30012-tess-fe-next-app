import type { RequisitionStatus } from "@/hooks/useRequisitions";

export const REQUISITION_STATUSES: RequisitionStatus[] = [
	"Alle",
	"Godkjent",
	"Venter godkjenning",
	"Avvist",
];

const STATUS_CHIP_COLORS: Record<string, string> = {
	Godkjent: "bg-[#DCF7E0] text-[#005522]",
	"Venter godkjenning": "bg-[#FDF6B2] text-[#723B13]",
	Avvist: "bg-[#FDE8E8] text-[#9B1C1C]",
};

const STATUS_RADIO_COLORS: Record<string, string> = {
	"Venter godkjenning": "bg-[#C27803]",
	Godkjent: "bg-[#1C6D2C]",
	Avvist: "bg-[#9B1C1C]",
};

export const getStatusChipColor = (status: string) =>
	STATUS_CHIP_COLORS[status] ?? "bg-gray-100 text-gray-600";

export const getRadioStatusStyle = (status: RequisitionStatus) =>
	STATUS_RADIO_COLORS[status] ?? "bg-gray-100";
