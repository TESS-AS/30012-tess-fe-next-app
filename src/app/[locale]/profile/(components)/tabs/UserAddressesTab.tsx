"use client";

import { useEffect, useState } from "react";

import { AddressSkeleton } from "@/app/[locale]/profile/(components)/tabs/skeletons/AddressSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetBusinessAddresses } from "@/hooks/useGetBusinessAddresses";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useGetUserAdresses } from "@/hooks/useGetUserAdresses";
import { UserAddress } from "@/types/user.types";
import { toast } from "react-toastify";

export default function UserAddressesTab() {
	const [activeTab, setActiveTab] = useState<"personal" | "business">(
		"personal",
	);

	const { data: profile } = useGetProfileData();
	const customerNumber = profile?.customerNumbers?.[0];

	const {
		data: personalAddresses,
		isLoading: loadingPersonal,
		error: errorPersonal,
	} = useGetUserAdresses();

	const {
		data: businessAddresses,
		isLoading: loadingBusiness,
		error: errorBusiness,
	} = useGetBusinessAddresses(customerNumber, activeTab === "business");

	useEffect(() => {
		if (errorPersonal) toast.error("Failed to load personal addresses");
	}, [errorPersonal]);

	useEffect(() => {
		if (errorBusiness) toast.error("Failed to load business addresses");
	}, [errorBusiness]);

	const renderAddresses = (addresses: UserAddress[]) => (
		<>
			{addresses.map((address, index) => (
				<div
					key={address.addressId}
					className="mb-4 rounded-md border p-4 shadow-sm">
					<h3 className="mb-4 text-lg font-medium">
						{index === 0 ? "Primary Address" : `Secondary Address`}
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{(
							[
								["Address Name", address.addressName],
								["Address Line 1", address.addressLine1],
								["Address Line 2", address.addressLine2],
								["Address Line 3", address.addressLine3],
								["Postal Code", address.postalCode],
								["City", address.city],
								["Delivery Code", address.deliveryCode],
								["Condition", address.condition],
							] as [string, string][]
						).map(([label, value]) => (
							<div key={label}>
								<label className="text-sm font-medium">{label}</label>
								<input
									type="text"
									value={value}
									disabled
									className="w-full rounded-md border bg-gray-50 px-3 py-2"
								/>
							</div>
						))}
					</div>
				</div>
			))}
		</>
	);

	return (
		<div className="space-y-6 rounded-lg border p-6 shadow-sm">
			<h2 className="text-xl font-semibold">Your Addresses</h2>

			<Tabs
				defaultValue="personal"
				value={activeTab}
				onValueChange={(val) => setActiveTab(val as "personal" | "business")}
				className="w-full">
				<TabsList className="mb-4 grid w-full grid-cols-2">
					<TabsTrigger value="personal">Personal</TabsTrigger>
					<TabsTrigger value="business">Business</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<>
						{loadingPersonal ? (
							<>
								<AddressSkeleton />
								<AddressSkeleton />
							</>
						) : !personalAddresses?.length ? (
							<p className="text-muted-foreground">
								No personal addresses found.
							</p>
						) : (
							renderAddresses(personalAddresses)
						)}
					</>
				</TabsContent>

				<TabsContent value="business">
					<>
						{loadingBusiness ? (
							<>
								<AddressSkeleton />
								<AddressSkeleton />
							</>
						) : !businessAddresses?.length ? (
							<p className="text-muted-foreground">
								No business addresses found.
							</p>
						) : (
							renderAddresses(businessAddresses)
						)}
					</>
				</TabsContent>
			</Tabs>
		</div>
	);
}
