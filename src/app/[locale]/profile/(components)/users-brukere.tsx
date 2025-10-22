"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { AddUserModal } from "./add-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { useTranslations } from "next-intl";

interface User {
	id: string;
	name: string;
	role: "Administrator" | "Superbruker" | "Ansatt";
	customerAccess: string;
	catalogs: string;
	warehouses: string;
	company: string;
}

const UsersBrukere = () => {
	const t = useTranslations("UsersBrukere");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const users: User[] = [
		{
			id: "1",
			name: "Jon Jonsen",
			role: "Administrator",
			customerAccess: "Equinor, Bilfinger",
			catalogs: "Bilfinger nettopriser, TESS total sortiment",
			warehouses: "Mo i rana (primærlager) + 4 lager",
			company: "TESS Vest",
		},
		{
			id: "2",
			name: "Kari Haugen",
			role: "Superbruker",
			customerAccess: "Equinor, Bilfinger",
			catalogs: "2 kataloger",
			warehouses: "2 lager",
			company: "TESS Nord",
		},
		{
			id: "3",
			name: "Astrid Nordstrand",
			role: "Ansatt",
			customerAccess: "Equinor, Bilfinger",
			catalogs: "2 kataloger",
			warehouses: "2 lager",
			company: "TESS Øst",
		},
	];

	const filteredUsers = users.filter((user) =>
		user.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const toggleUserSelection = (userId: string) => {
		setSelectedUsers((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId],
		);
	};

	const toggleAllUsers = () => {
		if (selectedUsers.length === filteredUsers.length) {
			setSelectedUsers([]);
		} else {
			setSelectedUsers(filteredUsers.map((user) => user.id));
		}
	};

	const handleDeleteClick = (user: User) => {
		setUserToDelete(user);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (userToDelete) {
			// Handle user deletion logic here
			console.log("Deleting user:", userToDelete);
			setUserToDelete(null);
		}
	};

	const getRoleBadgeClass = (role: User["role"]) => {
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

						<Button
							variant="default"
							onClick={() => setIsAddUserModalOpen(true)}
							className="bg-[#009640] hover:bg-[#008036]">
							<Plus className="mr-2 h-4 w-4" /> {t("addUser")}
						</Button>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-y border-[#C1C4C2] bg-[#F8F9F8]">
							<tr>
								<th className="w-12 px-4 py-3">
									<Checkbox
										checked={
											selectedUsers.length === filteredUsers.length &&
											filteredUsers.length > 0
										}
										onCheckedChange={toggleAllUsers}
									/>
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.name")}
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.role")}
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.customerAccess")}
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.catalog")}
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.warehouse")}
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.company")}
								</th>
								<th className="w-16 px-4 py-3 text-left text-sm font-medium text-[#0F1912]">
									{t("columns.action")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[#E5E7E6]">
							{filteredUsers.map((user) => (
								<tr
									key={user.id}
									className="hover:bg-gray-50">
									<td className="px-4 py-4">
										<Checkbox
											checked={selectedUsers.includes(user.id)}
											onCheckedChange={() => toggleUserSelection(user.id)}
										/>
									</td>
									<td className="px-4 py-4 text-sm text-[#0F1912]">
										{user.name}
									</td>
									<td className="px-4 py-4">
										<span
											className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
											{user.role === "Administrator" && (
												<LockKeyhole size={12} />
											)}
											{user.role === "Superbruker" && <UserPen size={12} />}
											{user.role === "Ansatt" && <Eye size={12} />}
											{user.role}
										</span>
									</td>
									<td className="px-4 py-4 text-sm text-[#5A615D]">
										{user.customerAccess}
									</td>
									<td className="px-4 py-4 text-sm text-[#5A615D]">
										{user.catalogs}
									</td>
									<td className="px-4 py-4 text-sm text-[#5A615D]">
										{user.warehouses}
									</td>
									<td className="px-4 py-4 text-sm text-[#5A615D]">
										{user.company}
									</td>
									<td className="px-4 py-4">
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
												<DropdownMenuItem>
													<Eye className="mr-2 h-4 w-4" />
													{t("actions.viewDetails")}
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Edit className="mr-2 h-4 w-4" />
													{t("actions.editUser")}
												</DropdownMenuItem>
												<DropdownMenuItem 
													className="text-red-600"
													onClick={() => handleDeleteClick(user)}>
													<Trash2 className="mr-2 h-4 w-4" />
													{t("actions.deleteUser")}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="border-t border-[#C1C4C2] px-6 py-4">
					<p className="text-right text-sm text-[#5A615D]">
						{t("totalUsers")}:{" "}
						<span className="font-medium">{filteredUsers.length}</span>
					</p>
				</div>
			</div>

			<AddUserModal
				open={isAddUserModalOpen}
				onOpenChange={setIsAddUserModalOpen}
			/>

			<DeleteUserModal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				onConfirm={handleDeleteConfirm}
				userName={userToDelete?.name}
			/>
		</div>
	);
};

export default UsersBrukere;
