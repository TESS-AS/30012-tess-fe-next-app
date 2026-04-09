"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { AlertTriangle, Loader2 } from "lucide-react";
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
			className="max-w-[440px]"
			open={open}
			onOpenChange={onOpenChange}>
			<div>
				<ModalHeader>
					<ModalTitle className="flex items-center gap-2">
						{allUnavailable ? (
							<Image
								src="/icons/alert-filled.svg"
								alt="Alert"
								width={20}
								height={20}
							/>
						) : (
							<Image
								src="/icons/check-filled.svg"
								alt="Check"
								width={20}
								height={20}
							/>
						)}
						<span>
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

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						{allUnavailable ? (
							<div className="space-y-3 text-sm text-gray-600">
								<p>
									Du kan be om å bli kontaktet eller sende en forespørsel om
									tilbud.
								</p>
							</div>
						) : addedCount === 0 ? (
							<div className="text-sm text-gray-600">
								{t("noItemsSelected")}
							</div>
						) : (
							<>
								{selectedItems
									.slice(0, showAllItems ? undefined : 5)
									.map((item, index) => (
										<div
											key={index}
											className="text-sm text-gray-600">
											1 × {item}
										</div>
									))}
								{selectedItems.length > 5 && (
									<button
										onClick={() => setShowAllItems(!showAllItems)}
										className="mt-2 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
										{showAllItems ? (
											<>
												{t("showLess")}{" "}
												<Loader2 className="h-4 w-4 rotate-180 transform" />
											</>
										) : (
											<>
												{t("showAll")} <Loader2 className="h-4 w-4" />
											</>
										)}
									</button>
								)}
							</>
						)}
						{!allUnavailable && unavailableCount > 0 && (
							<div className="mt-4 flex items-center gap-3 rounded-md bg-[#FFF7D6] px-3 py-3 text-sm text-[#0F1912]">
								<Image
									src="/icons/alert-filled.svg"
									alt="Alert"
									width={20}
									height={20}
								/>
								<span>
									{unavailableCount} vare
									{unavailableCount === 1 ? "" : "r"} ikke tilgjengelig for bestilling
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex">
					<Button
						variant="default"
						className="w-full bg-[#1C6D2C] text-white hover:bg-[#164B1F]"
						onClick={onConfirm}>
						{allUnavailable ? "Send forespørsel" : t("goToCart")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
