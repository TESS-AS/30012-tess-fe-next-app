"use client";

import OrdersTab from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTab";
import PersonalInfoTab from "@/app/[locale]/profile/(components)/tabs/PersonalInfoTab";
import UserAddressesTab from "@/app/[locale]/profile/(components)/tabs/UserAdresses/UserAddressesTab";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./(components)/sidebar-nav";
import { ShoppingCart, ArrowRight, Folder, User, Settings, LogOut, ClipboardList, FileText } from "lucide-react";
import { profileTabs } from "@/constants/profileTabs";
import { useState } from "react";
import { MineBestillinger } from "./(components)/mine-bestillinger";
import { OrdreDetaljer } from "./(components)/ordre-detaljer";
import { OrdreHistorikk } from "./(components)/ordre-historikk";

export default function ProfilePage() {
  const [activeMode, setActiveMode] = useState<"hose" | "ehandel">("ehandel");
  const [activeTab, setActiveTab] = useState("mine-bestillinger");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	return (
		<main className="mt-6 min-h-screen ">
			<div className="mx-auto flex gap-6">
				<Tabs
					value={activeTab}
					className="flex w-full gap-5">
					<div className="h-full">
						<SidebarNav 
							activeMode={activeMode}
							onModeChange={setActiveMode}
							onTabChange={setActiveTab}
							onCollapse={setIsSidebarCollapsed}
							items={activeMode === "ehandel" 
								? [
									{
										href: "#",
										label: "Ordre",
										icon: ShoppingCart,
										subitems: [
											{
												href: "mine-bestillinger",
												label: "Mine bestillinger"
											},
											{
												href: "ordrehistorikk",
												label: "Ordrehistorikk"
											}
										]
									},
									{
										href: "dimensions",
										label: "Dimensjoner",
										icon: Folder
									},
									{
										href: "usage",
										label: "Forbruk",
										icon: User
									},
									{
										href: "users",
										label: "Brukere",
										icon: User
									},
									{
										href: "catalog",
										label: "Katalog",
										icon: User
									},
									{
										href: "settings",
										label: "Innstillinger",
										icon: Settings
									},
									{
										href: "settings-alt",
										label: "Innstillinger",
										icon: Settings
									},
									{
										href: "logout",
										label: "Log out",
										icon: LogOut,
										variant: "logout"
									}
								] : [
									{
										href: "hose-orders",
										label: "Orders",
										icon: ClipboardList
									},
									{
										href: "hose-reports",
										label: "Reports",
										icon: FileText
									},
									{
										href: "hose-settings",
										label: "Settings",
										icon: Settings
									},
									{
										href: "logout",
										label: "Log out",
										icon: LogOut,
										variant: "logout"
									}
								]
							} 
						/>
					</div>

					<div className={cn(
						isSidebarCollapsed ? "w-[calc(100%-80px)]" : "w-[calc(100%-350px)]"
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
								<OrdreDetaljer orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
							) : (
								<MineBestillinger onOrderClick={(orderId) => setSelectedOrderId(orderId)} />
							)}
						</TabsContent>

						<TabsContent
							value="ordrehistorikk"
							className="mt-0">
							<OrdreHistorikk />
						</TabsContent>

						<TabsContent value="addresses">
							<UserAddressesTab />
						</TabsContent>

						<TabsContent value="orders">
							<OrdersTab />
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
