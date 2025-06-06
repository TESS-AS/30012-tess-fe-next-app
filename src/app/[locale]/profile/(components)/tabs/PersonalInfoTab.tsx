"use client";

import { useEffect } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import {
	profileSchema,
	ProfileFormValues,
} from "@/lib/validation/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function PersonalInfoTab() {
	const { data: profile } = useGetProfileData();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
	});

	useEffect(() => {
		if (profile) {
			setValue("firstName", profile.firstName || "");
			setValue("lastName", profile.lastName || "");
			setValue("email", profile.email || "");
			setValue("phoneNumber", profile.phoneNumber || "");
		}
	}, [profile, setValue]);

	const onSubmit = () => {
		// TODO: Handle profile update
	};

	return (
		<div className="rounded-lg border p-6 shadow-sm">
			<h2 className="mb-4 text-xl font-semibold">Your Personal Info</h2>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<label className="mb-1 block text-sm font-medium">First Name *</label>
					<input
						{...register("firstName")}
						className="w-full rounded-md border px-3 py-2"
					/>
					{errors.firstName && (
						<p className="text-sm text-red-500">{errors.firstName.message}</p>
					)}
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium">Last Name *</label>
					<input
						{...register("lastName")}
						className="w-full rounded-md border px-3 py-2"
					/>
					{errors.lastName && (
						<p className="text-sm text-red-500">{errors.lastName.message}</p>
					)}
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium">Email *</label>
					<input
						{...register("email")}
						className="w-full rounded-md border px-3 py-2"
						disabled
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium">Phone Number</label>
					<input
						{...register("phoneNumber")}
						className="w-full rounded-md border px-3 py-2"
					/>
					{errors.phoneNumber && (
						<p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
					)}
				</div>

				<div className="col-span-1">
					<label className="mb-1 block text-sm font-medium">
						Customer Numbers
					</label>
					<div className="rounded-md border bg-gray-100 p-3 text-sm">
						{Array.isArray(profile?.customerNumbers) &&
						profile?.customerNumbers.length > 0
							? profile.customerNumbers.join(", ")
							: "No customer numbers assigned"}
					</div>
				</div>

				<div className="col-span-2 flex justify-end">
					<button
						type="submit"
						className="rounded-full bg-green-600 px-6 py-2 font-semibold text-white">
						Update Profile
					</button>
				</div>
			</form>
		</div>
	);
}
