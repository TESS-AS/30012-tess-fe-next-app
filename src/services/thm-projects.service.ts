/**
 * THM Projects (MSL) — service layer.
 *
 * Active projects come from /asset/getWorkOrder?workOrderType=MR (BE will
 * extend this response with customerName, dateCreated, numberOfIds, createdBy,
 * assignedTo). /survey/getTag is reserved for the per-WO dashboard view
 * (registered tags + daily registrations chart) — not used in the list.
 *
 * Recently-visited is a client-only concern — see
 * lib/thm-recently-visited-storage.ts. BE has no equivalent endpoint.
 */

import axiosClient from "@/services/axiosClient";
import type {
	ThmDashboardParams,
	ThmDashboardTag,
	ThmWorkOrder,
	ThmWorkOrderListParams,
	ThmWorkOrderListResponse,
} from "@/types/thm-projects.types";

// ---------- BE response shape (loose, partial) -----------------------------

interface BeListMeta {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

interface BeWorkOrder {
	workOrderNumber: number | string;
	workOrderType?: string;
	customerNumber?: string;
	status?: string;
	description?: string;
	s1Code?: string;
	s1Name?: string;
	hexagonId?: string;
	// Fields BE is adding — present as soon as they ship.
	customerName?: string;
	dateCreated?: string;
	numberOfIds?: number;
	createdBy?: string;
	assignedTo?: string;
}

interface BeGetWorkOrderResponse {
	data: BeWorkOrder[];
	meta: BeListMeta;
}

// BE returns status codes like "M1" → description "Aktiv". Real code → label
// mapping is TBD; pass through for now so unmapped codes land on the
// StatusBadge default and are visually obvious.
function mapStatus(beStatus: string | undefined): ThmWorkOrder["status"] {
	return (beStatus ?? "") as ThmWorkOrder["status"];
}

function isoFromBeDate(raw: string | undefined): string {
	if (!raw) return "";
	if (raw.includes("T")) return raw.slice(0, 10);
	return raw;
}

// ---------- Public service API --------------------------------------------

// BE /asset/getWorkOrder currently returns one row PER hexagonId (so the
// same workOrderNumber appears ~N times where N = number of hoses in that
// WO). The THM Projects table needs one row PER workOrderNumber, so we
// group client-side. Drop the grouping (and switch back to passing
// page/pageSize/searchTerm through to BE) once BE returns grouped data
// with `numberOfIds = COUNT(hexagonId)` aggregated.
const FETCH_ALL_PAGE_SIZE = 1000;

function groupByWorkOrder(beRows: BeWorkOrder[]): ThmWorkOrder[] {
	const groups = new Map<string, { rep: BeWorkOrder; count: number }>();
	for (const row of beRows) {
		const key = String(row.workOrderNumber);
		const existing = groups.get(key);
		if (existing) {
			existing.count += 1;
		} else {
			groups.set(key, { rep: row, count: 1 });
		}
	}

	return Array.from(groups.values()).map(({ rep, count }) => ({
		workOrderNumber: String(rep.workOrderNumber),
		description: rep.description ?? "",
		customerNumber: rep.customerNumber ?? "",
		customerName: rep.customerName ?? "",
		s1PlantVesselUnit: rep.s1Name ?? "",
		dateCreated: isoFromBeDate(rep.dateCreated),
		// Prefer BE-provided count once they ship the aggregated field.
		numberOfIds: rep.numberOfIds ?? count,
		createdBy: rep.createdBy ?? "",
		assignedTo: rep.assignedTo ?? "",
		status: mapStatus(rep.status),
	}));
}

function matchesSearch(row: ThmWorkOrder, search: string | undefined): boolean {
	if (!search) return true;
	const q = search.trim().toLowerCase();
	if (!q) return true;
	return (
		row.workOrderNumber.toLowerCase().includes(q) ||
		row.customerNumber.toLowerCase().includes(q) ||
		row.customerName.toLowerCase().includes(q) ||
		row.description.toLowerCase().includes(q) ||
		row.dateCreated.toLowerCase().includes(q)
	);
}

export async function getThmActiveProjects(
	params: ThmWorkOrderListParams = {},
): Promise<ThmWorkOrderListResponse> {
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 25;

	const { data: beList } = await axiosClient.get<BeGetWorkOrderResponse>(
		"/asset/getWorkOrder",
		{
			params: {
				workOrderType: "MR",
				page: 1,
				pageSize: FETCH_ALL_PAGE_SIZE,
			},
		},
	);

	const grouped = groupByWorkOrder(beList.data ?? []);
	const filtered = grouped.filter((row) => matchesSearch(row, params.search));

	const totalItems = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const start = (page - 1) * pageSize;
	const slice = filtered.slice(start, start + pageSize);

	return {
		data: slice,
		meta: { page, pageSize, totalItems, totalPages },
	};
}

// ---------- Dashboard view (/survey/getTag) -------------------------------

interface BeSurveyTagResponse {
	data: ThmDashboardTag[];
	meta?: unknown;
}

export async function getThmDashboard({
	workOrderNumber,
	startDate,
	endDate,
}: ThmDashboardParams): Promise<ThmDashboardTag | null> {
	const { data } = await axiosClient.get<BeSurveyTagResponse>(
		"/survey/getTag",
		{
			params: {
				workOrderNumber,
				startDate,
				endDate,
				page: 1,
				pageSize: 100,
			},
		},
	);
	return data.data?.[0] ?? null;
}

