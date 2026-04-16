"use client";

import React, { ReactNode, useEffect, useMemo } from "react";

import Header from "@/components/layouts/Header/Header";
import { ScrollRestoreOnRoute } from "@/components/navigation/scroll-restore-on-route";
import { OnboardingModal } from "@/components/ui/dialogs/onboarding-modal";
import { UserStateBanner } from "@/components/user-state-banner";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { cn } from "@/lib/utils";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import { usePathname } from "next/navigation";

export default function Main({ children }: { children?: ReactNode }) {
	const pathname = usePathname();
	const { isOpen, setIsOpen } = useNavMenuStore();
	const { data: profile, isLoading } = useGetProfileData();
	const [onboardingCompleted, setOnboardingCompleted] = React.useState(false);

	useEffect(() => {
		setIsOpen(false);
	}, [pathname, setIsOpen]);

	// Check if user needs onboarding based on userstate
	const isNewUser = useMemo(() => {
		if (!profile || isLoading) return false;
		if (onboardingCompleted) return false;
		return profile.userstate === "new";
	}, [profile, isLoading, onboardingCompleted]);

	return (
		<div className="relative flex h-dvh flex-col overflow-hidden">
			<div className="relative z-50 shrink-0">
				<Header profile={profile} />
				<UserStateBanner />
			</div>
			<div
				id="app-scroll-container"
				className={cn(
					"min-h-0 flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300",
					pathname?.includes("/profile") ? "bg-[#E8EAE9]" : "bg-background",
					isOpen && "pointer-events-none blur-xs",
				)}>
				<ScrollRestoreOnRoute />
				<div className="container mx-auto">{children}</div>
			</div>
			<OnboardingModal
				isOpen={true}
				onClose={() => {
					setOnboardingCompleted(true);
				}}
			/>
		</div>
	);
}
