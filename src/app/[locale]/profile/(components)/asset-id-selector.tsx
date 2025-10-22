import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Barcode } from "lucide-react";
import { useTranslations } from "next-intl";

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
	const t = useTranslations("AssetIdSelector");
	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<Select
			value={value}
			onValueChange={onValueChange}>
			<SelectTrigger className="mt-2 h-8 w-full border-[#C1C4C2] bg-white px-2 py-1 text-xs">
				<div className="flex items-center gap-2">
					<Barcode className="h-4 w-4" />
					{selectedOption ? (
						<span className="text-xs">
							<span className="text-emerald-700">
								{selectedOption.label.slice(-8)}
							</span>
							<span className="text-[#5A615D]"> ({selectedOption.status})</span>
						</span>
					) : (
						<SelectValue />
					)}
				</div>
			</SelectTrigger>
			<SelectContent className="min-w-[400px]">
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						className="flex-col items-start p-3 [&>span:first-child]:hidden">
						<div className="flex items-center gap-3">
							<div
								className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
									value === option.value
										? "border-emerald-600"
										: "border-gray-300"
								}`}>
								{value === option.value && (
									<div className="h-3 w-3 rounded-full bg-emerald-600" />
								)}
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-[#0F1912]">
									{option.label.slice(0, -8)}
									<span className="text-emerald-700">
										{option.label.slice(-8)}
									</span>
								</span>
								<span className="text-xs text-[#5A615D]">
									{t("status")}: {option.status}
								</span>
							</div>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
