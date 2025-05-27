"use client";

import { Dispatch, SetStateAction } from "react";

import { DatePickerInput } from "@/components/date-picker/DatePickerInput";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { orderStatusOptions } from "@/constants/orderConstants";
import { OrderFilters } from "@/hooks/useGetOrders";

interface OrderFiltersProps {
	filters: OrderFilters;
	setFilters: Dispatch<SetStateAction<OrderFilters>>;
}

export function OrderFiltersForm({ filters, setFilters }: OrderFiltersProps) {
	const handleInputChange = (key: keyof OrderFilters, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Input
				placeholder="Order Number"
				type="number"
				onChange={(e) =>
					handleInputChange("orderNumber", +e.target.value || undefined)
				}
			/>
			<Input
				placeholder="Invoice Number"
				onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
			/>

			<Select
				onValueChange={(val) =>
					handleInputChange("status", val === "all" ? undefined : parseInt(val))
				}
				value={filters.status?.toString() ?? "all"}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Status" />
				</SelectTrigger>
				<SelectContent>
					{orderStatusOptions.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<DatePickerInput
				date={filters.fromDate}
				onChange={(value) => handleInputChange("fromDate", value)}
				placeholder="From Date"
			/>
			<DatePickerInput
				date={filters.toDate}
				onChange={(value) => handleInputChange("toDate", value)}
				placeholder="To Date"
			/>
		</div>
	);
}
