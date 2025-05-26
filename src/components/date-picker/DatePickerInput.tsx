"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DatePickerInputProps {
	date?: string;
	onChange: (value: string) => void;
	placeholder: string;
}

export function DatePickerInput({
	date,
	onChange,
	placeholder,
}: DatePickerInputProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"w-full justify-start text-left font-normal",
						!date && "text-muted-foreground",
					)}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(new Date(date), "PPP") : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date ? new Date(date) : undefined}
					onSelect={(selected) => {
						if (selected) {
							onChange(format(selected, "yyyy-MM-dd"));
							setOpen(false);
						}
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
