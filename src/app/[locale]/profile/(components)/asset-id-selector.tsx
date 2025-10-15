import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Barcode } from "lucide-react";

interface AssetOption {
	value: string;
	label: string;
	status: string;
}

interface AssetIdSelectorProps {
	value?: string;
	options: AssetOption[];
	onValueChange?: (value: string) => void;
}

export function AssetIdSelector({
	value,
	options,
	onValueChange,
}: AssetIdSelectorProps) {
	return (
		<Select
			value={value}
			onValueChange={onValueChange}>
			<SelectTrigger className="mt-2 h-8 w-full border-[#C1C4C2] bg-white px-2 py-1 text-xs">
				<div className="flex items-center gap-2">
					<Barcode className="h-4 w-4" />
					<SelectValue />
				</div>
			</SelectTrigger>
			<SelectContent className="min-w-[400px]">
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						className="flex-col items-start py-3">
						<div className="flex items-center gap-2">
							<span className="text-sm text-[#0F1912]">
								{option.label.slice(0, -8)}
								<span className="text-emerald-700">
									{option.label.slice(-8)}
								</span>
							</span>
						</div>
						<span className="text-xs text-[#5A615D]">Status: {option.status}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
