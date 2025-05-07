"use client";

import type { ReactNode } from "react";

import CartDrawer from "@/components/cart/CartDrawer";
import Header from "@/components/layouts/Header/Header";
import { Category } from "@/types/categories.types";
import NotificationBar from "@/components/ui/notification-bar";

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
			<div className="bg-background h-[calc(100vh-80px)] overflow-y-auto md:rounded-tl-2xl">
				<div className="container mx-auto rounded-t-lg py-5">{children}</div>
			</div>
			<CartDrawer />
		</div>
	);
}
