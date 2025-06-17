"use client";

import { useEffect, useState } from "react";

import { AddressSkeleton } from "@/app/[locale]/profile/(components)/tabs/skeletons/AddressSkeleton";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetBusinessAddresses } from "@/hooks/useGetBusinessAddresses";
import { useGetOrganizationAddresses } from "@/hooks/useGetOrganizationAddresses";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { useGetUserAdresses } from "@/hooks/useGetUserAdresses";
import { UserAddress } from "@/types/user.types";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import AddressModal from "./AddressModal";

export default function UserAddressesTab() {
	const [activeTab, setActiveTab] = useState<
		"personal" | "business" | "organization"
	>("personal");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
		null,
	);
	const [defaultType, setDefaultType] = useState<
		"personal" | "business" | "organization"
	>("personal");

	const ORG_NUMBER = "980386996"; // static for now

	const { data: profile } = useGetProfileData();
	const [selectedCustomerNumber, setSelectedCustomerNumber] = useState<
		string | undefined
	>(profile?.customerNumbers?.[0]);

	const {
		data: personalAddresses,
		isLoading: loadingPersonal,
		error: errorPersonal,
	} = useGetUserAdresses();
	const {
		data: businessAddresses,
		isLoading: loadingBusiness,
		error: errorBusiness,
	} = useGetBusinessAddresses(selectedCustomerNumber, activeTab === "business");

	const {
		data: orgAddresses,
		isLoading: loadingOrg,
		error: errorOrg,
	} = useGetOrganizationAddresses(
		activeTab === "organization" ? ORG_NUMBER : undefined,
	);

	useEffect(() => {
		if (profile?.customerNumbers?.length) {
			setSelectedCustomerNumber(profile.customerNumbers[0]);
		}
	}, [profile]);

	useEffect(() => {
		if (errorPersonal) toast.error("Failed to load personal addresses");
	}, [errorPersonal]);

	useEffect(() => {
		if (errorBusiness) toast.error("Failed to load business addresses");
	}, [errorBusiness]);

	useEffect(() => {
		if (errorOrg) toast.error("Failed to load organization addresses");
	}, [errorOrg]);

	const handleEdit = (address: UserAddress) => {
		setEditingAddress(address);
		setIsModalOpen(true);
	};

	const handleAdd = () => {
		setDefaultType(activeTab);
		setEditingAddress(null);
		setIsModalOpen(true);
	};

	const handleDelete = (addressId: number) => {
		toast.warning(`Delete address ID ${addressId}`);
	};

	const handleSave = (updated: UserAddress) => {
		toast.success(
			`${editingAddress ? "Updated" : "Added"} address: ${updated.addressName}`,
		);
	};

	const renderAddresses = (
		addresses: UserAddress[],
		layout: "cards" | "list" = "cards",
	) => {
		const isOrganization = activeTab === "organization";

		if (layout === "list") {
			return (
				<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
					{addresses.map((address) => (
						<div
							key={address.addressId}
							className="rounded-md border p-4 shadow-sm transition hover:shadow">
							<h3 className="text-sm font-semibold">{address.addressName}</h3>
							<p className="text-sm text-gray-700">
								{address.postalCode}, {address.city}
							</p>
							{!isOrganization && address.deliveryCode && (
								<p className="text-sm text-gray-500">
									Delivery Code: {address.deliveryCode}
								</p>
							)}
							{!isOrganization && address.condition && (
								<p className="text-sm text-gray-500">
									Condition: {address.condition}
								</p>
							)}
						</div>
					))}
				</div>
			);
		}

		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{addresses.map((address) => (
					<div
						key={address.addressId}
						className="relative rounded-md border border-gray-200 p-4 shadow-sm transition hover:shadow-md">
						{activeTab === "personal" && (
							<div className="absolute top-2 right-2 flex gap-2">
								<button
									onClick={() => handleEdit(address)}
									className="text-gray-500 hover:text-black"
									aria-label="Edit Address">
									<Pencil size={16} />
								</button>
								<button
									onClick={() => handleDelete(address.addressId)}
									className="text-gray-500 hover:text-red-600"
									aria-label="Delete Address">
									<Trash2 size={16} />
								</button>
							</div>
						)}
						<h3 className="mb-1 text-sm font-semibold">
							{address.addressName}
						</h3>
						<p className="text-sm text-gray-700">
							{address.postalCode}, {address.city}
						</p>
						{address.deliveryCode && (
							<p className="text-sm text-gray-500">
								Delivery Code: {address.deliveryCode}
							</p>
						)}
						{address.condition && (
							<p className="text-sm text-gray-500">
								Condition: {address.condition}
							</p>
						)}
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="space-y-6 rounded-lg border p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Your Addresses</h2>
				{activeTab !== "organization" && (
					<button
						onClick={handleAdd}
						className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 text-sm text-white">
						Add New Address
					</button>
				)}
			</div>

			<Tabs
				defaultValue="personal"
				value={activeTab}
				onValueChange={(val) =>
					setActiveTab(val as "personal" | "business" | "organization")
				}
				className="w-full">
				<TabsList className="mb-4 grid w-full grid-cols-3">
					<TabsTrigger value="personal">Personal</TabsTrigger>
					<TabsTrigger value="business">Business</TabsTrigger>
					<TabsTrigger value="organization">Organization</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<>
						{loadingPersonal ? (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								<AddressSkeleton />
								<AddressSkeleton />
							</div>
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
						{profile && profile.customerNumbers.length > 1 && (
							<div className="mb-4">
								<Label htmlFor="businessCustomerSelect">
									Select customer number
								</Label>
								<Select
									value={selectedCustomerNumber}
									onValueChange={setSelectedCustomerNumber}>
									<SelectTrigger
										id="businessCustomerSelect"
										className="w-full">
										<SelectValue placeholder="Select customer number" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<>
												{profile.customerNumbers.map((number) => (
													<SelectItem
														key={number}
														value={number}>
														{number}
													</SelectItem>
												))}
											</>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						)}

						{loadingBusiness ? (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								<AddressSkeleton />
								<AddressSkeleton />
							</div>
						) : !businessAddresses?.length ? (
							<p className="text-muted-foreground">
								No business addresses found.
							</p>
						) : (
							renderAddresses(businessAddresses)
						)}
					</>
				</TabsContent>

				<TabsContent value="organization">
					<>
						{loadingOrg ? (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								<AddressSkeleton />
								<AddressSkeleton />
							</div>
						) : !orgAddresses?.length ? (
							<p className="text-muted-foreground">
								No organization addresses found.
							</p>
						) : (
							renderAddresses(orgAddresses, "list")
						)}
					</>
				</TabsContent>
			</Tabs>

			<AddressModal
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				address={editingAddress}
				onSave={handleSave}
				defaultType={defaultType}
			/>
		</div>
	);
}
