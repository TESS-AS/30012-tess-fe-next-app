"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";

interface Props {
	name: string;
	available: boolean | undefined;
	isChecking: boolean;
	className?: string;
}

/**
 * Trailing-edge name-uniqueness feedback for the KSU name input.
 * Rendered under the input in every option body — kept here so every option
 * surfaces the same message in the same tone.
 */
export function NameAvailabilityHint({
	name,
	available,
	isChecking,
	className,
}: Props) {
	const trimmed = name.trim();
	if (trimmed.length === 0) {
		return (
			<p className={cn("text-xs text-[#5A615D]", className)}>
				Navnet må være unikt og kan endres senere.
			</p>
		);
	}
	if (trimmed.length < 2) {
		return null;
	}
	if (isChecking || available === undefined) {
		return (
			<p
				className={cn(
					"flex items-center gap-1 text-xs text-[#5A615D]",
					className,
				)}>
				<Loader2 className="h-3 w-3 animate-spin" />
				Sjekker tilgjengelighet ...
			</p>
		);
	}
	if (available === false) {
		return (
			<p
				className={cn(
					"flex items-center gap-1 text-xs text-[#B0261A]",
					className,
				)}>
				<X className="h-3 w-3" />
				Navnet er allerede i bruk.
			</p>
		);
	}
	return (
		<p
			className={cn(
				"flex items-center gap-1 text-xs text-[#1C6D2C]",
				className,
			)}>
			<Check className="h-3 w-3" />
			Navnet er tilgjengelig.
		</p>
	);
}
