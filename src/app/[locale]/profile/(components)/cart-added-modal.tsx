"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Item = { beskrivelse: string };

export interface CartAddedModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedItems: Item[];
	showAllItems: boolean;
	setShowAllItems: (val: boolean) => void;
	isNavigating: boolean;
	onConfirm: () => Promise<void> | void;
}

export function CartAddedModal({
	open,
	onOpenChange,
	selectedItems,
	showAllItems,
	setShowAllItems,
	isNavigating,
	onConfirm,
}: CartAddedModalProps) {
	const t = useTranslations("CartAddedModal");
	return (
		<Modal
			className="max-w-[400px]"
			open={open}
			onOpenChange={onOpenChange}>
			<div>
				<ModalHeader>
					<ModalTitle className="flex items-center gap-2">
						<Image
							src="/icons/check-filled.svg"
							alt="Check"
							width={20}
							height={20}
						/>
						<span>
							{selectedItems.length}{" "}
							{selectedItems.length === 1 ? t("item") : t("items")} {t("addedToCart")}
						</span>
					</ModalTitle>
				</ModalHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						{selectedItems.length === 0 ? (
							<div className="text-sm text-gray-600">{t("noItemsSelected")}</div>
						) : (
							<>
								{selectedItems
									.slice(0, showAllItems ? undefined : 5)
									.map((item, index) => (
										<div
											key={index}
											className="text-sm text-gray-600">
											1 × {item.beskrivelse}
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
					</div>
				</div>

				<div className="flex">
					<Button
						variant="default"
						className="w-full bg-[#1C6D2C] text-white hover:bg-[#164B1F]"
						disabled={isNavigating}
						onClick={onConfirm}>
						{isNavigating ? (
							<>
								<span className="mr-2">{t("navigatingToCart")}</span>
								<Loader2 className="h-4 w-4 animate-spin" />
							</>
						) : (
							t("goToCart")
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
