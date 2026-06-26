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
