"use client";

import OrdersTab from "@/app/[locale]/profile/(components)/tabs/OrdersTab/OrdersTab";
import PersonalInfoTab from "@/app/[locale]/profile/(components)/tabs/PersonalInfoTab";
import UserAddressesTab from "@/app/[locale]/profile/(components)/tabs/UserAdresses/UserAddressesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants/profileTabs";

export default function ProfilePage() {
	return (
		<main className="mt-6 min-h-screen bg-white">
			<div className="mx-auto flex gap-6">
				<Tabs
					defaultValue="personal-info"
					className="flex w-full gap-5">
					<TabsList className="flex h-fit w-1/4 flex-col gap-2 rounded-md border bg-white p-4">
						<>
							{profileTabs.map(({ value, label, icon: Icon }) => (
								<TabsTrigger
									key={value}
									value={value}
									className="mt-2 w-full justify-start gap-2 hover:text-green-600 data-[state=active]:text-green-600">
									<Icon className="h-4 w-4" />
									{label}
								</TabsTrigger>
							))}
						</>
					</TabsList>

					<div className="w-3/4">
						<TabsContent
							value="personal-info"
							className="mt-0">
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
