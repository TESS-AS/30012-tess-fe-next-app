import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";
import { MapPin, Settings } from "lucide-react";

import { Cell } from "./cell";
import { LocationNode, ChildNode } from "@/hooks/useGetHoseSystems";

interface Props {
	isEditMode: boolean;
	s1Codes: LocationNode[];
}

export const StructureAccordion = ({ isEditMode, s1Codes }: Props) => {
	return (
		<AccordionItem
			value="struktur"
			className="border-none">
			<AccordionTrigger className="text-decoration-none cursor-pointer rounded-none border-b border-[#C1C4C2] p-4 px-0 text-lg font-bold text-[#0F1912] hover:no-underline">
				Struktur
			</AccordionTrigger>

			<AccordionContent className="p-0 pt-4">
				{s1Codes.length === 0 ? (
					<div className="p-4 text-sm text-[#5A615D]">
						No structure data available
					</div>
				) : (
					<Accordion
						type="multiple"
						className="space-y-1">
						{s1Codes.map((s1Group) => (
							<AccordionItem
								key={s1Group.id}
								value={s1Group.id}
								className="border-none">
								<AccordionTrigger className="cursor-pointer flex-row-reverse justify-end gap-2 p-0 py-1 text-sm font-normal text-[#0F1912] hover:no-underline [&[data-state=open]>svg]:rotate-180">
									<div className="flex items-center gap-2">
										<MapPin className="h-4 w-4 text-[#5A615D]" />
										<Cell
											value={s1Group.name}
											placeholder="S1 Code"
											isEditMode={isEditMode}
										/>
									</div>
								</AccordionTrigger>

								<AccordionContent className="ml-6 pt-1 pb-0">
									<Accordion
										type="multiple"
										className="space-y-1">
										{s1Group.children?.map((s2Item: ChildNode) => (
											<AccordionItem
												key={s2Item.id}
												value={s2Item.id}
												className="border-none">
												<div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm">
													<Settings className="h-4 w-4 text-[#5A615D]" />
													<span className="min-w-0">
														<Cell
															value={`${s2Item.id} - ${s2Item.name}`}
															placeholder="S2 Code"
															isEditMode={isEditMode}
														/>
													</span>
												</div>
											</AccordionItem>
										))}
									</Accordion>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				)}

				<div className="mt-3 flex items-center gap-3 text-xs text-[#5A615D]">
					<div className="flex items-center gap-1">
						<Settings className="h-4 w-4" />
						<span>S2</span>
					</div>
					<div className="flex items-center gap-1">
						<Settings className="h-4 w-4" />
						<span>Utstyr/Equipment</span>
					</div>
					<div className="flex items-center gap-1">
						<Settings className="h-4 w-4" />
						<span>Utstyr/Equipment subcategory</span>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
