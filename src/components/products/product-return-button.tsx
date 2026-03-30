"use client";

import { useCallback } from "react";

import { setPendingScrollRestore } from "@/components/navigation/scroll-restore-on-route";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { consumeProductReturnTarget } from "@/lib/productReturnNavigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function ProductReturnButton() {
	const router = useRouter();
	const t = useTranslations("Product");

	const handleBack = useCallback(() => {
		const target = consumeProductReturnTarget();
		if (target?.pathname) {
			setPendingScrollRestore(target.scrollY, target.pathname);
			router.push(target.pathname);
			return;
		}
		router.back();
	}, [router]);

	return (
		<div className="mb-4">
			<Button
				type="button"
				variant="ghost"
				className="h-auto gap-2 px-0 text-sm font-medium text-[#0F1912] hover:bg-transparent hover:text-[#009640]"
				onClick={handleBack}>
				<ArrowLeft className="h-4 w-4 shrink-0" />
				{t("backToPrevious")}
			</Button>
		</div>
	);
}
