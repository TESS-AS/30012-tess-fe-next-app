"use client";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

import { QuestionMarkIcon } from "./QuestionMarkIcon";
import type { InfoItem } from "./types";
import { renderWithEmailLinks } from "./utils";

const TRIGGER_CLASSNAME =
	"flex items-center gap-3 px-0 py-2 text-left text-[18px] font-normal text-[#0F1912] hover:no-underline [&>svg]:shrink-0 data-[state=open]:font-bold";
const CONTENT_CLASSNAME =
	"whitespace-pre-line px-0 pb-2 pt-0 pl-9 text-sm font-normal leading-relaxed text-[#6B7280]";

interface FaqAccordionItemProps {
	item: InfoItem;
	categoryNumber: number;
	index: number;
}

export function FaqAccordionItem({
	item,
	categoryNumber,
	index,
}: FaqAccordionItemProps) {
	const value = `cat-${categoryNumber}-item-${index}`;
	return (
		<AccordionItem
			value={value}
			className="border-none">
			<AccordionTrigger className={TRIGGER_CLASSNAME}>
				<QuestionMarkIcon />
				<span className="flex-1 text-left">{item.q}</span>
			</AccordionTrigger>
			<AccordionContent className={CONTENT_CLASSNAME}>
				{renderWithEmailLinks(item.a)}
			</AccordionContent>
		</AccordionItem>
	);
}
