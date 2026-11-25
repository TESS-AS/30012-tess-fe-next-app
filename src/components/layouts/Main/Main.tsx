"use client";

import React, { ReactNode, useEffect, useMemo } from "react";

import { Footer } from "@/components/layouts/Footer/Footer";
import Header from "@/components/layouts/Header/Header";
import { ScrollRestoreOnRoute } from "@/components/navigation/scroll-restore-on-route";
import { OnboardingModal } from "@/components/ui/dialogs/onboarding-modal";
import { UserStateBanner } from "@/components/user-state-banner";
import { useGetProfileData } from "@/hooks/useGetProfileData";
import { isTessEmployeeEmail } from "@/lib/user";
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
		// Internal TESS employees are provisioned through a different flow
		// and skip the velkommen/onboarding modal entirely.
		if (isTessEmployeeEmail(profile.email)) return false;
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
				style={{ scrollbarGutter: "stable" }}
				className={cn(
					"min-h-0 flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300",
					pathname?.includes("/profile") ? "bg-[#E8EAE9]" : "bg-background",
					isOpen && "pointer-events-none blur-xs",
				)}>
				<ScrollRestoreOnRoute />
				{/* Flex column with min-h-full keeps the Footer glued to the
				    bottom of the viewport during route transitions — while a
				    new page's data is in flight, {children} may render as null
				    for a tick. Without flex-1 reserving space, the Footer
				    would flash up right under the header until the new page
				    paints. */}
				<div className="flex min-h-full flex-col">
					<div className="container mx-auto flex-1">{children}</div>
					<Footer />
				</div>
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
