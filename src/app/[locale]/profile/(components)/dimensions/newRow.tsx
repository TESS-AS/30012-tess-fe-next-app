"use client";

import { memo, useEffect } from "react";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InputRef =
	| React.RefObject<HTMLInputElement>
	| React.MutableRefObject<HTMLInputElement | null>;

type NewRowProps = {
	level: number;
	newRowKey: string;
	newDimension: { name: string; type: string; budget: string; cents: string };
	setNewDimension: React.Dispatch<
		React.SetStateAction<{
			name: string;
			type: string;
			budget: string;
			cents: string;
		}>
	>;
	handleAddDimension: () => void;
	cancelNew: () => void;
	inputRef: InputRef;
	onOpenTypeModal: () => void;
};

const NewRow = memo(function NewRow({
	level,
	newRowKey,
	newDimension,
	setNewDimension,
	handleAddDimension,
	cancelNew,
	inputRef,
	onOpenTypeModal,
}: NewRowProps): ReactElement {
	useEffect(() => {
		if (inputRef?.current) {
			inputRef.current.focus();
			inputRef.current.select?.();
		}
	}, [level, newRowKey, inputRef]);

	const stopRow = (e: React.MouseEvent) => e.stopPropagation();

	return (
		<tr
			key={newRowKey}
			className="bg-[#F3FAF7]"
			onClick={stopRow}>
			<td className="px-4 py-2">
				<div style={{ marginLeft: `${level * 24}px` }}>
					<Input
						ref={inputRef}
						placeholder="Skriv inn navn"
						className="w-full border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
						value={newDimension.name}
						onClick={(e) => e.stopPropagation()}
						onChange={(e) =>
							setNewDimension((p) => ({ ...p, name: e.target.value }))
						}
					/>
				</div>
			</td>
			<td className="px-4 py-2">
				<Input
					placeholder="Sett type"
					className="w-full cursor-pointer border-[#C1C4C2] bg-[#F3FAF7] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
					value={newDimension.type}
					onClick={(e) => {
						e.stopPropagation();
						onOpenTypeModal();
					}}
					readOnly
				/>
			</td>
			<td className="px-4 py-2">
				<div className="flex items-center gap-2">
					<Input
						placeholder="466"
						className="w-[80px] border-[#C1C4C2] text-right hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
						value={newDimension.budget}
						onClick={(e) => e.stopPropagation()}
						onChange={(e) => {
							const value = e.target.value.replace(/[^0-9]/g, "");
							setNewDimension((p) => ({ ...p, budget: value }));
						}}
					/>
					,
					<Input
						placeholder="00"
						className="w-[60px] border-[#C1C4C2] text-right hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
						value={newDimension.cents}
						onClick={(e) => e.stopPropagation()}
						onChange={(e) => {
							const value = e.target.value.replace(/[^0-9]/g, "");
							setNewDimension((p) => ({ ...p, cents: value }));
						}}
					/>
					<span>,- kr</span>
				</div>
			</td>
			<td className="px-4 py-2">
				<div className="flex items-center gap-2">
					<Button
						variant="green"
						onClick={handleAddDimension}
						size="sm">
						Lagre
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8 border-0 text-[#C81E1E] shadow-none"
						onClick={cancelNew}>
						×
					</Button>
				</div>
			</td>
		</tr>
	);
});

export default NewRow;
