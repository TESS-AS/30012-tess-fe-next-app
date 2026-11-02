"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteUserContact } from "@/hooks/useDeleteUserContact";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { isTessEmployeeEmail } from "@/lib/user";
import { User } from "@/types/user.types";
import { Loader2, SquarePen, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

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
	const { data: profile } = useGetProfileData();
	const { mutateAsync: deleteContact, isPending: isRemovingContact } =
		useDeleteUserContact();

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
									{(user.customerAccess ?? [])
										.map((x) => x?.name || x?.number)
										.filter(Boolean)
										.join(", ") || "-"}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">{t("catalog")}</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{(user.catalog ?? [])
										.map((x) => x?.name || x?.number)
										.filter(Boolean)
										.join(", ") || "-"}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">
									{t("standardWarehouse")}
								</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{(user.warehouse ?? [])
										.map((x) => x?.name || x?.number)
										.filter(Boolean)
										.join(", ") || "-"}
								</p>
							</div>
							<div>
								<p className="mb-1 text-sm text-[#5A615D]">
									{t("tessCompany")}
								</p>
								<p className="text-sm font-medium text-[#0F1912]">
									{(user.company ?? [])
										.map((x) => x?.name || x?.number)
										.filter(Boolean)
										.join(", ") || "-"}
								</p>
							</div>
						</div>
					</div>

					<div>
						<h3 className="mb-4 text-base font-semibold text-[#0F1912]">
							{isTessEmployeeEmail(profile?.email)
								? t("taggedBy")
								: t("contacts")}
						</h3>
						{(user.contacts ?? []).length === 0 ? (
							<p className="text-sm text-[#5A615D]">{t("noContacts")}</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{(user.contacts ?? []).map((c) => (
									<span
										key={c.userId}
										className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-3 py-1 text-sm text-[#0F1912]">
										{c.name || c.email}
										<button
											type="button"
											aria-label={t("removeContact")}
											disabled={isRemovingContact}
											className="text-[#5A615D] hover:text-[#0F1912] disabled:opacity-50"
											onClick={async () => {
												try {
													await deleteContact({
														userId: user.userId,
														contactUserId: c.userId,
													});
													toast(t("contactRemoved"), { type: "success" });
												} catch (err) {
													console.error("Failed to remove contact", err);
													toast(t("contactRemoveError"), { type: "error" });
												}
											}}>
											{isRemovingContact ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<X className="h-3.5 w-3.5" />
											)}
										</button>
									</span>
								))}
							</div>
						)}
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
						variant="greenSolid"
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
