"use client";

import { useEffect, useState } from "react";

import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { profileKeys } from "@/hooks/useGetProfileData";
import {
	clearPunchoutProfile,
	triggerProfileRefetch,
} from "@/hooks/usePunchoutProfile";
import { useCategories } from "@/lib/CategoriesProvider";
import axiosClient from "@/services/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function PunchoutSessionPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { refetch: refetchCategories } = useCategories();

	const sessionId = Array.isArray(params.sessionId)
		? params.sessionId[0]
		: params.sessionId;

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) return;

		const authenticatePunchOut = async () => {
			try {
				const response = await axiosClient.post(
					"/login/validatepunchout",
					{},
					{
						headers: {
							Authorization: `Bearer ${sessionId}`,
						},
						withCredentials: true,
					},
				);
				localStorage.removeItem("hosesAndEquipments_page");

				clearPunchoutProfile();
				queryClient.invalidateQueries({
					queryKey: profileKeys.detail(),
				});
				queryClient.removeQueries({
					queryKey: profileKeys.detail(),
				});

				await new Promise((resolve) => setTimeout(resolve, 200));

				const { data: user } = await axiosClient.get("/user");

				triggerProfileRefetch();

				await refetchCategories();

				await new Promise((resolve) => setTimeout(resolve, 500));

				router.refresh();

				await new Promise((resolve) => setTimeout(resolve, 200));

				if (
					user[0]?.defaultCustomerNumber ===
					SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER
				) {
					router.push("/profile");
				} else {
					router.push("/");
				}
			} catch (err) {
				console.error("PunchOut token validation failed", err);
				setError("Failed to authenticate PunchOut session.");
			}
		};

		authenticatePunchOut();
	}, [sessionId, router, queryClient]);

	return (
		<main className="p-8">
			<h1 className="text-xl font-bold">PunchOut Authentication</h1>
			{error ? (
				<p className="mt-4 text-red-600">{error}</p>
			) : (
				<p className="text-muted-foreground mt-2">Authenticating session...</p>
			)}
		</main>
	);
}
