"use client";

import React, { createContext, useContext, useMemo } from "react";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import { usePunchoutProfile } from "@/hooks/usePunchoutProfile";
import { ProfileUser } from "@/types/user.types";

interface ProfileContextValue {
	profile: ProfileUser | null;
	isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
	undefined,
);

export const ProfileProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { data: ssoProfile, isLoading: isSSOLoading } = useGetProfileData();
	const { data: punchoutProfile, isLoading: isPunchoutLoading } =
		usePunchoutProfile();

	// Memoize the profile selection to prevent unnecessary re-renders
	const profileData = useMemo(() => {
		if (punchoutProfile?.punchout === true) {
			return {
				profile: punchoutProfile,
				isLoading: isPunchoutLoading,
			};
		} else if (ssoProfile) {
			return {
				profile: ssoProfile,
				isLoading: isSSOLoading,
			};
		}
		return {
			profile: null,
			isLoading: isSSOLoading || isPunchoutLoading,
		};
	}, [ssoProfile, punchoutProfile, isSSOLoading, isPunchoutLoading]);

	return (
		<ProfileContext.Provider value={profileData}>
			{children}
		</ProfileContext.Provider>
	);
};

export const useProfile = (): ProfileContextValue => {
	const context = useContext(ProfileContext);
	if (!context) {
		throw new Error("useProfile must be used within a ProfileProvider");
	}
	return context;
};
