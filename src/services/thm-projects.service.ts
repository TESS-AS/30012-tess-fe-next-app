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
import type { GetAssetsResponse } from "@/types/assets.types";
import type {
	ThmDashboardParams,
	ThmDashboardTag,
	ThmGetViewsResponse,
	ThmHoseListItem,
	ThmView,
	ThmViewPayload,
	ThmWorkOrder,
	ThmWorkOrderListParams,
	ThmWorkOrderListResponse,
	ThmWorkOrderListViewParams,
	ThmWorkOrderListViewResponse,
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

const MONTHS_UPPER = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
];

// Matches the Figma display like "13-APR-2026". Input may be ISO with a
// zone (e.g. "2026-06-20T00:00:00.000Z") or already-formatted; treat as
// UTC so timezones don't shift the day.
function formatDdMmmYyyy(raw: string | undefined): string {
	if (!raw) return "";
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return "";
	const day = String(d.getUTCDate()).padStart(2, "0");
	const month = MONTHS_UPPER[d.getUTCMonth()];
	const year = d.getUTCFullYear();
	return `${day}-${month}-${year}`;
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

// ---------- List view (hoses in survey WO) --------------------------------

// `/asset/getHose` supports `workOrderNumber`, `searchTerm`, `page`,
// `pageSize` upstream (see assetSwagger.ts line 1226-1345 in the BE repo).
// We pass all of them through and trust BE's meta — no client-side
// pagination or filtering here, otherwise a big WO forces a full
// page-1000 fetch on every keystroke.
interface BeGetHoseResponse {
	data: GetAssetsResponse[];
	meta: BeListMeta;
}

export async function getThmWorkOrderHoses({
	workOrderNumber,
	page = 1,
	pageSize = 25,
	search,
}: ThmWorkOrderListViewParams): Promise<ThmWorkOrderListViewResponse> {
	// TEMP DEBUG: force-fetch hoses for customerNumber 184200 (Equinor)
	// regardless of the clicked work order so we can eyeball real rows +
	// open the drawer. REVERT ME — restore workOrderNumber/searchTerm below.
	void workOrderNumber;
	void search;
	const { data: beList } = await axiosClient.get<BeGetHoseResponse>(
		"/asset/getHose",
		{
			params: {
				customerNumber: "184200",
				page,
				pageSize,
			},
		},
	);

	const rows: ThmHoseListItem[] = (beList.data ?? []).map((hose) => {
		const hoseFitting1 = hose.hoseFitting1 as
			| { genericDimensionEnd?: { genericDimensionName?: string } }
			| undefined;
		return {
			hexagonId: String(hose.hoseLine?.hexagonId ?? ""),
			// BE gap: customerData.posNumber currently returns "" for every row.
			posId: hose.customerData?.posNumber ?? "",
			s2: hose.hoseLine?.s2?.s2Name ?? "",
			// BE gap: no mobile-sync status field yet. Placeholder until BE ships it.
			status: "NotTouched",
			// BE gap: no true "uploaded-from-mobile" timestamp. Using registration
			// date as the closest proxy so the column isn't blank.
			uploaded: formatDdMmmYyyy(hose.hoseHeader?.requestDate),
			// BE gap: no sync timestamp at all.
			synced: "",
			// BE gap: no media count on this endpoint — fanning out per row would
			// be N extra calls. Waiting on inline `mediaCount` from BE.
			imageCount: null,
			hasImages: false,
			hoseStd: hose.hoseData?.hoseType?.hoseTypeName ?? "",
			hoseDim:
				hoseFitting1?.genericDimensionEnd?.genericDimensionName ?? "",
		};
	});

	const firstHose = beList.data?.[0];
	const title = firstHose?.hoseLine?.s1?.s1Name ?? undefined;

	return {
		data: rows,
		meta: beList.meta ?? {
			page,
			pageSize,
			totalItems: rows.length,
			totalPages: 1,
		},
		title,
	};
}

// ---------- User column views (customize columns) -------------------------

export async function getThmViews(): Promise<ThmView[]> {
	const { data } = await axiosClient.get<ThmGetViewsResponse>("/user/getView");
	return data.data ?? [];
}

export async function createThmView(payload: ThmViewPayload): Promise<ThmView> {
	const { data } = await axiosClient.post<ThmView>(
		"/user/createView",
		payload,
	);
	return data;
}

export async function saveThmView(
	viewId: number,
	payload: ThmViewPayload,
): Promise<ThmView> {
	const { data } = await axiosClient.patch<ThmView>(
		`/user/saveView/${viewId}`,
		payload,
	);
	return data;
}

export async function deleteThmView(viewId: number): Promise<void> {
	await axiosClient.delete(`/user/deleteView/${viewId}`);
}

