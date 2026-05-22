import type { Rekvisisjon } from "@/hooks/useRequisitions";
import { CircleCheck, CircleX, RotateCcw } from "lucide-react";

import { RequisitionActionButton } from "./RequisitionActionButton";
import type { RequisitionRowAction } from "./useRequisitionActions";

interface RequisitionActionsCellProps {
	rekvisisjon: Rekvisisjon;
	labels: {
		approve: string;
		reject: string;
		restore: string;
	};
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

export function RequisitionActionsCell({
	rekvisisjon,
	labels,
	isCustomerRole,
	pendingAction,
	isRowActionPending,
	onApprove,
	onReject,
	onRestore,
}: RequisitionActionsCellProps) {
	const rowId = rekvisisjon.requisitionId;
	const actionsDisabled = isCustomerRole || pendingAction !== null;

	return (
		<div className="flex justify-end gap-2">
			{rekvisisjon.status === "Venter godkjenning" && (
				<>
					<RequisitionActionButton
						label={labels.approve}
						icon={CircleCheck}
						loading={isRowActionPending(rowId, "approve")}
						disabled={actionsDisabled}
						className="border-[#009640] text-[#009640] hover:border-[#005522] hover:bg-[#005522] hover:text-white disabled:hover:bg-transparent disabled:hover:text-[#009640]"
						onClick={() => onApprove(rekvisisjon)}
					/>
					<RequisitionActionButton
						label={labels.reject}
						icon={CircleX}
						loading={isRowActionPending(rowId, "reject")}
						disabled={actionsDisabled}
						className="border-[#C81E1E] text-[#C81E1E] hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-white disabled:hover:bg-transparent disabled:hover:text-[#C81E1E]"
						onClick={() => onReject(rekvisisjon)}
					/>
				</>
			)}
			{(rekvisisjon.status === "Godkjent" || rekvisisjon.status === "Avvist") && (
				<RequisitionActionButton
					label={labels.restore}
					icon={RotateCcw}
					loading={isRowActionPending(rowId, "restore")}
					disabled={actionsDisabled}
					className="border-[#C1C4C2] text-[#0F1912] hover:bg-[#E8EAE9] hover:text-[#009640]"
					onClick={() => onRestore(rekvisisjon)}
				/>
			)}
		</div>
	);
}
