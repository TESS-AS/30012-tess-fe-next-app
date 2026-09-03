"use client";

import { useEffect, useState } from "react";

import OrdersTab from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTab";
import PersonalInfoTab from "@/app/[locale]/profile/(components)/tabs/PersonalInfoTab";
import UserAddressesTab from "@/app/[locale]/profile/(components)/tabs/UserAdresses/UserAddressesTab";
import UsersBrukere from "@/app/[locale]/profile/(components)/users-brukere";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SupportDialog } from "@/components/ui/dialogs/support-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { useGetHoseSystems } from "@/hooks/useGetHoseSystems";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { profileKeys } from "@/hooks/useGetProfileData";
import { useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import { cn } from "@/lib/utils";
import axiosClient from "@/services/axiosClient";
import type { SidebarNavItem } from "@/types/sidebar.types";
import { useQueryClient } from "@tanstack/react-query";
import {
	ShoppingCart,
	Folder,
	User,
	Settings,
	LogOut,
	List,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { InnstillingerTab } from "./(components)/innstillinger-tab";
import { SidebarNav } from "./(components)/sidebar-nav";

// Lazy load tab content to reduce profile page First Load JS (each tab in its own chunk)
const AvvikendeOrdre = dynamic(
	() =>
		import("./(components)/avvikende-ordre").then((m) => ({
			default: m.AvvikendeOrdre,
		})),
	{ ssr: false },
);
const AvvikendeOrdreDetail = dynamic(
	() =>
		import("./(components)/avvikende-ordre-detail").then((m) => ({
			default: m.AvvikendeOrdreDetail,
		})),
	{ ssr: false },
);
const Dimensions = dynamic(() => import("./(components)/dimensions"), {
	ssr: false,
});
const HoseDetailsPage = dynamic(
	() => import("./(components)/hose-details-page"),
	{ ssr: false },
);
const HoseInspections = dynamic(
	() => import("./(components)/hose-inspections"),
	{ ssr: false },
);
const HoseOverview = dynamic(
	() =>
		import("./(components)/hose-overview").then((m) => ({
			default: m.default,
		})),
	{ ssr: false },
);
const HoseReplacement = dynamic(
	() =>
		import("./(components)/hose-replacement").then((m) => ({
			default: m.default,
		})),
	{ ssr: false },
);
const HoseRequests = dynamic(
	() =>
		import("./(components)/hose-requests").then((m) => ({
			default: m.default,
		})),
	{ ssr: false },
);
const HoseRiskClass = dynamic(
	() =>
		import("./(components)/hose-risk-class").then((m) => ({
			default: m.default,
		})),
	{ ssr: false },
);
const HosesAndEquipments = dynamic(
	() =>
		import("./(components)/hoses-and-equipments").then((m) => ({
			default: m.HosesAndEquipments,
		})),
	{ ssr: false },
);
const MineBestillinger = dynamic(
	() =>
		import("./(components)/mine-bestillinger").then((m) => ({
			default: m.MineBestillinger,
		})),
	{ ssr: false },
);
const ThmActiveProjects = dynamic(
	() =>
		import("./(components)/thm-projects/ThmActiveProjects").then((m) => ({
			default: m.ThmActiveProjects,
		})),
	{ ssr: false },
);
const ThmWorkOrderDashboard = dynamic(
	() =>
		import("./(components)/thm-projects/ThmWorkOrderDashboard").then((m) => ({
			default: m.ThmWorkOrderDashboard,
		})),
	{ ssr: false },
);
const ThmWorkOrderList = dynamic(
	() =>
		import("./(components)/thm-projects/ThmWorkOrderList").then((m) => ({
			default: m.ThmWorkOrderList,
		})),
	{ ssr: false },
);
const OrdreDetaljer = dynamic(
	() =>
		import("./(components)/ordre-detaljer").then((m) => ({
			default: m.OrdreDetaljer,
		})),
	{ ssr: false },
);
const OrdreHistorikk = dynamic(
	() =>
		import("./(components)/ordre-historikk").then((m) => ({
			default: m.OrdreHistorikk,
		})),
	{ ssr: false },
);
const Rekvisisjoner = dynamic(
	() =>
		import("./(components)/rekvisisjoner").then((m) => ({
			default: m.Rekvisisjoner,
		})),
	{ ssr: false },
);

export default function ProfilePage() {
	const { setIsAuthOpen } = useAppContext();
	const { data: profile, isLoading: isLoadingProfile } = useGetProfileData();
	const t = useTranslations();
	const searchParams = useSearchParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [activeMode, setActiveMode] = useState<
		"hose" | "ehandel" | "tess-edi" | "thm"
	>("ehandel");
	const [activeTab, setActiveTab] = useState(
		profile?.role === "admin" || profile?.role === "superuser"
			? "rekvisisjoner"
			: "settings",
	);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
	const [supportOpen, setSupportOpen] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [selectedHexagonId, setSelectedHexagonId] = useState<string | null>(
		null,
	);
	const [selectedAvvikendeOrdre, setSelectedAvvikendeOrdre] = useState<{
		orderId: string;
		openConfirmationId: number;
	} | null>(null);
	// Populated by ThmWorkOrderList / ThmWorkOrderDashboard once BE returns
	// the s1Name for the current WO. Used as the breadcrumb label instead of
	// the raw tab id so users see "1765 Oseberg C" not "thm-dashboard".
	const [workOrderS1Name, setWorkOrderS1Name] = useState<string | null>(null);

	// Clear the S1-name breadcrumb label whenever the workOrder or tab
	// changes; the child re-populates it via its own data fetch, so we don't
	// want the previous WO's name flashing before the new one lands.
	const currentWorkOrder = searchParams.get("workOrder");
	useEffect(() => {
		setWorkOrderS1Name(null);
	}, [currentWorkOrder, activeTab]);
	const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] =
		useState(false);
	const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
	const [pendingTab, setPendingTab] = useState<string | null>(null);

	const shouldFetchHoseSystems = !!profile && activeMode === "hose";
	const hoseSystems = useGetHoseSystems(shouldFetchHoseSystems);

	useEffect(() => {
		if (!profile) return;

		if (
			profile.defaultCustomerNumber ===
			SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
		) {
			setActiveMode("hose");
			setActiveTab("hose-orders");
		} else {
			setActiveMode("ehandel");
			setActiveTab(
				profile?.role === "admin" || profile?.role === "superuser"
					? "rekvisisjoner"
					: "settings",
			);
		}
	}, [profile]);

	// Read tab from URL query parameters (and guard when leaving settings with unsaved changes)
	useEffect(() => {
		const tabParam = searchParams.get("tab");
		if (!tabParam) return;

		// If we're on settings with unsaved changes and URL says another tab, show modal and keep URL on settings
		if (hasUnsavedSettingsChanges && tabParam !== "settings") {
			setPendingTab(tabParam);
			setIsUnsavedDialogOpen(true);
			router.replace(`/profile?tab=settings`, { scroll: false });
			return;
		}

		// Hose management tab group -> switch to hose mode
		const hoseTabs = new Set([
			"hose-oversikt",
			"hose-orders",
			"hose-inspections",
			"hose-replacement",
			"hose-risk-class",
			"hose-requests",
			"hose-activities",
			"hose-settings",
		]);

		if (hoseTabs.has(tabParam)) {
			setActiveMode("hose");
		}
		if (tabParam === "settings") {
			setActiveMode("ehandel");
		}
		if (tabParam?.startsWith("thm-")) {
			if (profile?.role === "admin" || profile?.role === "thmAdmin") {
				setActiveMode("thm");
			} else {
				setActiveTab("rekvisisjoner");
				return;
			}
		}

		setActiveTab(tabParam);

		// If navigating to tess-edi, switch to tess-edi mode (only for admins)
		if (
			tabParam === "tess-edi" &&
			profile?.defaultCustomerNumber !==
				SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER &&
			profile?.role === "admin"
		) {
			setActiveMode("tess-edi");
			// Reset selected order when navigating to tess-edi tab
			setSelectedAvvikendeOrdre(null);
		} else if (tabParam === "tess-edi" && profile?.role !== "admin") {
			// Redirect non-admins away from tess-edi
			setActiveTab("rekvisisjoner");
		}
	}, [searchParams, profile, hasUnsavedSettingsChanges, router]);

	// Reset selected order when activeTab changes away from tess-edi or when switching to tess-edi
	useEffect(() => {
		if (activeTab !== "tess-edi") {
			setSelectedAvvikendeOrdre(null);
		}
	}, [activeTab]);

	const handleLogout = async () => {
		try {
			await axiosClient.post("/logout");
		} catch (error) {
			console.error("Logout API failed", error);
		}
		queryClient.setQueryData(profileKeys.detail(), null);
		queryClient.invalidateQueries({ queryKey: profileKeys.all });
		queryClient.removeQueries({ queryKey: profileKeys.all });
		router.push("/");
	};

	const handleModeChange = (mode: "hose" | "ehandel" | "tess-edi" | "thm") => {
		// Only allow tess-edi mode for admins
		if (mode === "tess-edi" && profile?.role !== "admin") {
			return;
		}
		// Only allow thm mode for admin / thmAdmin
		if (
			mode === "thm" &&
			profile?.role !== "admin" &&
			profile?.role !== "thmAdmin"
		) {
			return;
		}
		setActiveMode(mode);
		if (mode === "ehandel") {
			setActiveTab("rekvisisjoner");
			router.replace("/profile?tab=rekvisisjoner", { scroll: false });
		} else if (mode === "hose") {
			setActiveTab("hose-orders");
			router.replace("/profile?tab=hose-orders", { scroll: false });
		} else if (mode === "tess-edi") {
			setActiveTab("tess-edi");
			router.replace("/profile?tab=tess-edi", { scroll: false });
			// Reset selected order when switching to tess-edi mode
			setSelectedAvvikendeOrdre(null);
		} else if (mode === "thm") {
			setActiveTab("thm-active-projects");
			router.replace("/profile?tab=thm-active-projects", { scroll: false });
		}
	};

	const handleConfirmDiscardChanges = () => {
		setIsUnsavedDialogOpen(false);
		setHasUnsavedSettingsChanges(false);
		if (!pendingTab) return;
		const tab = pendingTab;
		setPendingTab(null);

		if (tab === "support") {
			setSupportOpen(true);
			return;
		}

		if (tab === "logout") {
			handleLogout();
			return;
		}

		if (tab === "tess-edi" && profile?.role !== "admin") {
			return;
		}

		setActiveTab(tab);
		router.replace(`/profile?tab=${tab}`, { scroll: false });
		if (tab === "tess-edi") {
			setSelectedAvvikendeOrdre(null);
		}
	};

	const handleCancelDiscardChanges = () => {
		setIsUnsavedDialogOpen(false);
		setPendingTab(null);
	};

	if (isLoadingProfile) {
		return (
			<main className="my-6 min-h-screen">
				<Skeleton className="mb-4 h-6 w-64" />

				<div className="mx-auto flex gap-6 pt-4">
					<div className="h-full w-[350px] space-y-4">
						<Skeleton className="h-24 w-full rounded-lg" />
						<Skeleton className="h-[600px] w-full rounded-lg" />
					</div>

					<div className="w-[calc(100%-350px)] space-y-4">
						<Skeleton className="h-16 w-full rounded-lg" />
						<Skeleton className="h-[200px] w-full rounded-lg" />
						<Skeleton className="h-[400px] w-full rounded-lg" />
					</div>
				</div>
			</main>
		);
	}

	if (!profile) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12">
				<h1 className="text-2xl font-semibold">{t("Login.title")}</h1>
				<Button onClick={() => setIsAuthOpen(true)}>
					{t("Login.loginToViewCart")}
				</Button>
			</div>
		);
	}

	const getBreadcrumbItems = () => {
		const items = [];

		const tabLabels: Record<string, string> = {
			// E-handel tabs
			"mine-bestillinger": t("ProfilePage.tabs.myOrders"),
			rekvisisjoner: t("ProfilePage.tabs.requisitions"),
			ordrehistorikk: t("ProfilePage.tabs.orderHistory"),
			dimensions: t("ProfilePage.tabs.dimensions"),
			usage: t("ProfilePage.tabs.usage"),
			users: t("ProfilePage.tabs.users"),
			catalog: t("ProfilePage.tabs.catalog"),
			settings: t("ProfilePage.tabs.settings"),
			// TESS EDI tabs
			"tess-edi": "TESS EDI",
			// Hose tabs
			"hose-oversikt": t("ProfilePage.tabs.overview"),
			"hose-orders": t("ProfilePage.tabs.hosesEquipment"),
			"hose-inspections": t("ProfilePage.tabs.inspections"),
			"hose-replacement": t("ProfilePage.tabs.hoseReplacement"),
			"hose-risk-class": t("ProfilePage.tabs.riskClass"),
			"hose-requests": t("ProfilePage.tabs.requests"),
			"hose-activities": t("ProfilePage.tabs.recentActivities"),
			"hose-settings": t("ProfilePage.tabs.settings"),
			// THM Projects (MSL) tabs
			"thm-active-projects": "Active Projects",
		};

		const isThmTab = activeTab?.startsWith("thm-");
		const modeLabel = isThmTab
			? "THM Projects (MSL)"
			: activeMode === "hose"
				? t("BreadCrumbs.hoseManagement")
				: activeMode === "tess-edi"
					? "TESS EDI"
					: t("BreadCrumbs.ehandel");
		const defaultTab = isThmTab
			? "thm-active-projects"
			: activeMode === "hose"
				? "hose-orders"
				: activeMode === "tess-edi"
					? "tess-edi"
					: "mine-bestillinger";

		items.push({
			href: "/profile",
			label: modeLabel,
			onClick: (e: React.MouseEvent) => {
				e.preventDefault();
				setActiveTab(defaultTab);
				setSelectedHexagonId(null);
				setSelectedOrderId(null);
			},
		});

		if (activeTab) {
			const isThmWorkOrderTab =
				activeTab === "thm-dashboard" || activeTab === "thm-list";
			const tabLabel = isThmWorkOrderTab
				? (workOrderS1Name ?? currentWorkOrder ?? "Work order")
				: (tabLabels[activeTab] || activeTab);
			items.push({
				href: `/profile?tab=${activeTab}`,
				label: tabLabel,
				onClick: (e: React.MouseEvent) => {
					e.preventDefault();
					setActiveTab(activeTab);
					setSelectedHexagonId(null);
					setSelectedOrderId(null);
				},
			});
		}

		if (selectedHexagonId && activeTab === "hose-orders") {
			items.push({
				href: "#",
				label: selectedHexagonId,
			} as any);
		}

		if (selectedOrderId && activeTab === "mine-bestillinger") {
			items.push({
				href: "#",
				label: selectedOrderId,
			} as any);
		}

		return items;
	};

	const commonBottomItems: SidebarNavItem[] = [
		{
			href: "settings",
			label: t("ProfilePage.sidebar.settings"),
			icon: Settings,
		},
		{
			href: "support",
			label: t("ProfilePage.sidebar.help"),
			icon: "/icons/profile/navbar/support.svg",
		},
		{
			href: "logout",
			label: t("ProfilePage.sidebar.logout"),
			icon: LogOut,
			variant: "logout",
		},
	];

	return (
		<main className="my-6 min-h-screen">
			<Breadcrumb
				items={getBreadcrumbItems()}
				showHome
			/>
			<div className="mx-auto flex gap-6 pt-4">
				<Tabs
					value={activeTab}
					className="flex w-full gap-5">
					<div className="h-full">
						<SidebarNav
							activeMode={activeMode}
							activeTab={activeTab}
							onModeChange={handleModeChange}
							onTabChange={(tab) => {
								if (
									activeTab === "settings" &&
									tab !== "settings" &&
									hasUnsavedSettingsChanges
								) {
									setPendingTab(tab);
									setIsUnsavedDialogOpen(true);
									return;
								}

								if (tab === "support") {
									setSupportOpen(true);
									return;
								}
								if (tab === "logout") {
									handleLogout();
									return;
								}
								// Only allow tess-edi tab for admins
								if (tab === "tess-edi" && profile?.role !== "admin") {
									return;
								}
								setActiveTab(tab);
								router.replace(`/profile?tab=${tab}`, { scroll: false });
								// Reset selected order when switching tabs
								if (tab === "tess-edi") {
									setSelectedAvvikendeOrdre(null);
								}
							}}
							onCollapse={setIsSidebarCollapsed}
							profile={profile}
							items={
								activeMode === "ehandel"
									? [
											...(profile.role === "admin" ||
											profile.role === "superuser"
												? [
														{
															href: "#",
															label: t("ProfilePage.sidebar.orders"),
															icon: ShoppingCart,
															subitems: [
																// {
																// 	href: "mine-bestillinger",
																// 	label: t("ProfilePage.sidebar.myOrders"),
																// },
																{
																	href: "rekvisisjoner",
																	label: t("ProfilePage.sidebar.requisitions"),
																},
																{
																	href: "ordrehistorikk",
																	label: t("ProfilePage.sidebar.orderHistory"),
																},
															],
														},
													]
												: []),
											// {
											// 	href: "dimensions",
											// 	label: t("ProfilePage.sidebar.dimensions"),
											// 	icon: "/icons/profile/navbar/folder-outline.svg",
											// },
											// {
											// 	href: "usage",
											// 	label: t("ProfilePage.sidebar.usage"),
											// 	icon: "/icons/profile/navbar/lock-time-outline.svg",
											// },
											...(profile.role === "admin" ||
											profile.role === "superuser"
												? [
														{
															href: "users",
															label: t("ProfilePage.sidebar.users"),
															icon: "/icons/profile/navbar/user-settings-outline.svg",
														},
													]
												: []),
											...commonBottomItems,
										]
									: activeMode === "tess-edi"
										? [
												{
													href: "tess-edi",
													label: "Avvikende ordre",
													icon: List,
												},
												...commonBottomItems,
											]
										: activeMode === "thm"
											? [
													{
														href: "thm-active-projects",
														label: "Active Projects",
														icon: List,
													},
													...commonBottomItems,
												]
											: [
													// {
													// 	href: "hose-oversikt",
													// 	label: t("ProfilePage.sidebar.overview"),
													// 	icon: "/icons/profile/navbar/overview.svg",
													// },
													{
														href: "hose-orders",
														label: t("ProfilePage.sidebar.hosesEquipment"),
														icon: "/icons/profile/navbar/list.svg",
													},
													// {
													// 	href: "hose-inspections",
													// 	label: t("ProfilePage.sidebar.inspections"),
													// 	icon: "/icons/profile/navbar/inspectioner.svg",
													// },
													// {
													// 	href: "hose-replacement",
													// 	label: t("ProfilePage.sidebar.hoseReplacement"),
													// 	icon: "/icons/profile/navbar/hose-changer.svg",
													// },
													// {
													// 	href: "hose-risk-class",
													// 	label: t("ProfilePage.sidebar.riskClass"),
													// 	icon: "/icons/profile/navbar/risk-classes.svg",
													// },
													// {
													// 	href: "hose-requests",
													// 	label: t("ProfilePage.sidebar.requests"),
													// 	icon: "/icons/profile/navbar/requirments.svg",
													// },
													// {
													// 	href: "hose-activities",
													// 	label: t("ProfilePage.sidebar.recentActivities"),
													// 	icon: "/icons/profile/navbar/activities.svg",
													// },
													// {
													// 	href: "hose-settings",
													// 	label: t("ProfilePage.sidebar.settings"),
													// 	icon: "/icons/profile/navbar/settings.svg",
													// },
													// {
													// 	href: "support",
													// 	label: t("ProfilePage.sidebar.support"),
													// 	icon: "/icons/profile/navbar/support.svg",
													// },
													// {
													// 	href: "logout",
													// 	label: t("ProfilePage.sidebar.logout"),
													// 	icon: LogOut,
													// 	variant: "logout",
													// },
													...commonBottomItems,
												]
							}
						/>
					</div>

					<div
						className={cn(
							"min-w-0",
							isSidebarCollapsed
								? "w-[calc(100%-80px)]"
								: "w-[calc(100%-350px)]",
						)}>
						<TabsContent
							value="personal-info"
							className="mt-0">
							<PersonalInfoTab />
						</TabsContent>

						<TabsContent
							value="mine-bestillinger"
							className="mt-0">
							{selectedOrderId ? (
								<OrdreDetaljer
									orderId={selectedOrderId}
									onBack={() => setSelectedOrderId(null)}
								/>
							) : (
								<MineBestillinger onOrderClick={setSelectedOrderId} />
							)}
						</TabsContent>
						<TabsContent
							value="rekvisisjoner"
							className="mt-0">
							<Rekvisisjoner />
						</TabsContent>

						<TabsContent
							value="ordrehistorikk"
							className="mt-0">
							<OrdreHistorikk customerNumber={profile.defaultCustomerNumber} />
						</TabsContent>

						<TabsContent value="users">
							<UsersBrukere />
						</TabsContent>

						{profile.role === "admin" && (
							<TabsContent
								value="tess-edi"
								className="mt-0">
								{selectedAvvikendeOrdre ? (
									<AvvikendeOrdreDetail
										orderId={selectedAvvikendeOrdre.orderId}
										openConfirmationId={selectedAvvikendeOrdre.openConfirmationId}
										onBack={() => setSelectedAvvikendeOrdre(null)}
									/>
								) : (
									<AvvikendeOrdre onOrderSelect={setSelectedAvvikendeOrdre} />
								)}
							</TabsContent>
						)}

						<TabsContent
							value="thm-active-projects"
							className="mt-0">
							{activeTab === "thm-active-projects" && <ThmActiveProjects />}
						</TabsContent>

						<TabsContent
							value="thm-dashboard"
							className="mt-0">
							{activeTab === "thm-dashboard" && (
								<ThmWorkOrderDashboard
									workOrderNumber={searchParams.get("workOrder") ?? ""}
									onS1NameResolved={setWorkOrderS1Name}
								/>
							)}
						</TabsContent>

						<TabsContent
							value="thm-list"
							className="mt-0">
							{activeTab === "thm-list" && (
								<ThmWorkOrderList
									workOrderNumber={searchParams.get("workOrder") ?? ""}
									onS1NameResolved={setWorkOrderS1Name}
								/>
							)}
						</TabsContent>

						<TabsContent value="settings">
							<InnstillingerTab onDirtyChange={setHasUnsavedSettingsChanges} />
						</TabsContent>

						<TabsContent value="addresses">
							<UserAddressesTab />
						</TabsContent>

						<TabsContent value="dimensions">
							<Dimensions />
						</TabsContent>

						<TabsContent
							value="hose-orders"
							className="mt-0">
							{activeTab === "hose-orders" &&
								(selectedHexagonId ? (
									<HoseDetailsPage
										hexagonId={selectedHexagonId}
										onBack={() => setSelectedHexagonId(null)}
										hoseSystems={hoseSystems}
									/>
								) : (
									<HosesAndEquipments
										goToHose={setSelectedHexagonId}
										profile={profile}
									/>
								))}
						</TabsContent>

						<TabsContent
							value="hose-inspections"
							className="mt-0">
							{activeTab === "hose-inspections" && <HoseInspections />}
						</TabsContent>

						<TabsContent value="orders">
							<OrdersTab />
						</TabsContent>

						<TabsContent value="hose-oversikt">
							{activeTab === "hose-oversikt" && (
								<HoseOverview hoseSystems={hoseSystems} />
							)}
						</TabsContent>

						<TabsContent
							value="hose-replacement"
							className="mt-0">
							{activeTab === "hose-replacement" && <HoseReplacement />}
						</TabsContent>

						<TabsContent value="hose-risk-class">
							<HoseRiskClass />
						</TabsContent>

						<TabsContent value="hose-requests">
							<HoseRequests />
						</TabsContent>

						<TabsContent value="wishlist">
							<p className="text-muted-foreground">My wishlist coming soon.</p>
						</TabsContent>

						<TabsContent value="password">
							<p className="text-muted-foreground">Change your password.</p>
						</TabsContent>

						<TabsContent value="ratings">
							<p className="text-muted-foreground">Your reviews and ratings.</p>
						</TabsContent>
					</div>
				</Tabs>
			</div>

			<SupportDialog
				open={supportOpen}
				onOpenChange={setSupportOpen}
				selectedIds={[]}
				onSubmit={async ({ subject, message, file }) => {
					console.log("Support submit", { subject, message, file });
				}}
			/>

			<Dialog
				open={isUnsavedDialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						setIsUnsavedDialogOpen(false);
					}
				}}>
				<DialogContent className="!max-w-sm rounded-xl bg-white p-6 sm:p-7">
					<div className="space-y-3">
						<h2 className="text-xl font-semibold text-[#0F1912]">
							{t("ProfilePage.unsavedChanges.title")}
						</h2>
						<p className="text-sm leading-snug font-bold text-gray-500">
							{t("ProfilePage.unsavedChanges.descriptionLine1")}
							<br />
							{t("ProfilePage.unsavedChanges.descriptionLine2")}
						</p>
						<div className="mt-4 flex justify-start gap-3">
							<Button
								variant="outline"
								onClick={handleCancelDiscardChanges}
								className="border border-[#D1D5D3] bg-white px-5 py-2 text-sm font-medium text-[#0F1912]">
								{t("ProfilePage.unsavedChanges.cancel")}
							</Button>
							<Button
								variant="destructive"
								onClick={handleConfirmDiscardChanges}
								className="bg-[#C81E1E] px-5 py-2 text-sm text-white hover:bg-[#B71C1C]">
								{t("ProfilePage.unsavedChanges.discard")}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	);
}
