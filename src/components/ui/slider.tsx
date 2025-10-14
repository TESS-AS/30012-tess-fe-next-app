"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex w-full touch-none items-center select-none",
			className,
		)}
		{...props}
	/>
));
Slider.displayName = SliderPrimitive.Root.displayName;

const SliderTrack = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Track>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Track
		ref={ref}
		className={cn(
			"bg-secondary relative h-2 w-full grow overflow-hidden rounded-full",
			className,
		)}
		{...props}
	/>
));
SliderTrack.displayName = SliderPrimitive.Track.displayName;

const SliderRange = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Range>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Range>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Range
		ref={ref}
		className={cn("absolute h-full bg-[#00B84C]", className)}
		{...props}
	/>
));
SliderRange.displayName = SliderPrimitive.Range.displayName;

const SliderThumb = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Thumb>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Thumb
		ref={ref}
		className={cn(
			"bg-background ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-[#00B84C] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
			className,
		)}
		{...props}
	/>
));
SliderThumb.displayName = SliderPrimitive.Thumb.displayName;

export { Slider, SliderTrack, SliderRange, SliderThumb };
