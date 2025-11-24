"use client";

import { useEffect, useState } from "react";

import { SHOW_ONLY_HOSE_MANAGEMENT_CUSTOMER_NUMBER } from "@/constants/checkout";
import { triggerProfileRefetch } from "@/hooks/usePunchoutProfile";
import axiosClient from "@/services/axiosClient";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function PunchoutSessionPage() {
	const params = useParams();
	const router = useRouter();

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

				await signOut({ redirect: false });

				await new Promise((resolve) => setTimeout(resolve, 200));

				const { data: user } = await axiosClient.get("/user");

				triggerProfileRefetch();

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
	}, [sessionId, router]);

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
