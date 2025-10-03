"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type PillOption<T extends string = string> = {
	label: string;
	value: T;
	activeClassName?: string;
	inactiveClassName?: string;
};

export interface PillSwitcherProps<T extends string = string> {
	options: ReadonlyArray<PillOption<T>>;
	value: T;
	onChange: (value: T) => void;
	variant?: "pill" | "panel";
	className?: string;
	buttonClassName?: string;
	activeClassName?: string;
	inactiveClassName?: string;
}

export function PillSwitcher<T extends string = string>({
	options,
	value,
	onChange,
	variant = "pill",
	className,
	buttonClassName,
	activeClassName,
	inactiveClassName,
}: PillSwitcherProps<T>) {
	const preset = React.useMemo(() => {
		if (variant === "panel") {
			return {
				container: "rounded-md bg-[#E8EAE9] px-4 py-2 gap-2",
				button: "rounded-md px-3 py-1 text-sm",
				active: "bg-[#003D1A] text-white",
				inactive: "text-[#5A615D]",
			} as const;
		}
		return {
			container: "rounded-md bg-[#E8EAE9] p-1 gap-2",
			button: "rounded-md px-3 py-1 text-xs font-semibold",
			active: "bg-[#003D1A] text-white",
			inactive: "text-[#0F1912] hover:bg-white",
		} as const;
	}, [variant]);

	const resolvedActive = activeClassName ?? preset.active;
	const resolvedInactive = inactiveClassName ?? preset.inactive;

	return (
		<div className={cn("flex items-center", preset.container, className)}>
			{options.map((opt) => {
				const active = value === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={cn(
							preset.button,
							"transition-colors",
							active
								? (opt.activeClassName ?? resolvedActive)
								: (opt.inactiveClassName ?? resolvedInactive),
							buttonClassName,
						)}>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}
