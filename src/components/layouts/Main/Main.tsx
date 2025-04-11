"use client";

import type { ReactNode } from "react";

import Header from "@/components/layouts/Header/Header";
import { Category } from "@/types/categories.types";

export default function Main({
	children,
	categories,
}: {
	children?: ReactNode;
	categories: Category[];
}) {
	return (
		<div className="relative flex flex-1 flex-col min-md:overflow-hidden">
			<Header categories={categories} />
			<div className="bg-background h-[calc(100vh-80px)] overflow-y-auto md:rounded-tl-2xl">
				<div className="container mx-auto rounded-t-lg py-5">{children}</div>
			</div>
		</div>
	);
}
