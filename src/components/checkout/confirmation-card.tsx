import { Button } from "../ui/button";

interface ConfirmationCardProps {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	onEdit?: () => void;
}

export const ConfirmationCard = ({
	title,
	icon,
	children,
	onEdit,
}: ConfirmationCardProps) => {
	return (
		<div className="flex flex-col items-start justify-between rounded-lg border border-gray-200 p-6">
			<div className="flex flex-col">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						{icon}
						<h3 className="text-xl font-semibold">{title}</h3>
					</div>
				</div>
				<div className="mb-4 space-y-1">{children}</div>
			</div>
			<Button
				variant="ghost"
				className="p-0 text-base font-medium text-[#00A862] transition-colors hover:bg-transparent hover:text-[#008F53]"
				onClick={onEdit}>
				Endre
			</Button>
		</div>
	);
};
