"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user.types";
import { SquarePen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ViewUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
	onEdit?: () => void;
	onDelete?: () => void;
}

export function ViewUserModal({
	open,
	onOpenChange,
	user,
	onEdit,
	onDelete,
}: ViewUserModalProps) {
	const t = useTranslations("ViewUserModal");

	if (!user) return null;

	const getRoleDescription = (role: string) => {
		switch (role) {
			case "Administrator":
				return t("roleDescriptions.administrator");
			case "Superbruker":
				return t("roleDescriptions.superbruker");
			case "Ansatt":
				return t("roleDescriptions.ansatt");
			default:
				return "";
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[700px] p-0">
				<DialogHeader className="border-b border-[#E5E7E6] px-6 py-4">
					<div className="flex items-start justify-between">
						<div>
							<DialogTitle className="text-xl font-semibold text-[#0F1912]">
								{user.firstName + " " + user.lastName}
							</DialogTitle>
							<p className="mt-1 text-sm text-[#5A615D] capitalize">
								{user.role}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 px-6 py-2">
					<div>
						<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
							{t("contactInfo")}
						</h3>
						<div className="grid grid-cols-2 gap-6">
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("firstName")}</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.firstName}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("lastName")}</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.lastName}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("email")}</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.email}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("title")}</p>
								<p className="text-sm font-medium text-[#0F1912] capitalize">
									{user.role}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("phone")}</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user?.phone ?? ""}
								</p>
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
							{t("access")}
						</h3>
						<div className="grid grid-cols-2 gap-6">
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">
									{t("customerAccess")}
								</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.customerAccess.join(", ") || "-"}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("catalog")}</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.catalog.join(", ") || "-"}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">
									{t("standardWarehouse")}
								</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.warehouse.join(", ") || "-"}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">
									{t("tessCompany")}
								</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{user.company.join(", ") || "-"}
								</p>
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
							{t("userRightsAndStatus")}
						</h3>
						<div>
							<p className="mb-1 text-sm text-[#5A615D]">{t("role")}</p>
							<p className="mb-2 text-sm font-semibold text-[#0F1912] capitalize">
								{user.role}
							</p>
							<p className="text-xs text-[#5A615D]">
								{getRoleDescription(user.role)}
							</p>
						</div>
					</div>
				</div>

				<div className="flex gap-3 border-t border-[#E5E7E6] px-6 py-4">
					<Button
						variant="default"
						className="bg-[#009640] hover:bg-[#008036]"
						onClick={() => {
							onOpenChange(false);
							onEdit?.();
						}}>
						<SquarePen />
						{t("edit")}
					</Button>
					<Button
						variant="destructive"
						className="bg-[#D32F2F] hover:bg-[#B71C1C]"
						onClick={() => {
							onOpenChange(false);
							onDelete?.();
						}}>
						<Trash2 />
						{t("delete")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
