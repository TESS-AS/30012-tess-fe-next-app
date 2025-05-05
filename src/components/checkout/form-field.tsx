"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FormFieldProps {
	id: string;
	label: string;
	placeholder: string;
	required?: boolean;
	field: string;
	type?: string;
	disabled?: boolean;
	value: string;
	onChange: (value: string) => void;
}

export const FormField = ({
	id,
	label,
	placeholder,
	required,
	type,
	disabled,
	value,
	onChange,
}: FormFieldProps) => (
	<div className="space-y-1.5">
		<Label
			htmlFor={id}
			className="text-sm font-medium text-gray-700">
			{label}
			{required && <span className="ml-0.5 text-red-500">*</span>}
		</Label>
		<Input
			id={id}
			type={type || "text"}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className={`w-full ${disabled ? "bg-gray-100" : "bg-white"}`}
			disabled={disabled}
		/>
	</div>
);
