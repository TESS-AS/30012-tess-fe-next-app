"use client";
import { ReactNode } from "react";

import Header from "@/components/layouts/Header/Header";

export default function Main({ children }: { children?: ReactNode }) {
	return (
		<div className="relative flex flex-1 flex-col min-md:overflow-hidden">
			<Header />
			<div className="bg-background h-[calc(100vh-80px)] overflow-y-auto md:rounded-tl-2xl">
				<div className="container rounded-t-lg py-5">{children}</div>
			</div>
		</div>
	);
}
