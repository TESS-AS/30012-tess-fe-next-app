import { ReactNode } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
	ShoppingCart,
	Mail,
	FileText,
	Trash2,
	Printer,
	CreditCard,
	CheckSquare,
	ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface HoseActionsDropdownProps {
	selectedCount: number;
	isAddingToCart?: boolean;
	onAddToCart: () => void;
	onContactSupport: () => void;
	onReportReplacement: () => void;
	onDiscardEquipment: () => void;
	onPrintCertificate: () => void;
	onPrintTags: () => void;
	onPrintTestCertificates: () => void;
	onExport: () => void;
	onSelectAll?: () => void;
	onSelectAllOnPage?: () => void;
	allSelected?: boolean;
	allSelectedOnPage?: boolean;
	triggerButton?: ReactNode;
	align?: "start" | "center" | "end";
}

export function HoseActionsDropdown({
	selectedCount,
	isAddingToCart = false,
	onAddToCart,
	onContactSupport,
	onReportReplacement,
	onDiscardEquipment,
	onPrintCertificate,
	onPrintTags,
	onPrintTestCertificates,
	onExport,
	onSelectAll,
	onSelectAllOnPage,
	allSelected = false,
	allSelectedOnPage = false,
	triggerButton,
	align = "start",
}: HoseActionsDropdownProps) {
	const t = useTranslations("HoseActionsDropdown");
	const defaultTrigger = (
		<button
			className={cn(
				"group inline-flex h-[52px] w-full cursor-pointer items-center gap-2 rounded-tr-md px-3 py-2 text-sm font-medium transition-colors",
				selectedCount > 0
					? "border-[#0E7B34] bg-[#005522] text-white"
					: "border-[#C1C4C2] text-[#5A615D] data-[state=open]:bg-[#003D1A] data-[state=open]:text-white",
			)}>
			<span className="tracking-wide">{t("action")}</span>
			<ChevronDown
				className={cn(
					"h-4 w-4 transition-colors",
					selectedCount > 0
						? "text-white"
						: "text-[#5A615D] group-data-[state=open]:text-white",
				)}
			/>
		</button>
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{triggerButton || defaultTrigger}
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align={align}
				className="w-[300px]">
				<div className="text-muted-foreground px-3 pt-1 pb-2 text-xs">
					{t("selected")}: {selectedCount}
				</div>

				<DropdownMenuItem
					onClick={onAddToCart}
					disabled={selectedCount === 0 || isAddingToCart}
					className={cn({
						"cursor-not-allowed opacity-50":
							selectedCount === 0 || isAddingToCart,
					})}>
					<ShoppingCart className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{isAddingToCart ? t("adding") : t("addToCart")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={onContactSupport}
					className={cn({
						"cursor-not-allowed opacity-50": selectedCount === 0,
					})}
					disabled>
					<Mail className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("contactSupport")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={onReportReplacement}
					className={cn({
						"cursor-not-allowed opacity-50": selectedCount === 0,
					})}
					disabled>
					<FileText className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("reportReplacement")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={onDiscardEquipment}
					className={cn({
						"cursor-not-allowed opacity-50": selectedCount === 0,
					})}
					disabled>
					<Trash2 className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("discardEquipment")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					disabled
					onClick={onPrintCertificate}>
					<Printer className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("printCertificate")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={onPrintTags}
					className={cn({
						"cursor-not-allowed opacity-50": selectedCount === 0,
					})}
					disabled>
					<Printer className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("printTags")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={onPrintTestCertificates}
					disabled>
					<Printer className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("printTestCertificates")}</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					disabled
					onClick={onExport}>
					<CreditCard className="mr-3 h-4 w-4 text-[#005522]" />
					<span>{t("exportToExcel")}</span>
				</DropdownMenuItem>

				{/* {onSelectAll && (
					<DropdownMenuItem
						onClick={onSelectAll}
						className="rounded-none border-t">
						<CheckSquare className="mr-3 h-4 w-4 text-[#005522]" />
						<span>{allSelected ? t("deselectAll") : t("selectAll")}</span>
					</DropdownMenuItem>
				)} */}

				{onSelectAllOnPage && (
					<DropdownMenuItem onClick={onSelectAllOnPage}>
						<CheckSquare className="mr-3 h-4 w-4 text-[#005522]" />
						<span>
							{allSelectedOnPage
								? t("deselectAllOnPage")
								: t("selectAllOnPage")}
						</span>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
