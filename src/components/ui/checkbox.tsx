"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"peer bg-[#F8F9F8] border border-[#8A8F8C] data-[state=checked]:border-none focus-visible:ring-ring data-[state=checked]:bg-[#009640] data-[state=checked]:text-primary-foreground h-4 w-4 shrink-0 cursor-pointer rounded-sm   focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}>
		<CheckboxPrimitive.Indicator
			className={cn("flex items-center justify-center text-current")}>
			<Check className="h-3 w-3" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
