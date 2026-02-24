"use client";

import React, { ReactNode, useEffect, useMemo } from "react";

import Header from "@/components/layouts/Header/Header";
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

	// Fixed 182px to prevent CLS when profile loads (header always reserves 182px)
	const headerHeight = 182;

	return (
		<div className="relative flex flex-1 flex-col min-md:overflow-hidden">
			<div className="relative z-50">
				<Header profile={profile} />
				<UserStateBanner />
			</div>
			<div
				className={cn(
					"overflow-x-hidden overflow-y-auto transition-all duration-300",
					pathname?.includes("/profile") ? "bg-[#E8EAE9]" : "bg-background",
					isOpen && "pointer-events-none blur-xs",
				)}
				style={{ height: `calc(100vh - ${headerHeight}px)` }}>
				<div className="container mx-auto">{children}</div>
			</div>
			<OnboardingModal
				isOpen={isNewUser}
				onClose={() => {
					setOnboardingCompleted(true);
				}}
			/>
		</div>
	);
}
