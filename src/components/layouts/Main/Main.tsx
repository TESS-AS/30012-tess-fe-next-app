"use client";

import type { ReactNode } from "react";

import Header from "@/components/layouts/Header/Header";

export default function Main({ children }: { children?: ReactNode }) {
	return (
		<div className="relative flex flex-1 flex-col min-md:overflow-hidden">
			<Header />
			<div className="bg-background h-[calc(100vh-114px)] overflow-x-hidden overflow-y-auto">
				<div className="container mx-auto">{children}</div>
			</div>
		</div>
	);
}
