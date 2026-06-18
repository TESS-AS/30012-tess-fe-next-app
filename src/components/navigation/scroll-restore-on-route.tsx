"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "@/i18n/navigation";
import {
	attachHistoryPatch,
	attachPopstateRestore,
	attachScrollTracking,
	consumePendingScrollRestore,
	type RestoreFlag,
} from "@/lib/scrollRestore";
import { useSearchParams } from "next/navigation";

export {
	setPendingScrollRestore,
	type PendingScrollPayload,
} from "@/lib/scrollRestore";

export function ScrollRestoreOnRoute() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const qs = searchParams?.toString() ?? "";
	const restoreFlagRef = useRef<RestoreFlag>({ value: false });

	useEffect(
		() => attachScrollTracking(restoreFlagRef.current),
		[pathname, qs],
	);

	useEffect(() => attachHistoryPatch(restoreFlagRef.current), []);

	useEffect(() => attachPopstateRestore(restoreFlagRef.current), []);

	useEffect(() => {
		consumePendingScrollRestore(pathname, restoreFlagRef.current);
	}, [pathname]);

	return null;
}
