import { useState, useCallback } from "react";

import type { Rekvisisjon } from "@/hooks/useRequisitions";
import { useAppContext } from "@/lib/appContext";
import { addToCart } from "@/services/carts.service";
import { updateRequisition } from "@/services/requisitions.service";

export type RequisitionRowAction = "approve" | "reject" | "restore";

type PendingRequisitionAction = {
	requisitionId: number;
	action: RequisitionRowAction;
} | null;

interface UseRequisitionActionsParams {
	customerNumber: string;
	companyNumber: string;
	isCustomerRole: boolean;
	getRequisitions: () => void;
	onApproveSuccess: (rekvisisjon: Rekvisisjon) => void;
}

export function useRequisitionActions({
	customerNumber,
	companyNumber,
	isCustomerRole,
	getRequisitions,
	onApproveSuccess,
}: UseRequisitionActionsParams) {
	const { setIsCartChanging, setRequisitionPlacerInfo } = useAppContext();
	const [pendingAction, setPendingAction] =
		useState<PendingRequisitionAction>(null);

	const isRowActionPending = useCallback(
		(requisitionId: number, action: RequisitionRowAction) =>
			pendingAction?.requisitionId === requisitionId &&
			pendingAction.action === action,
		[pendingAction],
	);

	const runRequisitionAction = useCallback(
		async (
			requisitionId: number,
			action: RequisitionRowAction,
			fn: () => Promise<void>,
		) => {
			if (isCustomerRole || pendingAction) return;
			setPendingAction({ requisitionId, action });
			try {
				await fn();
				getRequisitions();
			} catch (error) {
				console.error(`Error on requisition ${action}`, error);
			} finally {
				setPendingAction(null);
			}
		},
		[isCustomerRole, pendingAction, getRequisitions],
	);

	const handleApprove = useCallback(
		(rekvisisjon: Rekvisisjon) => {
			const rowId = rekvisisjon.requisitionId;
			return runRequisitionAction(rowId, "approve", async () => {
				setIsCartChanging(true);
				try {
					await updateRequisition({
						customerNumber,
						requisitionId: rowId,
						status: "approved",
					});
					for (const item of rekvisisjon.items) {
						await addToCart({
							productNumber: item.productNumber,
							itemNumber: item.itemNumber,
							quantity: item.quantity,
							warehouseNumber: "1",
							companyNumber,
						});
					}
					// Always set placer info on approve so BE can attribute the
					// budget_transaction to the placer via `salesOrderHeader
					// .requisitionId`. The addresses are optional — a placer without
					// address entries still needs the requisitionId propagated, or the
					// order will be charged against the approver's budget by
					// consumeDirectOrder instead of consumeForRequisition.
					setRequisitionPlacerInfo({
						requisitionId: rowId,
						placerUserId: rekvisisjon.placerUserId,
						placerAddresses: rekvisisjon.placerAddresses ?? [],
						selectedPlacerAddressId:
							rekvisisjon.placerAddresses?.[0]?.addressId ?? null,
						placerName: rekvisisjon.bestiller,
					});
					onApproveSuccess(rekvisisjon);
				} finally {
					setIsCartChanging(false);
				}
			});
		},
		[
			customerNumber,
			companyNumber,
			runRequisitionAction,
			setIsCartChanging,
			setRequisitionPlacerInfo,
			onApproveSuccess,
		],
	);

	const handleReject = useCallback(
		(rekvisisjon: Rekvisisjon) =>
			runRequisitionAction(rekvisisjon.requisitionId, "reject", async () => {
				await updateRequisition({
					customerNumber,
					requisitionId: rekvisisjon.requisitionId,
					status: "rejected",
				});
			}),
		[customerNumber, runRequisitionAction],
	);

	const handleRestore = useCallback(
		(rekvisisjon: Rekvisisjon) =>
			runRequisitionAction(rekvisisjon.requisitionId, "restore", async () => {
				await updateRequisition({
					customerNumber,
					requisitionId: rekvisisjon.requisitionId,
					status: "awaiting",
				});
			}),
		[customerNumber, runRequisitionAction],
	);

	return {
		pendingAction,
		isRowActionPending,
		handleApprove,
		handleReject,
		handleRestore,
	};
}
