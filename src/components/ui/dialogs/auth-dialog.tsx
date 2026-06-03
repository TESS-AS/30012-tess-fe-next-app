"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { baseURL } from "@/lib/axiosConfig";
import { User, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AuthDialog({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const t = useTranslations();
	const [authenticatingProvider, setAuthenticatingProvider] = useState<
		string | null
	>(null);

	const closeDialog = () => {
		const params = new URLSearchParams(window.location.search);
		params.delete("auth");
		router.replace("?" + params.toString(), { scroll: false });
		setAuthenticatingProvider(null);
		onOpenChange(false);
	};

	const handleLoginWithBESso = () => {
		setAuthenticatingProvider("be-sso");
		const returnTo = encodeURIComponent(window.location.origin);
		window.location.href = `${baseURL}/auth/sso?returnTo=${returnTo}`;
	};

	const handleLoginWithTenantBe = () => {
		setAuthenticatingProvider("tenant-be");
		const returnTo = encodeURIComponent(window.location.origin);
		window.location.href = `${baseURL}/auth/tenant?returnTo=${returnTo}`;
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={closeDialog}>
			<DialogContent className="h-10/12 min-w-10/12 rounded-lg border-none p-0 shadow-xl">
				<DialogHeader className="hidden">
					<DialogTitle></DialogTitle>
				</DialogHeader>

				<div
					className="fixed inset-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage: "url('/images/log-in-image.svg')",
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				/>

				<div className="pointer-events-none fixed inset-0 z-[5] flex items-start justify-center pt-8">
					<Image
						src="/images/logo-white.svg"
						alt="TESS"
						width={320}
						height={72}
						priority
					/>
				</div>

				<div className="relative z-10 flex min-h-screen items-center justify-center px-8 py-8">
					{authenticatingProvider ? (
						<div className="w-full max-w-md bg-white p-8">
							<p className="text-center text-sm text-black">
								Et øyeblikk, vi sjekker at alt stemmer …
							</p>
						</div>
					) : (
						<div className="w-full max-w-md bg-white p-8">
							<h2 className="mb-2 text-xl font-bold text-black">
								{t("AuthDialog.welcome")}
							</h2>

							<p className="mb-3 text-sm text-black">
								{t("AuthDialog.welcomeDescription")}{" "}
							</p>

							<div className="mb-6 rounded-md bg-[#F0FCF2] p-4">
								<Button
									variant="outlineGrey"
									className="text-md mb-2 h-[52px] w-full"
									onClick={handleLoginWithTenantBe}>
									<User
										className="mr-2 h-4 w-4"
										fill="currentColor"
										stroke="none"
									/>
									{t("AuthDialog.loginOrCreateUser")}
								</Button>

								<div className="text- flex items-center gap-2 text-sm text-black">
									<Info className="h-4 w-4 text-[#009640]" />
									{t("AuthDialog.forPrivateAndBusiness")}
								</div>
							</div>

							<div className="mb-6 flex items-center gap-4">
								<div className="h-px flex-1 bg-gray-500" />
								<span className="text-sm">{t("AuthDialog.or")}</span>
								<div className="h-px flex-1 bg-gray-500" />
							</div>

							<div className="mb-6 rounded-md bg-[#F8F9F8] p-4">
								<Button
									variant="outlineGrey"
									className="text-md h-[52px] w-full"
									onClick={handleLoginWithBESso}>
									{t("AuthDialog.loginAs")}
								</Button>
							</div>

							<div className="text-center text-sm text-black">
								{t("AuthDialog.needHelp")}{" "}
								<a
									className="text-[#009640] underline hover:text-[#005522]"
									href="mailto:netthandel@tess.no">
									{t("AuthDialog.contactUs")}
								</a>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
