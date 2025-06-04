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
			<div className="bg-background h-[calc(100vh-114px)] overflow-x-hidden overflow-y-auto">
				<div className="container mx-auto">{children}</div>
			</div>
		</div>
	);
}
