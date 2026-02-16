"use client";

import MainCategorySection from "@/components/categories/main-categories";
import { HomeBanner } from "@/components/home/home-banner";
import { useGetProfileData } from "@/hooks/useGetProfileData";

/**
 * Renders HomeBanner and conditionally MainCategorySection when logged in.
 * When logged in: MainCategorySection is shown above HomeBanner.
 * When not logged in: only HomeBanner is shown.
 */
export function HomeBannerWithCategories() {
	const { data: profile } = useGetProfileData();
	const isLoggedIn = !!profile;

	return (
		<>
			{isLoggedIn && <MainCategorySection />}
			<HomeBanner />
		</>
	);
}
