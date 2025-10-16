import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Cell = ({
	value,
	placeholder,
	searchable = false,
	isEditMode,
}: {
	value?: string;
	placeholder?: string;
	searchable?: boolean;
	isEditMode: boolean;
}) => {
	if (!isEditMode) {
		return <>{value ?? "—"}</>;
	}
	if (searchable) {
		return (
			<div className="relative">
				<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5A615D]" />
				<Input
					defaultValue={value}
					placeholder={placeholder}
					className="h-9 pl-9"
				/>
			</div>
		);
	}
	return (
		<Input
			defaultValue={value}
			placeholder={placeholder}
			className="h-9"
		/>
	);
};
