/**
 * THM Projects (MSL) — types
 *
 * Shape modelled after the Figma table columns for the
 * "Active projects for inspection" view. Field names match
 * what the FE consumes; the service layer is responsible for
 * mapping BE responses (currently mocked) into this shape.
 */

export type ThmWorkOrderStatus = "Active" | "Completed" | "On hold" | "Cancelled";

export interface ThmWorkOrder {
	workOrderNumber: string;
	description: string;
	customerNumber: string;
	customerName: string;
	s1PlantVesselUnit: string;
	dateCreated: string; // ISO 8601 (yyyy-mm-dd)
	numberOfIds: number;
	createdBy: string;
	assignedTo: string;
	status: ThmWorkOrderStatus;
}

export interface ThmWorkOrderListMeta {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface ThmWorkOrderListResponse {
	data: ThmWorkOrder[];
	meta: ThmWorkOrderListMeta;
}

export interface ThmRecentlyVisitedItem {
	workOrder: ThmWorkOrder;
	visitedAt: string; // ISO timestamp
}

export interface ThmRecentlyVisitedResponse {
	data: ThmRecentlyVisitedItem[];
	meta: Pick<ThmWorkOrderListMeta, "totalItems">;
}

export interface ThmWorkOrderListParams {
	page?: number;
	pageSize?: number;
	search?: string;
}

// ---------- Dashboard view (/survey/getTag) -------------------------------

export interface ThmDashboardDailyActivity {
	monday: number;
	tuesday: number;
	wednesday: number;
	thursday: number;
	friday: number;
	saturday: number;
	sunday: number;
	total: number;
}

export interface ThmDashboardTag {
	workOrderNumber: string;
	customerNumber: string;
	customerName: string;
	s1Code: string;
	s1Name: string;
	totalRegistrations: number;
	registrations: number;
	dateRangeActivity: ThmDashboardDailyActivity | null;
}

export interface ThmDashboardParams {
	workOrderNumber: string;
	startDate: string;
	endDate: string;
}

// ---------- List view (hoses in survey WO) --------------------------------

export type ThmHoseSyncStatus = "NotTouched" | "UpdatedFromMobile";

export interface ThmHoseListItem {
	hexagonId: string;
	posId: string;
	s2: string;
	status: ThmHoseSyncStatus;
	uploaded: string; // ISO 8601 (yyyy-mm-dd)
	synced: string; // ISO 8601 (yyyy-mm-dd)
	imageCount: number | null; // null => "(-)"
	hasImages: boolean; // controls the green icon variant
	hoseStd: string;
	hoseDim: string;

	// --- Extended columns (all optional — BE only returns fields present
	// in the user's saved view). Rendered via the Customize Columns modal.
	itemDescription?: string;
	s1Code?: string;
	s1Name?: string;
	s2Code?: string;
	s2Name?: string;
	equipmentSubunit?: string;
	customerEq?: string;
	customerNumber?: string;
	numberOfHoses?: number;
	genericHoseTypeName?: string;
	generalCommentPtc?: string;
	originalHoseComment?: string;
	outerCover?: string;
	gs1?: string;
	hoselengthMm?: number;
	wpBar?: number;
	hoseDimensionName?: string;
	hoseOtherInfo?: string;
	pinPricked?: boolean;
	hoseMediumTemperature?: string;
	hoseFunction?: string;
	registrationComment?: string;
	drawingNumber?: string;
	posNumber?: string;
	artNumber?: string;
	customerArtNumber?: string;
	criticalityName?: string;
	pollutionExposure?: string;
	uxExposure?: string;
	inspectedDate?: string;
	inspector?: string;
	hoseCondition?: string;
	approved?: boolean;
	// TODO BE: not currently returned by /asset/getHose — only accepted on
	// update/register. Column renders as "—" until BE ships it in the response.
	replacementComplexity?: string;
	typeFittingEnd1?: string;
	genericDimensionEnd1?: string;
	genderEnd1?: string;
	angleEnd1?: string;
	materialQualityEnd1?: string;
	typeSubCategoryEnd1?: string;
	typeFittingEnd2?: string;
	genericDimensionEnd2?: string;
	genderEnd2?: string;
	angleEnd2?: string;
	materialQualityEnd2?: string;
	typeSubCategoryEnd2?: string;
	// TODO BE: write-only on update/register, not in /asset/getHose response yet.
	ptcWorkOrderNumber?: string;
	statusId?: number;
}

export interface ThmWorkOrderListViewParams {
	workOrderNumber: string;
	page?: number;
	pageSize?: number;
	search?: string;
}

export interface ThmWorkOrderListViewResponse {
	data: ThmHoseListItem[];
	meta: ThmWorkOrderListMeta;
	title?: string; // e.g. "Ålesund – M/Tr Havbryn"
}

// ---------- Views (customize columns, per-user) ---------------------------

/** A saved column view for the THM work-order hose list. Scope is
 * work-order-list-only — BE stores views in a per-user bag with no
 * table discriminator, so FE column keys are namespaced with a
 * `hoseList.` prefix (see lib/thm-column-views). */
export interface ThmView {
	viewId: number;
	userId: string;
	viewName: string;
	isDefault: boolean;
	columns: string[]; // visible-only, ordered
	createdAt: string;
	updatedAt: string;
}

export interface ThmViewPayload {
	viewName: string;
	isDefault: boolean;
	columns: string[];
}

export interface ThmGetViewsResponse {
	data: ThmView[];
}
