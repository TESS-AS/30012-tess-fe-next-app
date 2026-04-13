"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export interface CartAddedModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedItems: string[];
	unavailableItems?: string[];
	showAllItems: boolean;
	setShowAllItems: (val: boolean) => void;
	onConfirm: () => Promise<void> | void;
}

export function CartAddedModal({
	open,
	onOpenChange,
	selectedItems,
	unavailableItems = [],
	showAllItems,
	setShowAllItems,
	onConfirm,
}: CartAddedModalProps) {
	const t = useTranslations("CartAddedModal");
	const unavailableCount = unavailableItems.length;
	const addedCount = selectedItems.length;
	const allUnavailable = addedCount === 0 && unavailableCount > 0;

	return (
		<Modal
			className="max-w-[320px] rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
			open={open}
			onOpenChange={onOpenChange}>
			<div>
				<ModalHeader className="p-0">
					<ModalTitle className="flex items-start gap-3 text-sm font-semibold">
						{allUnavailable ? (
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
								<Image
									src="/icons/alert-filled.svg"
									alt="Alert"
									width={20}
									height={20}
								/>
							</div>
						) : (
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#009640]">
								<Check className="h-4 w-4 text-white" strokeWidth={3} />
							</div>
						)}
						<span className="pt-1">
							{allUnavailable ? (
								"Ingen av de valgte varene er tilgjengelig for direktekjøp."
							) : (
								<>
									{addedCount} {addedCount === 1 ? t("item") : t("items")}{" "}
									{t("addedToCart")}
								</>
							)}
						</span>
					</ModalTitle>
				</ModalHeader>

				<div className="mt-2 space-y-1 pl-11">
					{allUnavailable ? (
						<p className="text-sm text-[#5A615D]">
							Du kan be om å bli kontaktet eller sende en forespørsel om
							tilbud.
						</p>
					) : addedCount === 0 ? (
						<p className="text-sm text-[#5A615D]">
							{t("noItemsSelected")}
						</p>
					) : (
						<>
							{selectedItems
								.slice(0, showAllItems ? undefined : 5)
								.map((item, index) => (
									<p
										key={index}
										className="text-sm text-[#5A615D]">
										1 × {item}
									</p>
								))}
							{selectedItems.length > 5 && (
								<button
									onClick={() => setShowAllItems(!showAllItems)}
									className="mt-1 text-sm text-[#009640] hover:underline">
									{showAllItems ? t("showLess") : t("showAll")}
								</button>
							)}
						</>
					)}
				</div>

				{!allUnavailable && unavailableCount > 0 && (
					<div className="mt-3 flex items-center gap-3 rounded-lg bg-[#FFF7D6] px-3 py-2.5 text-sm text-[#0F1912]">
						<Image
							src="/icons/alert-filled.svg"
							alt="Alert"
							width={20}
							height={20}
						/>
						<span>
							{unavailableCount} vare
							{unavailableCount === 1 ? "" : "r"} ikke tilgjengelig for salg
						</span>
					</div>
				)}

				<div className="mt-4 flex gap-2">
					<Button
						className="flex-1 bg-[#009640] text-white hover:bg-[#007a2e]"
						onClick={onConfirm}>
						{allUnavailable ? "Send forespørsel" : t("goToCart")}
					</Button>
					<Button
						variant="outline"
						className="border-gray-200 text-[#0F1912] hover:bg-gray-50"
						onClick={() => onOpenChange(false)}>
						Not now
					</Button>
				</div>
			</div>
		</Modal>
	);
}
