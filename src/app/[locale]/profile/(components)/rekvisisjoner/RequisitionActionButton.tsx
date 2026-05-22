import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface RequisitionActionButtonProps {
	label: string;
	icon: ComponentType<{ className?: string }>;
	loading: boolean;
	disabled?: boolean;
	className?: string;
	onClick: () => void | Promise<void>;
}

export function RequisitionActionButton({
	label,
	icon: Icon,
	loading,
	disabled,
	className,
	onClick,
}: RequisitionActionButtonProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			disabled={disabled || loading}
			aria-busy={loading}
			className={cn("min-w-[6.5rem]", className)}
			onClick={onClick}>
			<span>{label}</span>
			{loading ? (
				<Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
			) : (
				<Icon className="h-4 w-4 shrink-0" aria-hidden />
			)}
		</Button>
	);
}
