"use client";

import { Check, X } from "lucide-react";

import { INNSTILLINGER_CLASSES } from "./constants";

export interface AccessInfoBannerProps {
	title: string;
	/** Optional secondary lines (e.g. superuser has two, employee has one). */
	lines?: string[];
	onDismiss: () => void;
}

export function AccessInfoBanner({ title, lines = [], onDismiss }: AccessInfoBannerProps) {
	return (
		<div className={INNSTILLINGER_CLASSES.banner}>
			<button
				type="button"
				onClick={onDismiss}
				className="absolute right-3 top-3 text-green-800 hover:text-green-900"
				aria-label="Close">
				<X className="h-4 w-4" />
			</button>
			<div className="pr-6">
				<div className="flex items-center gap-3">
					<div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-800">
						<Check className="h-2 w-2 text-primary-50" />
					</div>
					<p className="text-base font-semibold text-green-800">{title}</p>
				</div>
				{lines.length > 0 && (
					<div className={lines.length > 1 ? "mt-1 space-y-0.5 pl-7" : "mt-1 pl-7"}>
						{lines.map((line, i) => (
							<p
								key={i}
								className="text-sm font-light text-green-800">
								{line}
							</p>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
