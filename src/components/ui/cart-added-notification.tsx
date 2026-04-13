"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CartNotificationItem {
	name: string;
	quantity: number;
}

export interface CartNotificationData {
	itemName: string;
	itemNumber: string;
	quantity: number;
	imageUrl?: string;
	unavailableCount?: number;
	items?: CartNotificationItem[];
}

interface CartAddedNotificationProps {
	data: CartNotificationData | null;
	onClose: () => void;
}

const AUTO_DISMISS_MS = 5000;
const LOADING_MS = 800;
const EXIT_ANIMATION_MS = 300;

export function CartAddedNotification({
	data,
	onClose,
}: CartAddedNotificationProps) {
	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [phase, setPhase] = useState<"loading" | "success">("loading");
	const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const remainingRef = useRef(AUTO_DISMISS_MS);
	const startTimeRef = useRef(0);

	const prefersReducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const handleClose = useCallback(() => {
		setVisible(false);
		setTimeout(onClose, prefersReducedMotion ? 0 : EXIT_ANIMATION_MS);
	}, [onClose, prefersReducedMotion]);

	const startDismissTimer = useCallback(() => {
		if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
		startTimeRef.current = Date.now();
		dismissTimerRef.current = setTimeout(() => {
			handleClose();
		}, remainingRef.current);
	}, [handleClose]);

	const pauseDismissTimer = useCallback(() => {
		if (dismissTimerRef.current) {
			clearTimeout(dismissTimerRef.current);
			dismissTimerRef.current = null;
			remainingRef.current -= Date.now() - startTimeRef.current;
			if (remainingRef.current < 0) remainingRef.current = 0;
		}
	}, []);

	useEffect(() => {
		if (data) {
			setPhase("loading");
			setVisible(true);
			remainingRef.current = AUTO_DISMISS_MS;

			const loadTimer = setTimeout(() => {
				setPhase("success");
				startDismissTimer();
			}, LOADING_MS);

			return () => {
				clearTimeout(loadTimer);
				if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
			};
		} else {
			setVisible(false);
		}
	}, [data, startDismissTimer]);

	if (!data) return null;

	const animationClasses = prefersReducedMotion
		? visible ? "opacity-100" : "opacity-0"
		: visible
			? "translate-y-0 opacity-100"
			: "translate-y-4 opacity-0 md:-translate-y-4";

	const transitionClasses = prefersReducedMotion
		? "transition-opacity duration-150"
		: "transition-all duration-300 ease-in-out";

	return (
		<div className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-4 md:inset-x-auto md:top-4 md:right-4 md:bottom-auto md:justify-end md:px-0 md:pb-0">
			<div
				onMouseEnter={pauseDismissTimer}
				onMouseLeave={startDismissTimer}
				className={cn(
					"w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.12)]",
					transitionClasses,
					animationClasses,
				)}>
				{phase === "loading" ? (
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
								<Loader2 className="h-5 w-5 animate-spin text-[#009640]" />
							</div>
							<div>
								<p className="text-sm font-semibold text-[#0F1912]">
									Legger til produktene.
								</p>
								<p className="text-sm text-[#5A615D]">
									Dette tar bare et øyeblikk.
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={handleClose}
							className="p-0.5 text-gray-400 hover:text-gray-600">
							<X className="h-4 w-4" />
						</button>
					</div>
				) : (
					<>
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-3">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#009640]">
									<Check className="h-4 w-4 text-white" strokeWidth={3} />
								</div>
								<div>
									<p className="text-sm font-semibold text-[#0F1912]">
										{data.quantity} {data.quantity === 1 ? "vare" : "varer"} lagt til i handlekurv
									</p>
									<div className="mt-3 space-y-1">
										{data.items && data.items.length > 0 ? (
											data.items.map((item, i) => (
												<p key={i} className="text-sm text-[#5A615D]">
													{item.quantity} x {item.name}
												</p>
											))
										) : (
											<p className="text-sm text-[#5A615D]">
												{data.quantity} x {data.itemName}
											</p>
										)}
									</div>
								</div>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="p-0.5 text-gray-400 hover:text-gray-600">
								<X className="h-4 w-4" />
							</button>
						</div>
						{data.unavailableCount && data.unavailableCount > 0 ? (
							<div className="mt-4 flex items-center gap-3 rounded-xl bg-[#FFF7D6] px-4 py-3">
								<AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#D4A017]" />
								<span className="text-sm text-[#0F1912]">
									{data.unavailableCount} vare{data.unavailableCount === 1 ? "" : "r"} ikke tilgjengelig for salg
								</span>
							</div>
						) : null}
						<div className="mt-5">
							<button
								type="button"
								onClick={() => {
									handleClose();
									setTimeout(() => router.push("/cart"), prefersReducedMotion ? 0 : EXIT_ANIMATION_MS);
								}}
								className="w-full rounded-lg bg-[#009640] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#007a2e]">
								Til handlekurven
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
