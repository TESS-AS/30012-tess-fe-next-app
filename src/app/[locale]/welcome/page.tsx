"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	EQUINOR_WELCOME_DISMISSED_KEY,
	EQUINOR_WELCOME_SEEN_THIS_SESSION_KEY,
} from "@/constants/equinorWelcome";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function EquinorWelcomePage() {
	const t = useTranslations("HosesAndEquipments.welcome");
	const router = useRouter();
	const [dontShowAgain, setDontShowAgain] = useState(false);

	const handleContinue = () => {
		if (typeof window !== "undefined") {
			if (dontShowAgain) {
				localStorage.setItem(EQUINOR_WELCOME_DISMISSED_KEY, "true");
			}
			sessionStorage.setItem(EQUINOR_WELCOME_SEEN_THIS_SESSION_KEY, "true");
		}
		router.replace("/profile?tab=hose-orders");
	};

	return (
		<div className="relative left-1/2 right-1/2 -mx-[50vw] flex w-screen min-h-[calc(100dvh-80px)] items-center justify-center">
			<Image
				src="/images/equinor-bg.png"
				alt=""
				fill
				priority
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-black/70" />
			<div className="relative z-10 mx-4 w-full max-w-[520px] rounded-md bg-white p-8 shadow-xl">
				<h1 className="mb-3 text-2xl font-semibold text-[#0F1912]">
					{t("title")}
				</h1>
				<p className="mb-4 text-sm leading-relaxed text-[#0F1912]">
					{t("intro")}
				</p>
				<p className="mb-3 text-sm leading-relaxed text-[#0F1912]">
					<span className="font-semibold">{t("checkIds")}</span>{" "}
					{t("checkIdsTail")}
				</p>
				<p className="mb-6 text-sm leading-relaxed text-[#0F1912]">
					<span className="font-semibold">{t("incompleteHoses")}</span>{" "}
					{t("incompleteHosesTail")}
				</p>
				<label className="mb-6 flex cursor-pointer items-center gap-2 text-sm text-[#0F1912]">
					<Checkbox
						checked={dontShowAgain}
						onCheckedChange={(checked) => setDontShowAgain(checked === true)}
					/>
					{t("dontShowAgain")}
				</label>
				<Button
					type="button"
					onClick={handleContinue}
					className="h-12 w-full bg-[#009640] text-base font-medium text-white hover:bg-[#007A33]">
					{t("cta")}
				</Button>
			</div>
		</div>
	);
}
