"use client";

import { useEffect, useState } from "react";

import OrdersTab from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTab";
import PersonalInfoTab from "@/app/[locale]/profile/(components)/tabs/PersonalInfoTab";
import UserAddressesTab from "@/app/[locale]/profile/(components)/tabs/UserAdresses/UserAddressesTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { useAppContext } from "@/lib/appContext";
import { cn } from "@/lib/utils";
import {
	ShoppingCart,
	Folder,
	User,
	Settings,
	LogOut,
	List,
	HelpCircle,
	LockKeyhole,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Dimensions } from "./(components)/dimensions";
import { HoseOrders } from "./(components)/hose-orders";
import { MineBestillinger } from "./(components)/mine-bestillinger";
import { OrdreDetaljer } from "./(components)/ordre-detaljer";
import { OrdreHistorikk } from "./(components)/ordre-historikk";
import { Rekvisisjoner } from "./(components)/rekvisisjoner";
import { SidebarNav } from "./(components)/sidebar-nav";
import HoseOverview from "./(components)/hose-overview";
import HoseInspections from "./(components)/hose-inspections";

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
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

	return (
		<main className="my-6 min-h-screen">
			<div className="mx-auto flex gap-6">
				<Tabs
					value={activeTab}
					className="flex w-full gap-5">
					<div className="h-full">
						<SidebarNav
							activeMode={activeMode}
							activeTab={activeTab}
							onModeChange={handleModeChange}
							onTabChange={setActiveTab}
							onCollapse={setIsSidebarCollapsed}
							items={
								activeMode === "ehandel"
									? [
											{
												href: "#",
												label: "Ordre",
												icon: ShoppingCart,
												subitems: [
													{
														href: "mine-bestillinger",
														label: "Mine bestillinger",
													},
													{
														href: "rekvisisjoner",
														label: "Rekvisisjoner",
													},
													{
														href: "ordrehistorikk",
														label: "Ordrehistorikk",
													},
												],
											},
											{
												href: "dimensions",
												label: "Dimensjoner",
												icon: Folder,
											},
											{
												href: "usage",
												label: "Forbruk",
												icon: User,
											},
											{
												href: "users",
												label: "Brukere",
												icon: User,
											},
											{
												href: "catalog",
												label: "Katalog",
												icon: User,
											},
											{
												href: "settings",
												label: "Innstillinger",
												icon: Settings,
											},
											{
												href: "settings-alt",
												label: "Innstillinger",
												icon: Settings,
											},
											{
												href: "logout",
												label: "Log out",
												icon: LogOut,
												variant: "logout",
											},
										]
									: [
											{
												href: "hose-orders",
												label: "Slanger/utstyr",
												icon: List,
											},
											{
												href: "hose-oversikt",
												label: "Oversikt",
												icon: LockKeyhole,
											},
											{
												href: "hose-inspections",
												label: "Inspeksjoner",
												icon: LockKeyhole,
											},
											{
												href: "support",
												label: "Support",
												icon: HelpCircle,
											},
											{
												href: "logout",
												label: "Log out",
												icon: LogOut,
												variant: "logout",
											},
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

						<TabsContent value="addresses">
							<UserAddressesTab />
						</TabsContent>

						<TabsContent value="dimensions">
							<Dimensions />
						</TabsContent>

						<TabsContent
							value="hose-orders"
							className="mt-0">
							<HoseOrders />
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
		</main>
	);
}
