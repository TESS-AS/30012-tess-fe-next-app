"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import type { Rekvisisjon } from "@/hooks/useRequisitions";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatPlacerAddress } from "./rekvisisjoner.utils";

interface RequisitionApprovalModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedOrder: Rekvisisjon | null;
	labels: {
		itemsAddedToCart: (values: { count: number }) => string;
		placerShipTo: (values: { name: string; address: string }) => string;
		placerMoreAddresses: (values: { count: number }) => string;
		showLess: string;
		showAll: string;
		goToCart: string;
	};
}

export function RequisitionApprovalModal({
	open,
	onOpenChange,
	selectedOrder,
	labels,
}: RequisitionApprovalModalProps) {
	const router = useRouter();
	const [showAllItems, setShowAllItems] = useState(false);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setShowAllItems(false);
		}
		onOpenChange(nextOpen);
	};

	return (
		<Modal
			className="max-w-[400px]"
			open={open}
			onOpenChange={handleOpenChange}>
			<div>
				<ModalHeader>
					<ModalTitle className="flex items-center gap-2">
						<Image
							src="/icons/check-filled.svg"
							alt="Check"
							width={20}
							height={20}
							loading="eager"
						/>
						<span>
							{labels.itemsAddedToCart({
								count: selectedOrder?.items?.length || 0,
							})}
						</span>
					</ModalTitle>
				</ModalHeader>
				{selectedOrder?.placerAddresses?.[0] && (
					<p className="pt-2 text-sm font-medium text-[#0F1912]">
						{labels.placerShipTo({
							name: selectedOrder.bestiller,
							address: formatPlacerAddress(selectedOrder.placerAddresses[0]),
						})}
						{selectedOrder.placerAddresses.length > 1 && (
							<span className="ml-1 text-xs text-[#5A615D]">
								{labels.placerMoreAddresses({
									count: selectedOrder.placerAddresses.length - 1,
								})}
							</span>
						)}
					</p>
				)}
				<div className="space-y-2 py-4">
					{selectedOrder?.items
						?.slice(0, showAllItems ? undefined : 5)
						.map((item, index) => (
							<div
								key={index}
								className="text-sm text-gray-600">
								1 × {item.sku}
							</div>
						))}
					{selectedOrder?.items && selectedOrder.items.length > 5 && (
						<button
							type="button"
							onClick={() => setShowAllItems(!showAllItems)}
							className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
							{showAllItems ? (
								<>
									{labels.showLess}{" "}
									<ChevronDownIcon className="h-4 w-4 rotate-180 transform" />
								</>
							) : (
								<>
									{labels.showAll}{" "}
									<ChevronDownIcon className="h-4 w-4" />
								</>
							)}
						</button>
					)}
				</div>
				<div className="flex">
					<Button
						variant="default"
						className="w-full"
						onClick={() => {
							handleOpenChange(false);
							router.push("/cart");
						}}>
						{labels.goToCart}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
