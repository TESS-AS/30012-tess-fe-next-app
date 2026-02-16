"use client";

import { useGetProfileData } from "@/hooks/useGetProfileData";
import { Link } from "@/i18n/navigation";
import { useAppContext } from "@/lib/appContext";
import Image from "next/image";
import { useTranslations } from "next-intl";

const SUPPORT_EMAIL = "netthandel@tess.no";

export function WelcomeSection() {
	const t = useTranslations("Home.welcome");
	const { setIsAuthOpen } = useAppContext();
	const { data: profile } = useGetProfileData();

	// Only show welcome section if user is not logged in
	if (profile) {
		return null;
	}

	return (
		<section className="relative right-1/2 left-1/2 -mx-[50vw] w-screen bg-white pt-20 pb-10">
			<div className="container mx-auto">
				<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
					{/* Left: text content */}
					<div className="flex flex-col justify-center px-4">
						<div className="max-w-xl space-y-8">
							<div className="space-y-4">
								<h1 className="text-5xl font-normal tracking-tight text-gray-900 lg:text-6xl">
									{t("titlePart1")}
									<br />
									{t("titlePart2")}
								</h1>
								<p className="text-xl leading-relaxed font-normal text-gray-500">
									{t("intro")}
								</p>
							</div>

							<div className="space-y-6">
								<div className="space-y-2">
									<h2 className="text-xl font-semibold text-gray-500">
										{t("haveUser")}
									</h2>
									<button
										type="button"
										onClick={() => setIsAuthOpen(true)}
										className="rounded text-xl font-normal text-green-700 underline-offset-4 hover:underline focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none">
										{t("logIn")}
									</button>
								</div>

								<div className="space-y-2">
									<h2 className="text-xl font-semibold text-gray-500">
										{t("missingAccess")}
									</h2>
									<button
										type="button"
										onClick={() => setIsAuthOpen(true)}
										className="rounded text-xl font-normal text-green-700 underline-offset-4 hover:underline focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none">
										{t("createAccount")}
									</button>
								</div>

								<div className="space-y-2">
									<h2 className="text-xl font-semibold text-gray-500">
										{t("needHelp")}
									</h2>
									<p className="text-xl text-gray-700">
										{t("see")}{" "}
										<Link
											href="/faq"
											className="font-normal text-green-700 underline-offset-4 hover:underline">
											{t("faq")}
										</Link>{" "}
										{t("orContactUs")}{" "}
										<a
											href={`mailto:${SUPPORT_EMAIL}`}
											className="font-normal text-green-700 underline-offset-4 hover:underline">
											{SUPPORT_EMAIL}
										</a>
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right: image */}
					<div className="flex justify-center px-4 lg:justify-end">
						<Image
							src="/images/onboard-image.png"
							alt=""
							width={600}
							height={338}
							className="object-contain"
							priority
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
