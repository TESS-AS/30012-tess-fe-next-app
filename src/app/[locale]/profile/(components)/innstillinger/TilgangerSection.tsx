"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelectWithTags } from "@/components/ui/multi-select";
import { User } from "@/types/user.types";
import { UpdateUserRelationsPayload } from "@/types/user.types";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { AccessInfoBanner } from "./AccessInfoBanner";
import {
	INNSTILLINGER_CLASSES,
	PROFILE_ROLE,
	TILGANGER_PAGE_SIZE,
	type ProfileRoleKey,
} from "./constants";
import { ReadOnlyAccessField } from "./ReadOnlyAccessField";
import { useTilgangerForm } from "./useTilgangerForm";

const T_VIEW = "ViewUserModal";
const T_BULK = "BulkEditConfirmationModal";
const T_SETTINGS = "InnstillingerTab";

function formatReadOnlyValue(
	items: { name?: string; number?: string }[] | null | undefined,
): string {
	return (
		items
			?.map((x) => x?.name || x?.number)
			.filter(Boolean)
			.join(", ") || "-"
	);
}

export interface TilgangerSectionProps {
	isSavingAccess: boolean;
	roleKey: ProfileRoleKey;
	profileUserId: number | undefined;
	currentUser: User | null;
	isLoadingCurrentUser: boolean;
	superuserBannerDismissed: boolean;
	employeeBannerDismissed: boolean;
	onSuperuserBannerDismiss: () => void;
	onEmployeeBannerDismiss: () => void;
	onSaveAccess: (payload: UpdateUserRelationsPayload) => Promise<void>;
	onDirtyChange?: (dirty: boolean) => void;
}

export function TilgangerSection({
	roleKey,
	profileUserId,
	currentUser,
	isLoadingCurrentUser,
	superuserBannerDismissed,
	employeeBannerDismissed,
	onSuperuserBannerDismiss,
	onEmployeeBannerDismiss,
	onSaveAccess,
	isSavingAccess,
	onDirtyChange,
}: TilgangerSectionProps) {
	const t = useTranslations(T_VIEW);
	const tBulk = useTranslations(T_BULK);
	const tSettings = useTranslations(T_SETTINGS);

	const form = useTilgangerForm(currentUser);
	const {
		options,
		selected,
		state,
		listLengths,
		setSelectedCustomers,
		setSelectedCatalogs,
		setSelectedWarehouses,
		setSelectedCompanies,
		setCustomerSearch,
		setAssortmentSearch,
		setWarehouseSearch,
		setCompanySearch,
		setCustomerPage,
		setAssortmentPage,
		setWarehousePage,
		setCompanyPage,
		normalizeCustomerNumbers,
		normalizeAssortmentNumbers,
		normalizeCompanyNumbers,
		buildWarehousesPayload,
		isLoading: isLoadingOptions,
		isInitialized,
		isDirty,
		resetDirty,
	} = form;

	const isSaveDisabled =
		isSavingAccess || !isInitialized || !currentUser;

	const handleSaveAccess = async () => {
		if (!profileUserId || !isInitialized || !currentUser) return;
		await onSaveAccess({
			userId: [profileUserId],
			assortments: selected.catalogs.filter(Boolean),
			customers: selected.customers.filter(Boolean),
			warehouses: buildWarehousesPayload(),
			companies: selected.companies.filter(Boolean),
		});
		resetDirty();
	};

	const graySectionClass =
		roleKey === PROFILE_ROLE.CUSTOMER
			? `${INNSTILLINGER_CLASSES.cardMutedRoundedBottom} ${employeeBannerDismissed ? "rounded-t-lg" : ""}`
			: roleKey === PROFILE_ROLE.SUPERUSER
				? `${INNSTILLINGER_CLASSES.cardMutedRoundedBottom} ${superuserBannerDismissed ? "rounded-t-lg" : ""}`
				: "";

	return (
		<>
			<h2 className={INNSTILLINGER_CLASSES.heading}>{t("access")}</h2>

			{roleKey === PROFILE_ROLE.SUPERUSER && !superuserBannerDismissed && (
				<AccessInfoBanner
					title={tSettings("superuserBanner.title")}
					lines={[
						tSettings("superuserBanner.line1"),
						tSettings("superuserBanner.line2"),
					]}
					onDismiss={onSuperuserBannerDismiss}
				/>
			)}

			{roleKey === PROFILE_ROLE.CUSTOMER && !employeeBannerDismissed && (
				<AccessInfoBanner
					title={tSettings("employeeBanner.title")}
					lines={[tSettings("employeeBanner.line")]}
					onDismiss={onEmployeeBannerDismiss}
				/>
			)}

			{isLoadingCurrentUser ? (
				<p className={INNSTILLINGER_CLASSES.loading}>
					{tSettings("loadingAccess")}
				</p>
			) : roleKey === PROFILE_ROLE.CUSTOMER ? (
				<div className={graySectionClass}>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-4">
							<ReadOnlyAccessField
								label={tSettings("customerAccessLabel")}
								value={formatReadOnlyValue(currentUser?.customerAccess)}
							/>
							<ReadOnlyAccessField
								label={tBulk("standardWarehouse")}
								value={formatReadOnlyValue(currentUser?.warehouse)}
							/>
						</div>
						<div className="space-y-4">
							<ReadOnlyAccessField
								label={tSettings("catalogLabel")}
								value={formatReadOnlyValue(currentUser?.catalog)}
							/>
							<ReadOnlyAccessField
								label={tSettings("tessCompanyLabel")}
								value={formatReadOnlyValue(currentUser?.company)}
							/>
						</div>
					</div>
				</div>
			) : roleKey === PROFILE_ROLE.SUPERUSER ? (
				<div className={graySectionClass}>
					<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("standardWarehouse")}
							</Label>
							<MultiSelectWithTags
								options={options.warehouseOptions}
								selected={selected.warehouses}
								onChange={(value) => {
									setSelectedWarehouses(value);
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setWarehouseSearch(v);
									setWarehousePage(1);
								}}
								page={state.warehousePage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.warehousePage > 1
										? () => setWarehousePage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.warehouses >= TILGANGER_PAGE_SIZE
										? () => setWarehousePage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.warehousePage > 1}
								canNextPage={listLengths.warehouses >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("warehousePlaceholder", {
									count: selected.warehouses.length,
								})}
								searchPlaceholder={tBulk("warehouseSearchPlaceholder")}
							/>
						</div>
						<div className="space-y-4">
							<ReadOnlyAccessField
								label={tSettings("customerAccessLabel")}
								value={formatReadOnlyValue(currentUser?.customerAccess)}
							/>
							<ReadOnlyAccessField
								label={tSettings("tessCompanyLabel")}
								value={formatReadOnlyValue(currentUser?.company)}
							/>
							<ReadOnlyAccessField
								label={tSettings("catalogLabel")}
								value={formatReadOnlyValue(currentUser?.catalog)}
							/>
						</div>
					</div>
					<div className="flex justify-start">
						<Button
							type="button"
							variant="green"
							onClick={handleSaveAccess}
							disabled={isSaveDisabled}
							className="rounded-md px-6">
							{isSavingAccess && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{tSettings("saveChanges")}
						</Button>
					</div>
				</div>
			) : roleKey === PROFILE_ROLE.EMPLOYEE ? (
				<>
					<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("customerAccess")}
							</Label>
							<MultiSelectWithTags
								options={options.customerOptions}
								selected={selected.customers}
								onChange={(v) => {
									setSelectedCustomers(normalizeCustomerNumbers(v));
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setCustomerSearch(v);
									setCustomerPage(1);
								}}
								page={state.customerPage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.customerPage > 1
										? () => setCustomerPage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.customers >= TILGANGER_PAGE_SIZE
										? () => setCustomerPage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.customerPage > 1}
								canNextPage={listLengths.customers >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("customerAccessPlaceholder", {
									count: selected.customers.length,
								})}
								searchPlaceholder={tBulk("customerAccessSearchPlaceholder")}
							/>
						</div>
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("catalog")}
							</Label>
							<MultiSelectWithTags
								options={options.assortmentOptions}
								selected={selected.catalogs}
								onChange={(v) => {
									setSelectedCatalogs(normalizeAssortmentNumbers(v));
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setAssortmentSearch(v);
									setAssortmentPage(1);
								}}
								page={state.assortmentPage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.assortmentPage > 1
										? () => setAssortmentPage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.assortments >= TILGANGER_PAGE_SIZE
										? () => setAssortmentPage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.assortmentPage > 1}
								canNextPage={listLengths.assortments >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("catalogPlaceholder", {
									count: selected.catalogs.length,
								})}
								searchPlaceholder={tBulk("catalogSearchPlaceholder")}
							/>
						</div>
					</div>
					<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("standardWarehouse")}
							</Label>
							<MultiSelectWithTags
								options={options.warehouseOptions}
								selected={selected.warehouses}
								onChange={(value) => {
									setSelectedWarehouses(value);
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setWarehouseSearch(v);
									setWarehousePage(1);
								}}
								page={state.warehousePage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.warehousePage > 1
										? () => setWarehousePage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.warehouses >= TILGANGER_PAGE_SIZE
										? () => setWarehousePage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.warehousePage > 1}
								canNextPage={listLengths.warehouses >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("warehousePlaceholder", {
									count: selected.warehouses.length,
								})}
								searchPlaceholder={tBulk("warehouseSearchPlaceholder")}
							/>
						</div>
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("tessCompany")}
							</Label>
							<MultiSelectWithTags
								options={options.companyOptions}
								selected={selected.companies}
								onChange={(v) => {
									setSelectedCompanies(normalizeCompanyNumbers(v));
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setCompanySearch(v);
									setCompanyPage(1);
								}}
								page={state.companyPage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.companyPage > 1
										? () => setCompanyPage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.companies >= TILGANGER_PAGE_SIZE
										? () => setCompanyPage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.companyPage > 1}
								canNextPage={listLengths.companies >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("companyPlaceholder", {
									count: selected.companies.length,
								})}
								searchPlaceholder={tBulk("companySearchPlaceholder")}
							/>
						</div>
					</div>
					<div className="flex justify-start">
						<Button
							type="button"
							variant="green"
							onClick={handleSaveAccess}
							disabled={isSaveDisabled}
							className="rounded-md px-6">
							{isSavingAccess && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{tSettings("saveChanges")}
						</Button>
					</div>
				</>
			) : (
				<>
					<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("customerAccess")}
							</Label>
							<MultiSelectWithTags
								options={options.customerOptions}
								selected={selected.customers}
								onChange={(v) => {
									setSelectedCustomers(normalizeCustomerNumbers(v));
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setCustomerSearch(v);
									setCustomerPage(1);
								}}
								page={state.customerPage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.customerPage > 1
										? () => setCustomerPage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.customers >= TILGANGER_PAGE_SIZE
										? () => setCustomerPage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.customerPage > 1}
								canNextPage={listLengths.customers >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("customerAccessPlaceholder", {
									count: selected.customers.length,
								})}
								searchPlaceholder={tBulk("customerAccessSearchPlaceholder")}
							/>
						</div>
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("catalog")}
							</Label>
							<MultiSelectWithTags
								options={options.assortmentOptions}
								selected={selected.catalogs}
								onChange={(v) => {
									setSelectedCatalogs(normalizeAssortmentNumbers(v));
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setAssortmentSearch(v);
									setAssortmentPage(1);
								}}
								page={state.assortmentPage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.assortmentPage > 1
										? () => setAssortmentPage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.assortments >= TILGANGER_PAGE_SIZE
										? () => setAssortmentPage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.assortmentPage > 1}
								canNextPage={listLengths.assortments >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("catalogPlaceholder", {
									count: selected.catalogs.length,
								})}
								searchPlaceholder={tBulk("catalogSearchPlaceholder")}
							/>
						</div>
					</div>
					<div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("standardWarehouse")}
							</Label>
							<MultiSelectWithTags
								options={options.warehouseOptions}
								selected={selected.warehouses}
								onChange={(value) => {
									setSelectedWarehouses(value);
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setWarehouseSearch(v);
									setWarehousePage(1);
								}}
								page={state.warehousePage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.warehousePage > 1
										? () => setWarehousePage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.warehouses >= TILGANGER_PAGE_SIZE
										? () => setWarehousePage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.warehousePage > 1}
								canNextPage={listLengths.warehouses >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("warehousePlaceholder", {
									count: selected.warehouses.length,
								})}
								searchPlaceholder={tBulk("warehouseSearchPlaceholder")}
							/>
						</div>
						<div className="space-y-2">
							<Label className={INNSTILLINGER_CLASSES.labelDark}>
								{tBulk("tessCompany")}
							</Label>
							<MultiSelectWithTags
								options={options.companyOptions}
								selected={selected.companies}
								onChange={(v) => {
									setSelectedCompanies(normalizeCompanyNumbers(v));
									onDirtyChange?.(true);
								}}
								onSearchChange={(v) => {
									setCompanySearch(v);
									setCompanyPage(1);
								}}
								page={state.companyPage}
								isLoading={isLoadingOptions}
								onPrevPage={
									state.companyPage > 1
										? () => setCompanyPage((p) => p - 1)
										: undefined
								}
								onNextPage={
									listLengths.companies >= TILGANGER_PAGE_SIZE
										? () => setCompanyPage((p) => p + 1)
										: undefined
								}
								canPrevPage={state.companyPage > 1}
								canNextPage={listLengths.companies >= TILGANGER_PAGE_SIZE}
								placeholder={tBulk("companyPlaceholder", {
									count: selected.companies.length,
								})}
								searchPlaceholder={tBulk("companySearchPlaceholder")}
							/>
						</div>
					</div>
					<div className="flex justify-start">
						<Button
							type="button"
							variant="green"
							onClick={handleSaveAccess}
							disabled={isSaveDisabled}
							className="rounded-md px-6">
							{isSavingAccess && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{tSettings("saveChanges")}
						</Button>
					</div>
				</>
			)}
		</>
	);
}
