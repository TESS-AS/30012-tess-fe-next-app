"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";
import { Separator } from "@radix-ui/react-select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthDialog({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();

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
				<div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
					<div className="flex h-full flex-col items-center justify-center bg-[#0F1912] p-10">
						<div className="align-left flex w-full flex-col justify-start">
							<p className="mb-4 text-left text-xl font-bold text-white">
								Velkommen
							</p>
							<p className="text-left text-sm font-normal text-white">
								Velg hvordan du vil logge inn.
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
								Logg inn med jobbkonto (SSO)
							</Button>
							<p className="mt-2 text-left text-xs text-white">
								For partnere og TESS-ansatte med organisasjonskonto
							</p>
							<div className="mt-4 flex items-center gap-4">
								<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
								<span className="text-sm text-[#5A615D]">eller</span>
								<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
							</div>
							<Button
								variant="outline"
								className="mt-4 w-full"
								onClick={() => signIn("microsoft-entra-id-tenant")}>
								Logg inn/Opprett e-handels konto
							</Button>
							<p className="mt-2 text-left text-xs text-white">
								Kun for partnere uten organisasjonskonto
							</p>
							<p className="mt-4 text-left text-sm text-white">
								Får du ikke logget inn?{" "}
								<Link
									className="text-[#1DC65A] underline"
									href="/contact">
									Kontakt support
								</Link>
							</p>
						</div>

						<p className="flex-end absolute bottom-4 text-center text-xs text-[#C1C4C2]">
							2025 TESS
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
									src="/images/Flagg.svg"
									alt="Flagg"
									width={32}
									height={32}
									className="ml-4"
								/>
							</div>
							<div className="mt-2 mb-3 flex w-[330px] flex-col justify-end">
								<p className="mb-2 text-2xl font-bold text-white">
									Ærlig, pålitelig og profesjonell
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
								Hos TESS møter du fagfolk både foran og bak disken. Vi gir deg
								markedets beste tilgjengelighet med over 130 lokale
								servicesentre.
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
