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
		<div className="flex flex-col">
			{isLoggedIn && (
				<div className="order-2 lg:order-1">
					<MainCategorySection />
				</div>
			)}
			<div className="order-1 lg:order-2">
				<HomeBanner />
			</div>
		</div>
	);
}
