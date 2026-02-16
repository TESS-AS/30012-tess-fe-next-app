"use client";

import { useState } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export function UserStateBanner() {
	const t = useTranslations("UserStateBanner");
	const { data: profile } = useGetProfileData();
	const [dismissed, setDismissed] = useState(false);

	const userstate = profile?.userstate;
	const showConnected = userstate === "connected" && !dismissed;
	const showOnboarding = userstate === "onboarding" && !dismissed;

	const handleDismiss = () => {
		setDismissed(true);
	};

	// Debug: log the userstate to help troubleshoot
	if (typeof window !== "undefined" && userstate) {
		console.log("UserStateBanner - userstate:", userstate);
	}

	// Check onboarding first - shows yellow banner with connecting message
	if (showOnboarding) {
		const firstName = profile?.firstName ?? "";
		return (
			<div className="flex w-full items-center justify-between gap-4 bg-yellow-100 px-4 py-3">
				<div className="container mx-auto flex-1 px-5 pr-8">
					<p className="font-bold text-gray-900">
						{t("connecting.greeting", { name: firstName })}
					</p>
					<p className="mt-1 text-sm text-gray-800">
						{t("connecting.message")}
					</p>
				</div>
				<button
					type="button"
					onClick={handleDismiss}
					className="shrink-0 rounded p-1 text-gray-600 hover:bg-black/5"
					aria-label="Lukk">
					<X className="h-5 w-5" />
				</button>
			</div>
		);
	}

	if (showConnected) {
		return (
			<div className="flex w-full items-center justify-between gap-4 bg-[#DCF7E0] px-4 py-3">
				<div className="container mx-auto flex-1 px-5 pr-8">
					<p className="font-semibold text-gray-900">{t("connected.title")}</p>
					<p className="mt-1 text-sm text-gray-800">{t("connected.message")}</p>
				</div>
				<button
					type="button"
					onClick={handleDismiss}
					className="shrink-0 rounded p-1 text-gray-600 hover:bg-black/5"
					aria-label="Lukk">
					<X className="h-5 w-5" />
				</button>
			</div>
		);
	}

	return null;
}
