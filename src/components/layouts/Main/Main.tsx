"use client";

import type { ReactNode } from "react";

import Header from "@/components/layouts/Header/Header";
import NotificationBar from "@/components/ui/notification-bar";
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
			<NotificationBar
				message="You are currently shopping from our Oslo Warehouse. All products will be delivered from this location."
				autoHideDuration={10000}
			/>
			<Header categories={categories} />
			<div className="bg-background h-[calc(100vh-80px)] overflow-y-auto">
				<div className="container mx-auto py-5">{children}</div>
			</div>
		</div>
	);
}
