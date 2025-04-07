"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const selectVariants = cva(
	"flex h-9 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "border-input",
				error: "border-destructive",
			},
			size: {
				default: "h-9 px-3 py-2",
				sm: "h-8 px-2.5 py-1.5 text-xs",
				lg: "h-10 px-4 py-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface Option {
	value: string;
	label: string;
}

export interface SelectProps
	extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
		VariantProps<typeof selectVariants> {
	options: Option[];
	placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className, variant, size, options, placeholder, ...props }, ref) => {
		return (
			<select
				className={cn(selectVariants({ variant, size }), className)}
				ref={ref}
				{...props}>
				{placeholder && (
					<option
						value=""
						disabled>
						{placeholder}
					</option>
				)}
				{options.map((option) => (
					<option
						key={option.value}
						value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		);
	},
);

Select.displayName = "Select";

export { Select, selectVariants };
