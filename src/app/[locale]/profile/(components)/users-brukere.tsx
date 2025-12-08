"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	useGetEditableUsers,
	useSearchEditableUsers,
} from "@/hooks/useGetEditableUsers";
import { useUpdateUserRelations } from "@/hooks/useUpdateUserRelations";
import { User, UpdateUserRelationsPayload } from "@/types/user.types";
import type { AxiosError } from "axios";
import {
	Plus,
	Search,
	MoreHorizontal,
	Eye,
	Edit,
	Trash2,
	LockKeyhole,
	UserPen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import {
	BulkEditConfirmationModal,
	BulkEditChanges,
} from "./bulk-edit-confirmation-modal";
import { ConfirmChangesModal } from "./confirm-changes-modal";
import { ViewUserModal } from "./view-user-modal";

type UserRow = {
	orderId: string;
	user: User;
};

const UsersBrukere = () => {
	const t = useTranslations("UsersBrukere");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [userToView, setUserToView] = useState<User | null>(null);
	const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
	const [isConfirmChangesModalOpen, setIsConfirmChangesModalOpen] =
		useState(false);
	const [pendingBulkChanges, setPendingBulkChanges] =
		useState<BulkEditChanges | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const tBulk = useTranslations("BulkEditConfirmationModal");
	const { mutateAsync: updateUserRelations } = useUpdateUserRelations();

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);

		return () => {
			clearTimeout(handler);
		};
	}, [searchQuery]);

	const isSearching = debouncedSearch.trim().length > 0;

	const {
		users: editableUsers,
		total: editableTotal,
		totalPages: editableTotalPages,
		isLoading: isLoadingEditable,
	} = useGetEditableUsers(currentPage, pageSize, !isSearching);

	const {
		users: searchedUsers,
		total: searchedTotal,
		totalPages: searchedTotalPages,
		isLoading: isLoadingSearched,
	} = useSearchEditableUsers(
		currentPage,
		pageSize,
		debouncedSearch,
		isSearching,
	);

	const users = isSearching ? searchedUsers : editableUsers;
	const total = isSearching ? searchedTotal : editableTotal;
	const totalPages = isSearching ? searchedTotalPages : editableTotalPages;
	const isLoading = isSearching ? isLoadingSearched : isLoadingEditable;

	const tableData: UserRow[] = useMemo(
		() =>
			users.map((user) => ({
				orderId: user.email,
				user,
			})),
		[users],
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch]);

	const toggleUserSelection = (email: string) => {
		setSelectedUsers((prev) =>
			prev.includes(email)
				? prev.filter((id) => id !== email)
				: [...prev, email],
		);
	};

	const toggleAllUsersOnPage = () => {
		const pageEmails = users.map((user) => user.email);
		const allSelectedOnPage = pageEmails.every((email) =>
			selectedUsers.includes(email),
		);

		if (allSelectedOnPage) {
			setSelectedUsers((prev) =>
				prev.filter((email) => !pageEmails.includes(email)),
			);
		} else {
			setSelectedUsers((prev) => Array.from(new Set([...prev, ...pageEmails])));
		}
	};

	const handleDeleteClick = (user: User) => {
		setUserToDelete(user);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (userToDelete) {
			setUserToDelete(null);
		}
	};

	const handleViewClick = (user: User) => {
		setUserToView(user);
		setIsViewModalOpen(true);
	};

	const handleEditClick = (user: User) => {};

	const handleBulkEditClick = (user?: User) => {
		if (user) {
			setSelectedUsers((prev) =>
				prev.includes(user.email) ? prev : [...prev, user.email],
			);
		}

		setIsBulkEditModalOpen(true);
	};

	const handleBulkEditConfirm = (changes: BulkEditChanges) => {
		setPendingBulkChanges(changes);
		setIsBulkEditModalOpen(false);
		setIsConfirmChangesModalOpen(true);
	};

	const handleFinalConfirm = async () => {
		if (!pendingBulkChanges) return;

		const warehousesPayload: UpdateUserRelationsPayload["warehouses"] = [
			{
				warehouseNumber: pendingBulkChanges.warehouses?.[0] ?? "",
				companyNumber: pendingBulkChanges.company || "",
				isDefault: true,
			},
			{
				warehouseNumber: pendingBulkChanges.warehouses?.[0] ?? "",
				companyNumber: pendingBulkChanges.company || "",
			},
		];

		const usersToUpdate = users.filter((u) => selectedUsers.includes(u.email));

		try {
			await Promise.all(
				usersToUpdate.map((user) =>
					updateUserRelations({
						userId: user.userId,
						assortments: pendingBulkChanges.catalogs ?? [],
						customers: pendingBulkChanges.customerAccess ?? [],
						warehouses: warehousesPayload,
					}),
				),
			);

			setPendingBulkChanges(null);
			setSelectedUsers([]);

			toast(tBulk("successUpdatingUsers"), {
				type: "success",
				position: "bottom-right",
				autoClose: 2000,
			});
		} catch (error) {
			console.error("Failed to bulk update user relations:", error);
			let message = tBulk("errorUpdatingUsers");

			if (typeof error === "object" && error !== null && "response" in error) {
				const err = error as AxiosError<{ error?: string }>;
				message = err.response?.data?.error ?? message;
			}

			toast(message, {
				type: "error",
				position: "bottom-right",
				autoClose: 2000,
			});
		}
	};

	const getRoleBadgeClass = (role: string) => {
		switch (role) {
			case "Administrator":
				return "bg-[#DCF7E0] text-[#005522] ";
			case "Superbruker":
				return "bg-[#E5EDFF] text-[#42389D] ";
			case "Ansatt":
				return "bg-[#E8EAE9] text-[#2D3530] ";
			default:
				return "";
		}
	};

	const columns: Column<UserRow>[] = useMemo(
		() => [
			{
				key: "select",
				header: (
					<Checkbox
						checked={
							users.length > 0 &&
							users.every((user) => selectedUsers.includes(user.email))
						}
						onCheckedChange={toggleAllUsersOnPage}
					/>
				),
				cell: (row) => (
					<Checkbox
						checked={selectedUsers.includes(row.user.email)}
						onCheckedChange={() => toggleUserSelection(row.user.email)}
					/>
				),
			},
			{
				key: "name",
				header: t("columns.name"),
				cell: (row) =>
					`${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.trim(),
			},
			{
				key: "role",
				header: t("columns.role"),
				cell: (row) => (
					<span
						className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${getRoleBadgeClass(row.user.role)}`}>
						{row.user.role === "admin" && <LockKeyhole size={12} />}
						{row.user.role === "superuser" && <UserPen size={12} />}
						{row.user.role === "user" && <Eye size={12} />}
						{row.user.role}
					</span>
				),
			},
			{
				key: "customerAccess",
				header: t("columns.customerAccess"),
				cell: (row) => row.user.customerAccess.join(", "),
			},
			{
				key: "catalog",
				header: t("columns.catalog"),
				cell: (row) => row.user.catalog.join(", "),
			},
			{
				key: "warehouse",
				header: t("columns.warehouse"),
				cell: (row) => row.user.warehouse.join(", "),
			},
			{
				key: "company",
				header: t("columns.company"),
				cell: (row) => row.user.company?.join(", ") ?? "-",
			},
			{
				key: "action",
				header: t("columns.action"),
				cell: (row) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleViewClick(row.user)}>
								<Eye className="mr-2 h-4 w-4" />
								{t("actions.viewDetails")}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleBulkEditClick(row.user)}>
								<Edit className="mr-2 h-4 w-4" />
								{t("actions.editUser")}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600"
								onClick={() => handleDeleteClick(row.user)}>
								<Trash2 className="mr-2 h-4 w-4" />
								{t("actions.deleteUser")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[
			handleBulkEditClick,
			handleDeleteClick,
			handleViewClick,
			users,
			selectedUsers,
			t,
		],
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<h1 className="text-2xl font-semibold">{t("title")}</h1>
				<p className="ml-4 text-[#5A615D]">{t("subtitle")}</p>
			</div>
			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="space-y-6 p-6">
					<div className="flex justify-between">
						<div className="relative flex w-full max-w-[480px]">
							<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#5A615D]" />
							<Input
								placeholder={t("searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="font-sm h-10 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-12 text-base text-[#5A615D]"
							/>
						</div>

						<div className="flex gap-3">
							<Button
								variant="default"
								onClick={() => setIsAddUserModalOpen(true)}
								className="bg-[#009640] hover:bg-[#008036]">
								<Plus className="mr-2 h-4 w-4" /> {t("addUser")}
							</Button>
						</div>
					</div>
				</div>

				<DataTable<UserRow>
					data={tableData}
					columns={columns}
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={total}
					itemsPerPage={pageSize}
					onPageChange={(page) => setCurrentPage(page)}
					isLoading={isLoading}
					selectedIds={selectedUsers}
					selectedRowBgClass="bg-[#E6F7EA]"
					className="border-t border-[#C1C4C2]"
				/>
			</div>

			<ViewUserModal
				open={isViewModalOpen}
				onOpenChange={setIsViewModalOpen}
				user={userToView}
				onEdit={() => {
					if (userToView) {
						handleEditClick(userToView);
					}
				}}
				onDelete={() => {
					if (userToView) {
						handleDeleteClick(userToView);
					}
				}}
			/>

			<BulkEditConfirmationModal
				open={isBulkEditModalOpen}
				onOpenChange={setIsBulkEditModalOpen}
				selectedUsers={users.filter((u) => selectedUsers.includes(u.email))}
				onConfirm={handleBulkEditConfirm}
				removeUser={(user) =>
					setSelectedUsers((prev) => prev.filter((u) => u !== user.email))
				}
			/>

			<ConfirmChangesModal
				open={isConfirmChangesModalOpen}
				onOpenChange={setIsConfirmChangesModalOpen}
				onConfirm={handleFinalConfirm}
				userCount={selectedUsers.length}
			/>
		</div>
	);
};

export default UsersBrukere;
