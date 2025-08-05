"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import Header from "@/components/layouts/Header/Header";

export default function Main({ children }: { children?: ReactNode }) {
	const pathname = usePathname();
	return (
		<div className="relative flex flex-1 flex-col min-md:overflow-hidden">
			<Header />
			<div className={cn(
				"h-[calc(100vh-114px)] overflow-x-hidden overflow-y-auto",
				pathname?.includes("/profile") ? "bg-[#E8EAE9]" : "bg-background"
			)}>
				<div className="container mx-auto">{children}</div>
			</div>
		</div>
	);
}
