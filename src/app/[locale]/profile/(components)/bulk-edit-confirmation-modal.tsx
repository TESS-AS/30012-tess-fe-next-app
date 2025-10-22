"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiSelectWithTags } from "@/components/ui/multi-select";
import { RadioSelect } from "@/components/ui/radio-select";
import { Badge } from "@/components/ui/badge";
import { X, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface User {
	id: string;
	name: string;
	role: string;
}

interface BulkEditConfirmationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedUsers: User[];
	onConfirm: (changes: BulkEditChanges) => void;
}

export interface BulkEditChanges {
	customerAccess?: string[];
	catalogs?: string[];
	warehouses?: string[];
	company?: string;
}

export function BulkEditConfirmationModal({
	open,
	onOpenChange,
	selectedUsers,
	onConfirm,
}: BulkEditConfirmationModalProps) {
	const t = useTranslations("BulkEditConfirmationModal");
	const [showWarning, setShowWarning] = useState(true);

	const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
	const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);
	const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
	const [selectedCompany, setSelectedCompany] = useState<string>("");

	// Options for dropdowns
	const customerOptions = [
		{ value: "kunde1", label: "Kunde 1" },
		{ value: "kunde2", label: "Kunde 2" },
		{ value: "equinor", label: "Equinor" },
		{ value: "bilfinger", label: "Bilfinger" },
	];

	const catalogOptions = [
		{ value: "netto", label: "Bilfinger nettopriser" },
		{ value: "total", label: "TESS total sortiment" },
	];

	const warehouseOptions = [
		{ value: "lager1", label: "Lager 1" },
		{ value: "lager2", label: "Lager 2" },
		{ value: "mo", label: "Mo i Rana" },
	];

	const tessFirmaOptions = [
		{ value: "vest", label: "TESS Vest" },
		{ value: "nord", label: "TESS Nord" },
		{ value: "ost", label: "TESS Øst" },
	];

	const handleConfirm = () => {
		const changes: BulkEditChanges = {
			customerAccess: selectedCustomers,
			catalogs: selectedCatalogs,
			warehouses: selectedWarehouses,
			company: selectedCompany,
		};
		onConfirm(changes);
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[680px] p-0">
				<DialogHeader className="border-b border-[#E5E7E6] px-6 py-4">
					<div className="flex items-start justify-between">
						<DialogTitle className="text-xl font-semibold text-[#0F1912]">
							{t("title")}
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className="space-y-6 px-6 py-2">
					<div>
						<h3 className="mb-3 font-bold text-[#0F1912]">
							{t("selectedUsers", { count: selectedUsers.length })}
						</h3>
						<div className="flex flex-col gap-2 rounded-lg border border-[#C1C4C2] p-2.5">
							<p className="text-xs text-[#0F1912]">{t("changesWillApply")}</p>
							<div className="flex flex-wrap gap-2">
								{selectedUsers.map((user) => (
									<Badge
										key={user.id}
										variant="secondary"
										className="h-[22px] gap-1 rounded-md bg-[#E8EAE9] px-2 py-0 text-xs font-normal text-[#0F1912] hover:bg-[#E8EAE9]">
										{user.name}
										<button
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											className="ml-1 rounded-sm hover:bg-[#C1C4C2]"
											aria-label={`Remove ${user.name}`}>
											<X className="h-3 w-3 cursor-pointer" />
										</button>
									</Badge>
								))}
							</div>
						</div>
					</div>

					{showWarning && (
						<div className="rounded-lg bg-[#F0FCF2] p-4 text-[#005522]">
							<div className="flex items-start gap-3">
								<Info className="mt-0.5 h-5 w-5" />
								<div className="flex-1">
									<div className="text-sm">
										<p className="mb-2 font-semibold">{t("warning.title")}</p>
										<p className="mb-1 text-xs">{t("warning.subtitle")}</p>
										<p className="mb-1 text-xs">{t("warning.howItWorks")}</p>
										<ul className="ml-4 list-disc space-y-1 text-xs">
											<li>{t("warning.point1")}</li>
											<li>{t("warning.point2")}</li>
										</ul>
									</div>
								</div>
								<button
									onClick={() => setShowWarning(false)}
									className="text-[#5A615D] hover:text-[#0F1912]">
									<X className="h-4 w-4" />
								</button>
							</div>
						</div>
					)}

					<div>
						<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
							{t("access")}
						</h3>
						<div className="mb-4 grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="kundetilgang">{t("customerAccess")}</Label>
								<MultiSelectWithTags
									options={customerOptions}
									selected={selectedCustomers}
									onChange={setSelectedCustomers}
									placeholder={t("customerAccessPlaceholder", {
										count: selectedCustomers.length,
									})}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="kundekatalog">{t("catalog")}</Label>
								<MultiSelectWithTags
									options={catalogOptions}
									selected={selectedCatalogs}
									onChange={setSelectedCatalogs}
									placeholder={t("catalogPlaceholder")}
								/>
							</div>
						</div>
						<div className="mb-4 grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="standardTessLager">
									{t("standardWarehouse")}
								</Label>
								<Select
									value={selectedWarehouses[0] || ""}
									onValueChange={(value) => setSelectedWarehouses([value])}>
									<SelectTrigger className="border-[#C1C4C2]">
										<SelectValue
											placeholder={t("warehousePlaceholder", {
												count: selectedWarehouses.length,
											})}
										/>
									</SelectTrigger>
									<SelectContent>
										{warehouseOptions.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tessFirma">{t("tessCompany")}</Label>
								<RadioSelect
									options={tessFirmaOptions}
									value={selectedCompany}
									onChange={setSelectedCompany}
									placeholder={t("companyPlaceholder")}
									searchable={false}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-3 border-t border-[#E5E7E6] px-6 py-4">
					<Button
						variant="default"
						className="flex-1 bg-[#009640] hover:bg-[#008036]"
						onClick={handleConfirm}>
						{t("updateUsers", { count: selectedUsers.length })}
					</Button>
					<Button
						variant="outline"
						className="flex-1 border-[#C1C4C2]"
						onClick={() => onOpenChange(false)}>
						{t("close")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
