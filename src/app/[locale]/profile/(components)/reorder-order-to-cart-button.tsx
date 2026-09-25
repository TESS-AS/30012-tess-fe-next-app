"use client";

import { useState, type MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useAppContext } from "@/lib/appContext";
import { addToCart } from "@/services/carts.service";
import type { OrderItems } from "@/types/orderHistory.types";
import { Loader2, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

type ReorderOrderToCartButtonProps = {
	order: OrderItems;
};

export function ReorderOrderToCartButton({
	order,
}: ReorderOrderToCartButtonProps) {
	const t = useTranslations("ReorderOrder");
	const { data: profile } = useGetProfileData();
	const { setIsCartChanging, showCartNotification } = useAppContext();
	const [isAdding, setIsAdding] = useState(false);

	const warehouseNumber = profile?.defaultWarehouseNumber
		? String(profile.defaultWarehouseNumber)
		: "";
	const companyNumber = profile?.defaultCompanyNumber
		? String(profile.defaultCompanyNumber)
		: "1";

	const lines = (order.items ?? []).filter(
		(line) => line.lineStatus !== 0 && line.itemNumber && line.quantity > 0,
	);

	const handleClick = async (event: MouseEvent) => {
		event.stopPropagation();
		if (isAdding || lines.length === 0 || !warehouseNumber) return;

		setIsAdding(true);
		try {
			let addedCount = 0;
			for (const line of lines) {
				const response = await addToCart({
					productNumber: line.productNumber,
					itemNumber: line.itemNumber,
					quantity: line.quantity,
					warehouseNumber,
					companyNumber,
					itemName: line.itemName,
				});
				if (response?.message === "Error adding to cart") {
					throw new Error(response.message);
				}
				addedCount += 1;
			}

			if (addedCount === 0) {
				toast.error(t("noItems"));
				return;
			}

			setIsCartChanging((v) => !v);

			const [first] = lines;
			showCartNotification({
				itemName: first.itemName || first.itemNumber,
				itemNumber: first.itemNumber,
				quantity: lines.reduce((sum, line) => sum + (line.quantity ?? 0), 0),
				items: lines.map((line) => ({
					name: line.itemName || line.itemNumber,
					quantity: line.quantity,
				})),
			});
			toast.success(t("success", { count: addedCount }));
		} catch (error) {
			console.error("Error reordering to cart:", error);
			toast.error(t("error"));
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled={isAdding || lines.length === 0 || !warehouseNumber}
			onClick={handleClick}
			aria-label={t("ariaLabel")}
			title={t("ariaLabel")}
			className="h-8 w-8 p-0 text-[#0F1912] hover:bg-[#DCF7E0] hover:text-[#005522]">
			{isAdding ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<ShoppingCart className="h-4 w-4" />
			)}
		</Button>
	);
}
