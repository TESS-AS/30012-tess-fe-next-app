"use client";

import { useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants/profileTabs";
import { profileSchema } from "@/lib/validation/profileSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

export default function ProfilePage() {
	const { data: session } = useSession();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(profileSchema),
	});

	useEffect(() => {
		if (session?.user) {
			const [first, last] = session.user.name?.split(" ") ?? [];
			setValue("firstName", first || "");
			setValue("lastName", last || "");
			setValue("email", session.user.email || "");
		}
	}, [session, setValue]);

	const onSubmit = () => {
		//TODO: I will implement the profile data submission here
	};

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
									className="w-full justify-start gap-2 hover:text-green-600 data-[state=active]:text-green-600">
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
							<div className="rounded-lg border p-6 shadow-sm">
								<h2 className="mb-4 text-xl font-semibold">
									Your Personal Info
								</h2>
								<form
									onSubmit={handleSubmit(onSubmit)}
									className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div>
										<label className="mb-1 block text-sm font-medium">
											First Name *
										</label>
										<input
											{...register("firstName")}
											className="w-full rounded-md border px-3 py-2"
										/>
										{errors.firstName && (
											<p className="text-sm text-red-500">
												{errors.firstName.message}
											</p>
										)}
									</div>
									<div>
										<label className="mb-1 block text-sm font-medium">
											Last Name *
										</label>
										<input
											{...register("lastName")}
											className="w-full rounded-md border px-3 py-2"
										/>
										{errors.lastName && (
											<p className="text-sm text-red-500">
												{errors.lastName.message}
											</p>
										)}
									</div>
									<div>
										<label className="mb-1 block text-sm font-medium">
											Email *
										</label>
										<input
											{...register("email")}
											className="w-full rounded-md border px-3 py-2"
											disabled
										/>
									</div>
									<div>
										<label className="mb-1 block text-sm font-medium">
											Date of Birth
										</label>
										<input
											{...register("dateOfBirth")}
											className="w-full rounded-md border px-3 py-2"
											placeholder="DD/MM/YYYY"
										/>
									</div>
									<div className="col-span-2">
										<label className="mb-1 block text-sm font-medium">
											Gender
										</label>
										<div className="mt-1 flex gap-4">
											<label className="flex items-center gap-2">
												<input
													type="radio"
													value="male"
													{...register("gender")}
												/>
												Male
											</label>
											<label className="flex items-center gap-2">
												<input
													type="radio"
													value="female"
													{...register("gender")}
												/>
												Female
											</label>
										</div>
										{errors.gender && (
											<p className="text-sm text-red-500">
												{errors.gender.message}
											</p>
										)}
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
						</TabsContent>

						<TabsContent value="addresses">
							<p className="text-muted-foreground">
								Address management coming soon.
							</p>
						</TabsContent>

						<TabsContent value="orders">
							<p className="text-muted-foreground">
								Order history coming soon.
							</p>
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
