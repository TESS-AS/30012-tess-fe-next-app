"use client";

import { useEffect, useState } from "react";

import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { profileKeys } from "@/hooks/useGetProfileData";
import {
	clearPunchoutProfile,
	triggerProfileRefetch,
} from "@/hooks/usePunchoutProfile";
import { useCategories } from "@/lib/CategoriesProvider";
import {
	extractS1FromUnknownPayload,
	rememberPunchoutS1,
} from "@/lib/equinor-s1-storage";
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

				const refreshedToken = response.data?.token;
				if (refreshedToken) {
					axiosClient.defaults.headers.common.Authorization = `Bearer ${refreshedToken}`;
				}

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
				const userProfile = Array.isArray(user) ? user[0] : user;

				// PBI 2584: remember S1/Lokasjon from punchout login payload
				const punchoutS1 =
					extractS1FromUnknownPayload(response.data) ??
					extractS1FromUnknownPayload(userProfile) ??
					extractS1FromUnknownPayload(user);
				if (
					userProfile?.defaultCustomerNumber ===
						SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER &&
					punchoutS1
				) {
					rememberPunchoutS1(punchoutS1);
				}

				triggerProfileRefetch();

				await refetchCategories();

				await new Promise((resolve) => setTimeout(resolve, 500));

				router.refresh();

				await new Promise((resolve) => setTimeout(resolve, 200));

				if (
					userProfile?.defaultCustomerNumber ===
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
