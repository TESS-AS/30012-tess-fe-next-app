"use client";

import { useEffect, useState } from "react";

import OrdersTab from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTab";
import PersonalInfoTab from "@/app/[locale]/profile/(components)/tabs/PersonalInfoTab";
import UserAddressesTab from "@/app/[locale]/profile/(components)/tabs/UserAdresses/UserAddressesTab";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SupportDialog } from "@/components/ui/dialogs/support-dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useAppContext } from "@/lib/appContext";
import { cn } from "@/lib/utils";
import { ShoppingCart, Folder, User, Settings, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { Dimensions } from "./(components)/dimensions";
import HoseDetailsPage from "./(components)/hose-details-page";
import HoseInspections from "./(components)/hose-inspections";
import HoseOverview from "./(components)/hose-overview";
import HoseReplacement from "./(components)/hose-replacement";
import HoseRequests from "./(components)/hose-requests";
import HoseRiskClass from "./(components)/hose-risk-class";
import { HosesAndEquipments } from "./(components)/hoses-and-equipments";
import { MineBestillinger } from "./(components)/mine-bestillinger";
import { OrdreDetaljer } from "./(components)/ordre-detaljer";
import { OrdreHistorikk } from "./(components)/ordre-historikk";
import { Rekvisisjoner } from "./(components)/rekvisisjoner";
import { SidebarNav } from "./(components)/sidebar-nav";
import UsersBrukere from "./(components)/users-brukere";

export default function ProfilePage() {
	const { setIsAuthOpen } = useAppContext();
	const { data: profile } = usePunchoutProfile();
	const t = useTranslations();

	const [activeMode, setActiveMode] = useState<"hose" | "ehandel">("ehandel");
	const [activeTab, setActiveTab] = useState("mine-bestillinger");

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
			setActiveTab("mine-bestillinger");
		}
	}, [profile]);

	const handleModeChange = (mode: "hose" | "ehandel") => {
		setActiveMode(mode);
		if (mode === "ehandel") {
			setActiveTab("mine-bestillinger");
		} else if (mode === "hose") {
			setActiveTab("hose-orders");
		}
	};
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [supportOpen, setSupportOpen] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [selectedHexagonId, setSelectedHexagonId] = useState<string | null>(
		null,
	);

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
			// Hose tabs
			"hose-oversikt": t("ProfilePage.tabs.overview"),
			"hose-orders": t("ProfilePage.tabs.hosesEquipment"),
			"hose-inspections": t("ProfilePage.tabs.inspections"),
			"hose-replacement": t("ProfilePage.tabs.hoseReplacement"),
			"hose-risk-class": t("ProfilePage.tabs.riskClass"),
			"hose-requests": t("ProfilePage.tabs.requests"),
			"hose-activities": t("ProfilePage.tabs.recentActivities"),
			"hose-settings": t("ProfilePage.tabs.settings"),
		};

		const modeLabel =
			activeMode === "hose"
				? t("BreadCrumbs.hoseManagement")
				: t("BreadCrumbs.ehandel");
		const defaultTab =
			activeMode === "hose" ? "hose-orders" : "mine-bestillinger";

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
			const tabLabel = tabLabels[activeTab] || activeTab;
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
								if (tab === "support") {
									setSupportOpen(true);
									return;
								}
								setActiveTab(tab);
							}}
							onCollapse={setIsSidebarCollapsed}
							items={
								activeMode === "ehandel"
									? [
											{
												href: "#",
												label: t("ProfilePage.sidebar.orders"),
												icon: ShoppingCart,
												subitems: [
													{
														href: "mine-bestillinger",
														label: t("ProfilePage.sidebar.myOrders"),
													},
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
											{
												href: "dimensions",
												label: t("ProfilePage.sidebar.dimensions"),
												icon: "/icons/profile/navbar/folder-outline.svg",
											},
											{
												href: "usage",
												label: t("ProfilePage.sidebar.usage"),
												icon: "/icons/profile/navbar/lock-time-outline.svg",
											},
											{
												href: "users",
												label: t("ProfilePage.sidebar.users"),
												icon: "/icons/profile/navbar/user-settings-outline.svg",
											},
											{
												href: "catalog",
												label: t("ProfilePage.sidebar.catalog"),
												icon: "/icons/profile/navbar/lock-time-outline.svg",
											},
											{
												href: "settings",
												label: t("ProfilePage.sidebar.settings"),
												icon: Settings,
											},
											{
												href: "settings-alt",
												label: t("ProfilePage.sidebar.settings"),
												icon: Settings,
											},
											{
												href: "logout",
												label: t("ProfilePage.sidebar.logout"),
												icon: LogOut,
												variant: "logout",
											},
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
										]
							}
						/>
					</div>

					<div
						className={cn(
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
							<OrdreHistorikk />
						</TabsContent>

						<TabsContent value="users">
							<UsersBrukere />
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
							{selectedHexagonId ? (
								<HoseDetailsPage
									hexagonId={selectedHexagonId}
									onBack={() => setSelectedHexagonId(null)}
								/>
							) : (
								<HosesAndEquipments goToHose={setSelectedHexagonId} />
							)}
						</TabsContent>

						<TabsContent
							value="hose-inspections"
							className="mt-0">
							<HoseInspections />
						</TabsContent>

						<TabsContent value="orders">
							<OrdersTab />
						</TabsContent>

						<TabsContent value="hose-oversikt">
							<HoseOverview />
						</TabsContent>

						<TabsContent value="hose-replacement">
							<HoseReplacement />
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
		</main>
	);
}
