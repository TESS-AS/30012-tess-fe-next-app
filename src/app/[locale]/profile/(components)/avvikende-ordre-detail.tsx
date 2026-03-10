"use client";

import { useState } from "react";

import {
	ApproveOrderChangeModal,
	RejectOrderChangeModal,
} from "@/app/[locale]/profile/(components)/order-change-modals";
import { OrderLineTable } from "@/app/[locale]/profile/(components)/order-line-table";
import { Button } from "@/components/ui/button";
import {
	useGetOpenConfirmations,
	openConfirmationsKeys,
} from "@/hooks/useGetOpenConfirmations";
import {
	useGetOpenOrderLines,
	openOrderLinesKeys,
} from "@/hooks/useGetOpenOrderLines";
import { updateOpenOrderStatus } from "@/services/orders.service";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X, Check, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

export function AvvikendeOrdreDetail({
	orderId,
	onBack,
}: {
	orderId: string;
	onBack: () => void;
}) {
	const [expandedLines, setExpandedLines] = useState<number[]>([]);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [approveModalOpen, setApproveModalOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: order, isLoading, error } = useGetOpenOrderLines(orderId);
	const { refetch: refetchOpenConfirmations } = useGetOpenConfirmations(false);

	const toggleLine = (lineNumber: number) => {
		setExpandedLines((prev) =>
			prev.includes(lineNumber)
				? prev.filter((num) => num !== lineNumber)
				: [...prev, lineNumber],
		);
	};

	const handleReject = async () => {
		try {
			await updateOpenOrderStatus(orderId, false);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: openOrderLinesKeys.detail(orderId),
				}),
				queryClient.invalidateQueries({
					queryKey: openConfirmationsKeys.all,
				}),
				refetchOpenConfirmations(),
			]);
			toast.success(`Ordre ${orderId} ble avvist.`);
			onBack();
		} catch (e) {
			console.error("Error rejecting open order", e);
			toast.error(`Kunne ikke avvise ordre ${orderId}. Prøv igjen senere.`);
		}
	};

	const handleApprove = async () => {
		try {
			await updateOpenOrderStatus(orderId, true);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: openOrderLinesKeys.detail(orderId),
				}),
				queryClient.invalidateQueries({
					queryKey: openConfirmationsKeys.all,
				}),
				refetchOpenConfirmations(),
			]);
			toast.success(`Ordre ${orderId} ble godkjent.`);
			onBack();
		} catch (e) {
			console.error("Error approving open order", e);
			toast.error(`Kunne ikke godkjenne ordre ${orderId}. Prøv igjen senere.`);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-[200px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-[#1C6D2C]" />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="space-y-4">
				<button
					onClick={onBack}
					className="flex items-center text-sm text-[#5A615D] hover:text-[#0F1912]">
					<ChevronLeft className="mr-1 h-4 w-4" />
					Gå tilbake
				</button>
				<p className="text-sm text-red-600">
					{error instanceof Error ? error.message : "Kunne ikke laste ordre."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<button
				onClick={onBack}
				className="flex items-center text-sm text-[#5A615D] hover:text-[#0F1912]">
				<ChevronLeft className="mr-1 h-4 w-4" />
				Gå tilbake
			</button>

			<h1 className="text-2xl font-bold text-[#0F1912]">
				Ordre nummer {order.orderId}
			</h1>

			{/* Order Summary */}
			<div className="rounded-lg border border-[#C1C4C2] bg-[#F8F9F8] p-4">
				<div className="grid grid-cols-3 gap-4">
					<div>
						<p className="text-base font-normal text-gray-500">Leverandør</p>
						<p className="text-base font-medium text-[#0F1912]">
							{order.supplier}
						</p>
					</div>
					<div className="mr-[-1px] text-left">
						<p className="text-base font-normal text-gray-500">Dato</p>
						<p className="text-base font-medium text-[#0F1912]">{order.date}</p>
					</div>
					<div></div>
				</div>
			</div>

			{/* Avvik Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold text-[#0F1912]">Avvik</h2>
					<div className="flex gap-3">
						<Button
							onClick={() => setRejectModalOpen(true)}
							variant="reject"
							className="flex items-center gap-2 text-xs">
							Avvis
							<div className="flex h-4 w-4 items-center justify-center rounded-full border-1 border-white">
								<X className="p-[3px] text-white" />
							</div>
						</Button>
						<Button
							onClick={() => setApproveModalOpen(true)}
							variant="approve"
							className="flex items-center gap-2 text-xs">
							Godkjenn
							<div className="flex h-4 w-4 items-center justify-center rounded-full border-1 border-white">
								<Check className="p-[3px] text-white" />
							</div>
						</Button>
					</div>
				</div>

				{/* Order Lines */}
				<div className="space-y-3">
					{order.lines.map((line) => {
						const isExpanded = expandedLines.includes(line.lineNumber);
						return (
							<OrderLineTable
								key={line.lineNumber}
								lineNumber={line.lineNumber}
								deviationCount={line.deviationCount}
								fields={line.fields}
								isExpanded={isExpanded}
								onToggle={() => toggleLine(line.lineNumber)}
							/>
						);
					})}
				</div>
			</div>

			<RejectOrderChangeModal
				open={rejectModalOpen}
				onOpenChange={setRejectModalOpen}
				onConfirm={handleReject}
			/>
			<ApproveOrderChangeModal
				open={approveModalOpen}
				onOpenChange={setApproveModalOpen}
				onConfirm={handleApprove}
				orderId={order.orderId}
			/>
		</div>
	);
}
