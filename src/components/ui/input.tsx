import * as React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

export const inputStyles = cva(
	"flex h-9 w-full rounded-md border border-[#8A8F8C] bg-[#F8F9F8] px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#009640] focus-visible:border-[#009640] disabled:cursor-not-allowed disabled:opacity-50 max-sm:text-base",
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		const hasValueProp = Object.prototype.hasOwnProperty.call(props, "value");
		const normalizedProps =
			hasValueProp && (props.value === undefined || props.value === null)
				? { ...props, value: "" }
				: props;
		return (
			<input
				type={type}
				className={cn(inputStyles(), className)}
				ref={ref}
				{...normalizedProps}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
