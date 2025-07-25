// hooks/useFeedback.ts

import { useState } from "react";

import axiosClient from "@/services/axiosClient";

export type FeedbackType = "Ris" | "Ros" | "Forslag";

export function useFeedback(): {
	success: boolean;
	submitFeedback: (type: FeedbackType, message: string) => Promise<void>;
	loading: boolean;
	error: string | null;
} {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const submitFeedback = async (type: FeedbackType, message: string) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			await axiosClient.post(`/feedback/${type}`, { message });
			setSuccess(true);
		} catch (err: any) {
			setError(err?.response?.data?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return { submitFeedback, loading, error, success };
}
