"use client";

import { useEffect, useMemo, useState } from "react";

import { BudgetProgress } from "@/components/ui/budget-progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
	Modal,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { USER_ROLES } from "@/constants/userRoles";
import { useActiveBudgetsByUser } from "@/hooks/useBudget";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import {
	useGetEditableUsers,
	useSearchEditableUsers,
} from "@/hooks/useGetEditableUsers";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useUpdateUserRelations } from "@/hooks/useUpdateUserRelations";
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole";
import { isTessEmployeeEmail } from "@/lib/user";
import type { EditableUserFilters } from "@/services/user.service";
import { User, BulkEditChanges } from "@/types/user.types";
import type { AxiosError } from "axios";
import {
	Search,
	MoreHorizontal,
	Eye,
	Edit,
	Trash2,
	LockKeyhole,
	UserPen,
	Wallet,
	Loader2,
	ChevronDown,
	Columns3,
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { AddContactPopover } from "./add-contact-popover";
import { AddUserModal } from "./add-user-modal";
import { BulkEditConfirmationModal } from "./bulk-edit-confirmation-modal";
import { ConfirmChangesModal } from "./confirm-changes-modal";
import { SetBudgetModal } from "./set-budget-modal";
import { UserAdminColumnFilter } from "./user-admin-column-filter";
import { ViewUserModal } from "./view-user-modal";

type UserRow = {
	orderId: string;
	user: User;
};

type ToggleableColumnKey =
	| "role"
	| "customerAccess"
	| "catalog"
	| "warehouse"
	| "company"
	| "contacts"
	| "budget"
	| "createdAt";

const TOGGLEABLE_COLUMNS: ToggleableColumnKey[] = [
	"role",
	"customerAccess",
	"catalog",
	"warehouse",
	"company",
	"contacts",
	"budget",
	"createdAt",
];

const formatShortDate = (iso: string | null | undefined): string => {
	if (!iso) return "—";
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
	if (!match) return iso;
	const [, y, m, d] = match;
	return `${d}.${m}.${y.slice(2)}`;
};

const COLUMN_VISIBILITY_STORAGE_KEY = "users-brukere.visibleColumns";

const readStoredVisibleColumns = (): ToggleableColumnKey[] | null => {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return null;
		const allowed = new Set<ToggleableColumnKey>(TOGGLEABLE_COLUMNS);
		const stored = parsed.filter(
			(k): k is ToggleableColumnKey =>
				typeof k === "string" && allowed.has(k as ToggleableColumnKey),
		);
		const storedSet = new Set(stored);
		const missingDefaults = TOGGLEABLE_COLUMNS.filter((k) => !storedSet.has(k));
		return [...stored, ...missingDefaults];
	} catch {
		return null;
	}
};

const UsersBrukere = () => {
	const t = useTranslations("UsersBrukere");
	const tBulk = useTranslations("BulkEditConfirmationModal");
	const { mutateAsync: updateUserRelations } = useUpdateUserRelations();
	const { mutateAsync: updateUserRoleMutate } = useUpdateUserRole();
	const { mutateAsync: deleteUserMutate, isPending: isDeletingUser } =
		useDeleteUser();

	const { data: profile } = usePunchoutProfile();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [deleteBlockers, setDeleteBlockers] = useState<string[] | null>(null);
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [userToView, setUserToView] = useState<User | null>(null);
	const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
	const [isConfirmChangesModalOpen, setIsConfirmChangesModalOpen] =
		useState(false);
	const [pendingBulkChanges, setPendingBulkChanges] =
		useState<BulkEditChanges | null>(null);
	const [isSetBudgetModalOpen, setIsSetBudgetModalOpen] = useState(false);
	const [userForBudget, setUserForBudget] = useState<User | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const [visibleColumns, setVisibleColumns] =
		useState<ToggleableColumnKey[]>(TOGGLEABLE_COLUMNS);

	const [columnFilters, setColumnFilters] = useState<EditableUserFilters>({});
	const [sortCreated, setSortCreated] = useState<
		"newest" | "oldest" | undefined
	>(undefined);

	const filtersForRequest = useMemo<EditableUserFilters>(
		() => ({
			customerNumbers: columnFilters.customerNumbers,
			assortmentNumbers: columnFilters.assortmentNumbers,
			warehouseIds: columnFilters.warehouseIds,
			companyNumbers: columnFilters.companyNumbers,
			roles: columnFilters.roles,
			sortCreated,
		}),
		[columnFilters, sortCreated],
	);

	const toggleCreatedSort = () => {
		setSortCreated((prev) =>
			prev === undefined ? "newest" : prev === "newest" ? "oldest" : undefined,
		);
		setCurrentPage(1);
	};

	const setFilterValues = (
		key: keyof EditableUserFilters,
		values: string[],
	) => {
		setColumnFilters((prev) => ({
			...prev,
			[key]: values.length > 0 ? values : undefined,
		}));
		setCurrentPage(1);
	};

	useEffect(() => {
		const stored = readStoredVisibleColumns();
		if (stored) setVisibleColumns(stored);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(
			COLUMN_VISIBILITY_STORAGE_KEY,
			JSON.stringify(visibleColumns),
		);
	}, [visibleColumns]);

	const toggleColumn = (key: ToggleableColumnKey) => {
		setVisibleColumns((prev) =>
			prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
		);
	};

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
	} = useGetEditableUsers(
		currentPage,
		pageSize,
		!isSearching,
		undefined,
		filtersForRequest,
	);

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
		filtersForRequest,
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

	const visibleUserIds = useMemo(
		() => users.map((u) => u.userId).filter((id): id is number => id != null),
		[users],
	);
	const { byUserId: budgetsByUserId } = useActiveBudgetsByUser(visibleUserIds);

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
		setDeleteBlockers(null);
		setIsDeleteModalOpen(true);
	};

	const tDelete = useTranslations("UsersBrukere.deleteDialog");

	const handleDeleteConfirm = async () => {
		if (!userToDelete) return;
		try {
			await deleteUserMutate(userToDelete.userId);
			toast(tDelete("success"), { type: "success" });
			setIsDeleteModalOpen(false);
			setUserToDelete(null);
			setDeleteBlockers(null);
		} catch (error) {
			const err = error as AxiosError<{
				error?: string;
				blockers?: string[];
			}>;
			const data = err.response?.data;
			if (err.response?.status === 409 && data?.blockers?.length) {
				setDeleteBlockers(data.blockers);
				return;
			}
			toast(data?.error ?? tDelete("error"), { type: "error" });
		}
	};

	const handleViewClick = (user: User) => {
		setUserToView(user);
		setIsViewModalOpen(true);
	};

	const handleSetBudgetClick = (user: User) => {
		setUserForBudget(user);
		setIsSetBudgetModalOpen(true);
	};

	const canSetBudget =
		profile?.role === USER_ROLES.SUPERUSER ||
		profile?.role === USER_ROLES.ADMIN;

	const isAdmin = profile?.role === USER_ROLES.ADMIN;
	const isEmployee = profile?.role === USER_ROLES.EMPLOYEE;
	const canEditUser = (target: User) =>
		isAdmin ||
		(isEmployee &&
			!!profile?.userId &&
			(target.contactPerson ?? []).some((c) => c.userId === profile.userId));
	const canDeleteUser = () => isAdmin;

	const handleEditClick = (user: User) => {
		handleBulkEditClick(user);
	};

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

	const handleFinalConfirm = async (changes: BulkEditChanges | null) => {
		if (!changes) return;

		const usersToUpdate = users.filter((u) => selectedUsers.includes(u.email));
		console.log(changes, "changes");
		try {
			await updateUserRelations({
				userId: usersToUpdate.map((u) => u.userId),
				assortments: changes.catalogs ?? [],
				customers: changes.customerAccess ?? [],
				warehouses:
					changes.warehouses?.map((warehouse) => ({
						warehouseNumber: warehouse.warehouseNumber,
						companyNumber: warehouse.companyNumber ?? "",
						isDefault: false,
					})) ?? [],
				companies: changes.companies ?? [],
			});
			if (changes.role) {
				await Promise.all(
					usersToUpdate.map((u) =>
						updateUserRoleMutate({ userId: u.userId, role: changes.role! }),
					),
				);
			}
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

	const renderTruncatedList = (
		items: { name?: string; number?: string }[] | null | undefined,
		countTranslationKey: string,
		user: User,
	) => {
		const validItems = (items ?? [])
			.map((x) => x?.name || x?.number)
			.filter(Boolean) as string[];

		if (validItems.length === 0) {
			return "-";
		}

		const maxDisplay = 5;
		const displayItems = validItems.slice(0, maxDisplay);
		const hasMore = validItems.length > maxDisplay;

		if (hasMore) {
			const countText = t(`counts.${countTranslationKey}`, {
				count: validItems.length,
			});

			return (
				<HoverCard>
					<HoverCardTrigger asChild>
						<span
							className="cursor-pointer hover:underline"
							onClick={(e) => {
								e.stopPropagation();
								handleViewClick(user);
							}}>
							{countText}
						</span>
					</HoverCardTrigger>
					<HoverCardContent className="w-auto max-w-sm min-w-[200px]">
						<div className="flex flex-col gap-1.5">
							{displayItems.map((item, idx) => (
								<div
									key={idx}
									className="text-sm leading-relaxed">
									{item}
								</div>
							))}
							<div className="text-sm text-gray-500">...</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			);
		}

		const joined = displayItems.join(", ");
		return (
			<span
				className="block max-w-[140px] truncate"
				title={joined}>
				{joined}
			</span>
		);
	};

	const columns: Column<UserRow>[] = useMemo(() => {
		const isVisible = (key: ToggleableColumnKey) =>
			visibleColumns.includes(key);
		const allColumns: (Column<UserRow> | null)[] = [
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
				thClassName:
					"sticky left-0 z-20 bg-[#F8F9F8] w-10 min-w-[40px]",
				tdClassName:
					"sticky left-0 z-10 bg-white group-hover:bg-[#F0FCF2] w-10 min-w-[40px]",
			},
			{
				key: "name",
				header: t("columns.name"),
				cell: (row) => {
					const fullName =
						`${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.trim();
					const email = row.user.email ?? "";
					return (
						<div
							className="flex max-w-[180px] flex-col"
							title={email ? `${fullName} — ${email}` : fullName}>
							<span className="truncate text-[14px] font-medium text-[#0F1912]">
								{fullName || "—"}
							</span>
							{email && (
								<span className="truncate text-[12px] font-normal text-[#5A615D]">
									{email}
								</span>
							)}
						</div>
					);
				},
			},
			isVisible("role")
				? {
						key: "role",
						header: (
							<span className="inline-flex items-center">
								{t("columns.role")}
								<UserAdminColumnFilter
									type="role"
									label={t("columns.role")}
									selected={columnFilters.roles ?? []}
									onChange={(values) => setFilterValues("roles", values)}
								/>
							</span>
						),
						cell: (row) => (
							<span
								className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${getRoleBadgeClass(row.user.role)}`}>
								{row.user.role === USER_ROLES.ADMIN && (
									<LockKeyhole size={12} />
								)}
								{row.user.role === USER_ROLES.SUPERUSER && (
									<UserPen size={12} />
								)}
								{row.user.role === USER_ROLES.USER && <Eye size={12} />}
								{row.user.role}
							</span>
						),
					}
				: null,
			isVisible("customerAccess")
				? {
						key: "customerAccess",
						header: (
							<span className="inline-flex items-center">
								{t("columns.customerAccess")}
								<UserAdminColumnFilter
									type="customer"
									label={t("columns.customerAccess")}
									selected={columnFilters.customerNumbers ?? []}
									onChange={(values) =>
										setFilterValues("customerNumbers", values)
									}
								/>
							</span>
						),
						cell: (row) =>
							renderTruncatedList(
								row.user.customerAccess,
								"customers",
								row.user,
							),
					}
				: null,
			isVisible("catalog")
				? {
						key: "catalog",
						header: (
							<span className="inline-flex items-center">
								{t("columns.catalog")}
								<UserAdminColumnFilter
									type="catalog"
									label={t("columns.catalog")}
									selected={columnFilters.assortmentNumbers ?? []}
									onChange={(values) =>
										setFilterValues("assortmentNumbers", values)
									}
								/>
							</span>
						),
						cell: (row) =>
							renderTruncatedList(row.user.catalog, "catalogs", row.user),
					}
				: null,
			isVisible("warehouse")
				? {
						key: "warehouse",
						header: (
							<span className="inline-flex items-center">
								{t("columns.warehouse")}
								<UserAdminColumnFilter
									type="warehouse"
									label={t("columns.warehouse")}
									selected={columnFilters.warehouseIds ?? []}
									onChange={(values) =>
										setFilterValues("warehouseIds", values)
									}
								/>
							</span>
						),
						cell: (row) => {
							const dw = row.user.defaultWarehouse;
							return dw?.name || dw?.number || "—";
						},
					}
				: null,
			isVisible("company")
				? {
						key: "company",
						header: (
							<span className="inline-flex items-center">
								{t("columns.company")}
								<UserAdminColumnFilter
									type="company"
									label={t("columns.company")}
									selected={columnFilters.companyNumbers ?? []}
									onChange={(values) =>
										setFilterValues("companyNumbers", values)
									}
								/>
							</span>
						),
						cell: (row) =>
							renderTruncatedList(row.user.company, "companies", row.user),
					}
				: null,
			isVisible("contacts")
				? {
						key: "contacts",
						header: isTessEmployeeEmail(profile?.email)
							? t("columns.taggedBy")
							: t("columns.contacts"),
						cell: (row) =>
							renderTruncatedList(
								row.user.contactPerson?.map((c) => ({
									name: c.name,
									number: c.email,
								})),
								"contacts",
								row.user,
							),
					}
				: null,
			isVisible("budget")
				? {
						key: "budget",
						header: t("columns.budget"),
						cell: (row) => {
							const budget = budgetsByUserId.get(row.user.userId);
							return (
								<BudgetProgress
									annualAmount={budget?.annualAmount}
									used={budget?.used}
								/>
							);
						},
					}
				: null,
			isVisible("createdAt")
				? {
						key: "createdAt",
						header: (
							<button
								type="button"
								onClick={toggleCreatedSort}
								className="inline-flex cursor-pointer items-center gap-1 hover:text-[#0F1912]">
								<span>{t("columns.createdAt")}</span>
								{sortCreated === "newest" ? (
									<ArrowDown className="h-3 w-3" />
								) : sortCreated === "oldest" ? (
									<ArrowUp className="h-3 w-3" />
								) : (
									<ArrowUpDown className="h-3 w-3 text-[#8A8F8C]" />
								)}
							</button>
						),
						cell: (row) => (
							<span
								className="whitespace-nowrap"
								title={row.user.creationDate ?? undefined}>
								{formatShortDate(row.user.creationDate)}
							</span>
						),
					}
				: null,
			{
				key: "action",
				header: t("columns.action"),
				thClassName:
					"sticky right-0 z-20 bg-[#F8F9F8] shadow-[inset_1px_0_0_0_#C1C4C2]",
				tdClassName:
					"sticky right-0 z-10 bg-white group-hover:bg-[#F0FCF2] shadow-[inset_1px_0_0_0_#C1C4C2]",
				cell: (row) => (
					<div className="flex items-center gap-1">
						{isAdmin && (
							<AddContactPopover
								targetUserId={row.user.userId}
								existingContactIds={(row.user.contactPerson ?? []).map(
									(c) => c.userId,
								)}
								trigger={
									<Button
										variant="ghost"
										size="sm"
										aria-label={t("actions.addContact")}
										className="h-8 w-8 p-0">
										<UserPlus className="h-4 w-4" />
									</Button>
								}
							/>
						)}
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
							{canSetBudget && (
								<DropdownMenuItem
									onClick={() => handleSetBudgetClick(row.user)}>
									<Wallet className="mr-2 h-4 w-4" />
									{t("actions.setBudget")}
								</DropdownMenuItem>
							)}
							{canEditUser(row.user) && (
								<DropdownMenuItem onClick={() => handleBulkEditClick(row.user)}>
									<Edit className="mr-2 h-4 w-4" />
									{t("actions.editUser")}
								</DropdownMenuItem>
							)}
							{canDeleteUser() && (
								<DropdownMenuItem
									className="text-red-600"
									onClick={() => handleDeleteClick(row.user)}>
									<Trash2 className="mr-2 h-4 w-4" />
									{t("actions.deleteUser")}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
					</div>
				),
			},
		];
		return allColumns.filter((c): c is Column<UserRow> => c !== null);
	}, [
		handleBulkEditClick,
		handleDeleteClick,
		handleViewClick,
		handleSetBudgetClick,
		canSetBudget,
		isAdmin,
		isEmployee,
		profile?.userId,
		users,
		selectedUsers,
		budgetsByUserId,
		profile?.email,
		visibleColumns,
		columnFilters,
		sortCreated,
		t,
	]);

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<h1 className="text-2xl font-semibold">{t("title")}</h1>
				<p className="ml-4 text-base text-[#5A615D]">{t("subtitle")}</p>
			</div>
			<div className="rounded-lg border border-[#C1C4C2] bg-white">
				<div className="space-y-4 p-4">
					<div className="flex justify-between">
						<div className="relative flex w-full max-w-[480px]">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A615D]" />
							<Input
								placeholder={t("searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="font-sm h-9 flex-1 rounded-md border border-[#8A8F8C] bg-[#F8F9F8] pr-24 pl-10 text-sm text-[#5A615D]"
							/>
						</div>

						<div className="flex gap-3">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="h-9 gap-2 border-[#C1C4C2] bg-white text-[#0F1912]">
										<Columns3 className="h-4 w-4" />
										{t("customizeColumns")}
										<ChevronDown className="h-4 w-4 text-[#5A615D]" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-[240px] p-2">
									{TOGGLEABLE_COLUMNS.map((key) => {
										const label =
											key === "contacts" && isTessEmployeeEmail(profile?.email)
												? t("columns.taggedBy")
												: t(`columns.${key}`);
										const checked = visibleColumns.includes(key);
										return (
											<DropdownMenuItem
												key={key}
												onSelect={(e) => {
													e.preventDefault();
													toggleColumn(key);
												}}
												className="cursor-pointer">
												<Checkbox
													checked={checked}
													className="mr-2"
												/>
												<span className="text-sm text-[#0F1912]">{label}</span>
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								variant="greenSolid"
								className="h-9"
								onClick={() => setIsAddUserModalOpen(true)}>
								+ {t("addUser")}
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
					compact
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
				canEditRole={isAdmin}
			/>

			<ConfirmChangesModal
				open={isConfirmChangesModalOpen}
				onOpenChange={setIsConfirmChangesModalOpen}
				onConfirm={handleFinalConfirm}
				userCount={selectedUsers.length}
				bulkChanges={pendingBulkChanges}
			/>

			<SetBudgetModal
				open={isSetBudgetModalOpen}
				onOpenChange={setIsSetBudgetModalOpen}
				user={userForBudget}
			/>

			<AddUserModal
				open={isAddUserModalOpen}
				onOpenChange={setIsAddUserModalOpen}
			/>

			<Modal
				open={isDeleteModalOpen}
				onOpenChange={(open) => {
					if (isDeletingUser) return;
					setIsDeleteModalOpen(open);
					if (!open) {
						setUserToDelete(null);
						setDeleteBlockers(null);
					}
				}}>
				<ModalHeader>
					<ModalTitle>
						{deleteBlockers ? tDelete("blockedTitle") : tDelete("title")}
					</ModalTitle>
					{!deleteBlockers && userToDelete && (
						<ModalDescription>
							{tDelete("description", {
								name:
									`${userToDelete.firstName ?? ""} ${userToDelete.lastName ?? ""}`.trim() ||
									userToDelete.email,
							})}
						</ModalDescription>
					)}
				</ModalHeader>
				{deleteBlockers && deleteBlockers.length > 0 && (
					<div className="text-sm text-[#0F1912]">
						<p className="mb-2">{tDelete("blockedIntro")}</p>
						<ul className="list-disc space-y-1 pl-5">
							{deleteBlockers.map((b) => (
								<li key={b}>{b}</li>
							))}
						</ul>
					</div>
				)}
				<ModalFooter className="gap-2 pt-2">
					<Button
						variant="outline"
						disabled={isDeletingUser}
						onClick={() => {
							setIsDeleteModalOpen(false);
							setUserToDelete(null);
							setDeleteBlockers(null);
						}}>
						{tDelete("cancel")}
					</Button>
					{!deleteBlockers && (
						<Button
							className="bg-red-600 text-white hover:bg-red-700"
							disabled={isDeletingUser}
							onClick={handleDeleteConfirm}>
							{isDeletingUser ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{tDelete("deleting")}
								</>
							) : (
								tDelete("confirm")
							)}
						</Button>
					)}
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default UsersBrukere;
