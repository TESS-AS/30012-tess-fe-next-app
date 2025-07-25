"use client";

import { useEffect, useState } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import axiosClient from "@/services/axiosClient";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";

export default function PunchoutSessionPage() {
	const params = useParams();

	const sessionId = Array.isArray(params.sessionId)
		? params.sessionId[0]
		: params.sessionId;

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) return;

		const authenticatePunchOut = async () => {
			try {
				await axiosClient.post("/logout");
				await signOut({ redirect: false });

				await axiosClient.post(
					"/login/validatepunchout",
					{},
					{
						headers: {
							Authorization: `Bearer ${sessionId}`,
						},
						withCredentials: true,
					},
				);

				await axiosClient.get("/user");

				window.location.href = "/";
			} catch (err) {
				console.error("PunchOut token validation failed", err);
				setError("Failed to authenticate PunchOut session.");
			}
		};

		authenticatePunchOut();
	}, [sessionId]);

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
