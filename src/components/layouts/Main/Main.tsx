"use client";

import { ReactNode, useEffect } from "react";

import Header from "@/components/layouts/Header/Header";
import { cn } from "@/lib/utils";
import { useNavMenuStore } from "@/stores/useNavMenuStore";
import { usePathname } from "next/navigation";

export default function Main({ children }: { children?: ReactNode }) {
	const pathname = usePathname();
	const { isOpen, setIsOpen } = useNavMenuStore();

	useEffect(() => {
		setIsOpen(false);
	}, [pathname, setIsOpen]);

	return (
		<div className="relative flex flex-1 flex-col min-md:overflow-hidden">
			<Header />
			<div
				className={cn(
					"h-[calc(100vh-114px)] overflow-x-hidden overflow-y-auto transition-all duration-300",
					pathname?.includes("/profile") ? "bg-[#E8EAE9]" : "bg-background",
					isOpen && "pointer-events-none blur-xs",
				)}>
				<div className="container mx-auto">{children}</div>
			</div>
		</div>
	);
}
