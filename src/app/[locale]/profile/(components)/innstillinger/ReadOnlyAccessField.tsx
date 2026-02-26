"use client";

import { INNSTILLINGER_CLASSES } from "./constants";

export interface ReadOnlyAccessFieldProps {
	label: string;
	value: string;
}

export function ReadOnlyAccessField({ label, value }: ReadOnlyAccessFieldProps) {
	return (
		<div>
			<p className="mb-1 text-sm font-medium text-[#5A615D]">
				{label}
			</p>
			<p className={INNSTILLINGER_CLASSES.readOnlyValue}>{value || "-"}</p>
		</div>
	);
}
