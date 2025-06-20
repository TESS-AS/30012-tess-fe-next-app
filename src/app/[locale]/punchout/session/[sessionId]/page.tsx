"use client";

import { useEffect, useState } from "react";

import axiosClient from "@/services/axiosClient";
import { useParams, useRouter } from "next/navigation";

export default function PunchoutSessionPage() {
	const router = useRouter();
	const params = useParams();

	const sessionId = Array.isArray(params.sessionId)
		? params.sessionId[0]
		: params.sessionId;

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) return;

		const validate = async () => {
			try {
				await axiosClient.post("/logout");

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

				router.replace("/");
			} catch (err) {
				console.error("PunchOut token validation failed", err);
				setError("Failed to authenticate PunchOut session.");
			}
		};

		validate();
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
