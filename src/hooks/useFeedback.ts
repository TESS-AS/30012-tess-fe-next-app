// hooks/useFeedback.ts

import { useState } from "react";

import { SUPPORT_EMAIL_RECIPIENT } from "@/lib/email-templates";
import axiosClient from "@/services/axiosClient";

export type FeedbackType = "Ris" | "Ros" | "Forslag" | "Checkout" | "FAQ";

export interface FeedbackEmailOptions {
	subject?: string;
	htmlBody?: string;
}

export function useFeedback(): {
	success: boolean;
	submitFeedback: (
		type: FeedbackType,
		message: string,
		emailOptions?: FeedbackEmailOptions,
	) => Promise<void>;
	loading: boolean;
	error: string | null;
} {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const submitFeedback = async (
		type: FeedbackType,
		message: string,
		emailOptions?: FeedbackEmailOptions,
	) => {
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			await axiosClient.post(`/feedback/${type}`, { message });

			const formData = new FormData();
			formData.append("toEmail", SUPPORT_EMAIL_RECIPIENT);
			formData.append(
				"subject",
				emailOptions?.subject ?? `Tilbakemelding: ${type}`,
			);
			if (emailOptions?.htmlBody) {
				formData.append("htmlBody", emailOptions.htmlBody);
			} else {
				formData.append("plainTextBody", message);
			}
			formData.append("category", "Feedback");

			await axiosClient.post("/sendgrid/sendEmail", formData);

			setSuccess(true);
		} catch (err: any) {
			setError(err?.response?.data?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return { submitFeedback, loading, error, success };
}
