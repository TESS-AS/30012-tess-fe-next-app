import { TableCell, TableRow } from "./table";

export const AnimatedTableRow = ({
	isOpen,
	children,
}: {
	isOpen: boolean;
	children: React.ReactNode;
}) => {
	return (
		<TableRow className={isOpen ? "border-b" : "border-none"}>
			<TableCell
				colSpan={5}
				className="p-0">
				<div className="grid">
					<div
						className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out ${isOpen && "grid-rows-[1fr]"} `}>
						<div className="overflow-hidden">
							<div
								className={`bg-muted/50 text-muted-foreground min-h-0 transform-gpu px-6 py-4 text-sm ${
									isOpen ? "scale-y-100 opacity-100" : "scale-y-95 opacity-0"
								} transition-all duration-300 ease-out`}>
								{children}
							</div>
						</div>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
};
