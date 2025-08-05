"use client";

import OrdersTab from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTab";
import PersonalInfoTab from "@/app/[locale]/profile/(components)/tabs/PersonalInfoTab";
import UserAddressesTab from "@/app/[locale]/profile/(components)/tabs/UserAdresses/UserAddressesTab";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SidebarNav } from "./(components)/sidebar-nav";
import { ShoppingCart, ArrowRight, Folder, User, Settings, LogOut, ClipboardList, FileText } from "lucide-react";
import { profileTabs } from "@/constants/profileTabs";
import { useState } from "react";

export default function ProfilePage() {
  const [activeMode, setActiveMode] = useState<"hose" | "ehandel">("ehandel");

	return (
		<main className="mt-6 min-h-screen ">
			<div className="mx-auto flex gap-6">
				<Tabs
					defaultValue="personal-info"
					className="flex w-full gap-5">
					<div className="h-full">
						<SidebarNav 
						activeMode={activeMode}
						onModeChange={setActiveMode}
						items={activeMode === "ehandel" 
							? [
								{
									href: "/orders",
									label: "Ordre",
									icon: ShoppingCart,
									subitems: [
										{
											href: "/my-orders",
											label: "Mine bestillinger"
										},
										{
											href: "/order-history",
											label: "Ordrehistorikk"
										}
									]
								},
								{
									href: "/dimensions",
									label: "Dimensjoner",
									icon: Folder
								},
								{
									href: "/usage",
									label: "Forbruk",
									icon: User
								},
								{
									href: "/users",
									label: "Brukere",
									icon: User
								},
								{
									href: "/catalog",
									label: "Katalog",
									icon: User
								},
								{
									href: "/settings",
									label: "Innstillinger",
									icon: Settings
								},
								{
									href: "/settings-alt",
									label: "Innstillinger",
									icon: Settings
								},
								{
									href: "/logout",
									label: "Log out",
									icon: LogOut,
									variant: "logout"
								}
							] : [
								{
									href: "/hose/orders",
									label: "Orders",
									icon: ClipboardList
								},
								{
									href: "/hose/reports",
									label: "Reports",
									icon: FileText
								},
								{
									href: "/hose/settings",
									label: "Settings",
									icon: Settings
								},
								{
									href: "/logout",
									label: "Log out",
									icon: LogOut,
									variant: "logout"
								}
							]} />
					</div>

					<div className="w-3/4">
						<TabsContent
							value="personal-info"
							className="mt-0 bg-white">
							<PersonalInfoTab />
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
