import { useMemo } from "react";

import type { Rekvisisjon } from "@/hooks/useRequisitions";
import { formatDate } from "@/lib/utils";

import { getStatusIcons } from "../mine-bestillinger";
import { getStatusChipColor } from "./rekvisisjoner.constants";
import { RequisitionActionsCell } from "./RequisitionActionsCell";
import type { RequisitionRowAction } from "./useRequisitionActions";

interface UseRequisitionColumnsParams {
	t: (key: string) => string;
	isCustomerRole: boolean;
	pendingAction: { requisitionId: number; action: RequisitionRowAction } | null;
	isRowActionPending: (
		requisitionId: number,
		action: RequisitionRowAction,
	) => boolean;
	onApprove: (rekvisisjon: Rekvisisjon) => void;
	onReject: (rekvisisjon: Rekvisisjon) => void;
	onRestore: (rekvisisjon: Rekvisisjon) => void;
}

export function useRequisitionColumns({
	t,
	isCustomerRole,
	pendingAction,
	isRowActionPending,
	onApprove,
	onReject,
	onRestore,
}: UseRequisitionColumnsParams) {
	return useMemo(
		() => [
			{
				key: "orderId",
				header: t("orderId").toUpperCase(),
				cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.orderId,
			},
			{
				key: "bestiller",
				header: t("orderer").toUpperCase(),
				cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.bestiller,
			},
			{
				key: "opprettet",
				header: t("created").toUpperCase(),
				cell: (rekvisisjon: Rekvisisjon) =>
					formatDate(rekvisisjon.requestDate, rekvisisjon.requestTime),
			},
			{
				key: "pris",
				header: t("price").toUpperCase(),
				cell: (rekvisisjon: Rekvisisjon) => rekvisisjon.pris,
			},
			{
				key: "status",
				header: t("status").toUpperCase(),
				cell: (rekvisisjon: Rekvisisjon) => (
					<div
						className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${getStatusChipColor(rekvisisjon.status)}`}>
						{getStatusIcons(rekvisisjon.status)}
						<span>{rekvisisjon.status}</span>
					</div>
				),
			},
			{
				key: "actions",
				header: "",
				cell: (rekvisisjon: Rekvisisjon) => (
					<RequisitionActionsCell
						rekvisisjon={rekvisisjon}
						labels={{
							approve: t("approve"),
							reject: t("reject"),
							restore: t("restore"),
						}}
						isCustomerRole={isCustomerRole}
						pendingAction={pendingAction}
						isRowActionPending={isRowActionPending}
						onApprove={onApprove}
						onReject={onReject}
						onRestore={onRestore}
					/>
				),
			},
		],
		[
			t,
			isCustomerRole,
			pendingAction,
			isRowActionPending,
			onApprove,
			onReject,
			onRestore,
		],
	);
}
