"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";
import { Separator } from "@radix-ui/react-select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

	const closeDialog = () => {
		const params = new URLSearchParams(window.location.search);
		params.delete("auth");
		router.replace("?" + params.toString(), { scroll: false });
		onOpenChange(false);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={closeDialog}>
			<DialogContent className="h-[80vh] w-full max-w-[90vw] min-w-[960px] overflow-hidden rounded-xl border-none p-0 shadow-xl">
				<DialogHeader className="hidden">
					<DialogTitle></DialogTitle>
				</DialogHeader>
				<div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
					<div className="flex h-full flex-col items-center justify-center bg-[#0F1912] p-10">
						<div className="align-left flex w-full flex-col justify-start">
							<p className="mb-4 text-left text-xl font-bold text-white">
								{t("AuthDialog.welcome")}
							</p>
							<p className="text-left text-sm font-normal text-white">
								{t("AuthDialog.welcomeDescription")}
							</p>
							<Button
								variant="default"
								className="mt-4 w-full"
								onClick={() =>
									signIn("microsoft-entra-id", { prompt: "select_account" })
								}>
								<Image
									src="/images/Microsoft.svg"
									alt="Microsoft"
									className="mr-1"
									width={16}
									height={16}
								/>
								{t("AuthDialog.loginWithMicrosoft")}
							</Button>
							<p className="mt-2 text-left text-xs text-white">
								{t("AuthDialog.loginWithMicrosoftDescription")}
							</p>
							<div className="mt-4 flex items-center gap-4">
								<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
								<span className="text-sm text-[#5A615D]">
									{t("AuthDialog.or")}
								</span>
								<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
							</div>
							<Button
								variant="outline"
								className="mt-4 w-full text-white"
								onClick={() => signIn("microsoft-entra-id-tenant")}>
								{t("AuthDialog.loginWithMicrosoftTenant")}
							</Button>
							<p className="mt-2 text-left text-xs text-white">
								{t("AuthDialog.loginWithMicrosoftTenantDescription")}
							</p>
							<p className="mt-4 text-left text-sm text-white">
								{t("AuthDialog.contactSupport")}{" "}
								<Link
									className="text-[#1DC65A] underline"
									href="/contact">
									{t("AuthDialog.contactSupportLink")}
								</Link>
							</p>
						</div>

						<p className="flex-end text-lightGray absolute bottom-4 text-center text-xs">
							{t("AuthDialog.copyright")}
						</p>
					</div>
					<div
						className="relative hidden h-full flex-col justify-between p-10 text-white md:flex"
						style={{
							backgroundImage: "url('/images/background.svg')",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}>
						<div className="align-center z-10 flex h-full flex-col justify-center">
							<div className="mb-2 flex items-end">
								<Image
									src="/images/logo-white.svg"
									alt="TEss logo"
									width={200}
									height={200}
								/>
								<Image
									src="/icons/Flagg.svg"
									alt="Flagg"
									width={32}
									height={32}
									className="ml-4"
								/>
							</div>
							<div className="mt-2 mb-3 flex w-[330px] flex-col justify-end">
								<p className="mb-2 text-2xl font-bold text-white">
									{t("AuthDialog.honest")}
								</p>
								<Image
									className="ml-auto text-right"
									src="/images/Parallellogram.svg"
									alt="Parallellogram"
									width={100}
									height={100}
								/>
							</div>
							<p className="text-xs font-bold text-white">
								{t("AuthDialog.honestDescription")}
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
