"use client";

import { useState, useEffect, useCallback } from "react";

import { DataTable } from "@/components/ui/data-table";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { type Rekvisisjon, useRequisitions } from "@/hooks/useRequisitions";
import { useTranslations } from "next-intl";

import { RequisitionApprovalModal } from "./rekvisisjoner/RequisitionApprovalModal";
import { RequisitionExpandedRow } from "./rekvisisjoner/RequisitionExpandedRow";
import { RequisitionFilters } from "./rekvisisjoner/RequisitionFilters";
import { useRequisitionActions } from "./rekvisisjoner/useRequisitionActions";
import { useRequisitionColumns } from "./rekvisisjoner/useRequisitionColumns";

export { getStatusChipColor } from "./rekvisisjoner/rekvisisjoner.constants";

export function Rekvisisjoner() {
	const t = useTranslations("Rekvisisjoner");
	const { data: profile } = usePunchoutProfile();
	const isCustomerRole = (profile?.role ?? "").toLowerCase() === "customer";

	const customerNumber = profile?.defaultCustomerNumber?.toString() ?? "";
	const companyNumber = profile?.defaultCompanyNumber?.toString() || "1";

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("Alle");
	const [currentPage, setCurrentPage] = useState(1);
	const [approvalModalOpen, setApprovalModalOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Rekvisisjon | null>(null);
	const [allRequisitionsCache, setAllRequisitionsCache] = useState<
		Rekvisisjon[]
	>([]);

	const itemsPerPage = 10;
	const { requisitions, total, totalPages, loading, getRequisitions } =
		useRequisitions(customerNumber, selectedStatus, currentPage, itemsPerPage);

	useEffect(() => {
		if (selectedStatus === "Alle" && requisitions.length > 0) {
			setAllRequisitionsCache(requisitions);
		}
	}, [selectedStatus, requisitions]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, selectedStatus]);

	const handleApproveSuccess = useCallback((rekvisisjon: Rekvisisjon) => {
		setSelectedOrder(rekvisisjon);
		setApprovalModalOpen(true);
	}, []);

	const {
		pendingAction,
		isRowActionPending,
		handleApprove,
		handleReject,
		handleRestore,
	} = useRequisitionActions({
		customerNumber,
		companyNumber,
		isCustomerRole,
		getRequisitions,
		onApproveSuccess: handleApproveSuccess,
	});

	const columns = useRequisitionColumns({
		t,
		isCustomerRole,
		pendingAction,
		isRowActionPending,
		onApprove: handleApprove,
		onReject: handleReject,
		onRestore: handleRestore,
	});

	const filteredRekvisisjoner = requisitions.filter((rekvisisjon) => {
		const query = searchQuery.toLowerCase();
		return (
			rekvisisjon.requisitionId.toString().toLowerCase().includes(query) ||
			rekvisisjon.description.toLowerCase().includes(query)
		);
	});

	return (
		<div className="space-y-6">
			<div className="flex items-baseline justify-between gap-4">
				<div className="flex items-center">
					<h1 className="text-2xl font-semibold">{t("title")}</h1>
					<p className="ml-4 text-[#5A615D]">{t("subtitle")}</p>
				</div>
			</div>

			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<RequisitionFilters
					searchQuery={searchQuery}
					onSearchQueryChange={setSearchQuery}
					selectedStatus={selectedStatus}
					onSelectedStatusChange={setSelectedStatus}
					requisitions={requisitions}
					allRequisitionsCache={allRequisitionsCache}
					labels={{
						searchPlaceholder: t("searchPlaceholder"),
						search: t("search"),
						status: t("status"),
					}}
				/>

				<DataTable
					data={filteredRekvisisjoner}
					columns={columns}
					currentPage={currentPage}
					itemsPerPage={itemsPerPage}
					totalItems={total}
					onPageChange={setCurrentPage}
					isLoading={loading}
					isExpandable
					expandableContent={(rekvisisjon) => (
						<RequisitionExpandedRow
							rekvisisjon={rekvisisjon}
							labels={{
								placerShipTo: (values) => t("placer.shipTo", values),
								placerMoreAddresses: (values) =>
									t("placer.moreAddresses", values),
								units: t("units").toUpperCase(),
								quantity: t("quantity").toUpperCase(),
								price: t("price").toUpperCase(),
							}}
						/>
					)}
					totalPages={totalPages}
				/>
			</div>

			<RequisitionApprovalModal
				open={approvalModalOpen}
				onOpenChange={setApprovalModalOpen}
				selectedOrder={selectedOrder}
				labels={{
					itemsAddedToCart: (values) => t("itemsAddedToCart", values),
					placerShipTo: (values) => t("placer.shipTo", values),
					placerMoreAddresses: (values) =>
						t("placer.moreAddresses", values),
					showLess: t("showLess"),
					showAll: t("showAll"),
					goToCart: t("goToCart"),
				}}
			/>
		</div>
	);
}
