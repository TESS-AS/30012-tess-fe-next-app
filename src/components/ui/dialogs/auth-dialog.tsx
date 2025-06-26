"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthDialog({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [tab, setTab] = useState<"login" | "register">("login");
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const mode = searchParams.get("auth");
		if (mode === "register") setTab("register");
		else setTab("login");
	}, [searchParams]);

	const switchTab = (newTab: "login" | "register") => {
		setTab(newTab);
		const params = new URLSearchParams(window.location.search);
		params.set("auth", newTab);
		router.replace("?" + params.toString(), { scroll: false });
	};

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
					<div
						className="relative hidden flex-col justify-between p-10 text-white md:flex"
						style={{
							backgroundImage: "url('/images/tess-login.jpg')",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}>
						<div className="absolute inset-0 z-0 bg-black/60" />
					</div>

					<div className="flex h-full flex-col p-10">
						<Tabs
							value={tab}
							onValueChange={(val) => switchTab(val as "login" | "register")}
							className="flex h-full flex-col">
							<div className="mb-6">
								<TabsList className="w-full">
									<TabsTrigger value="login">Login</TabsTrigger>
									<TabsTrigger value="register">Register</TabsTrigger>
								</TabsList>
							</div>
							<div className="flex flex-1 items-center justify-center">
								<TabsContent
									value="login"
									className="w-full max-w-md">
									<DialogTitle className="mb-4 text-2xl font-bold">
										Welcome back
									</DialogTitle>
									<form className="space-y-4">
										<Input
											type="email"
											placeholder="Email"
											required
										/>
										<Input
											type="password"
											placeholder="Password"
											required
										/>
										<Button
											variant="green"
											className="w-full">
											Sign In
										</Button>
									</form>
									<div className="text-muted-foreground mt-6 text-center text-sm">
										or
									</div>
									<Button
										variant="outline"
										className="mt-4 w-full"
										onClick={() => signIn("microsoft-entra-id",{prompt: "select_acount"})}>
										Sign in with Microsoft
									</Button>
								</TabsContent>

								<TabsContent
									value="register"
									className="w-full max-w-md">
									<h2 className="mb-4 text-2xl font-bold">Create an account</h2>
									<form className="space-y-4">
										<Input
											type="text"
											placeholder="Full Name"
											required
										/>
										<Input
											type="email"
											placeholder="Email"
											required
										/>
										<Input
											type="password"
											placeholder="Password"
											required
										/>
										<Button
											variant="green"
											className="w-full">
											Sign Up
										</Button>
									</form>
								</TabsContent>
							</div>
						</Tabs>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
