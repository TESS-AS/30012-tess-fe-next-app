import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface NotificationCardProps {
	className?: string;
	icon: React.ReactNode;
	title: string;
	message: string;
	onClose?: () => void;
}

export const NotificationCard = ({
	className,
	icon,
	title,
	message,
	onClose,
}: NotificationCardProps) => {
	return (
		<div className={cn("p-4", className)}>
			<div className="flex flex-col">
				<div className="mb-2 flex items-center justify-between">
					<div className="flex items-center gap-2">
						{icon}
						<p className="text-lg font-semibold">{title}</p>
					</div>
					<X
						className="cursor-pointer"
						onClick={onClose}
					/>
				</div>
				<p className="text-sm">{message}</p>
			</div>
		</div>
	);
};
