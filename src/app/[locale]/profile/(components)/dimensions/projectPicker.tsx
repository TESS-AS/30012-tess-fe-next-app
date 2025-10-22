"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, Check, Search } from "lucide-react";
import { useTranslations } from "next-intl";

type Project = { value: string; label: string };

type Props = {
	projects: Project[];
	selected: Project;
	setSelected: (p: Project) => void;
};

export default function ProjectPicker({
	projects,
	selected,
	setSelected,
}: Props) {
	const t = useTranslations("DimensionsProjectPicker");
	const [open, setOpen] = React.useState(false);
	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between border-[#C1C4C2] font-medium text-[#0F1912] hover:bg-[#F3FAF7]">
					{selected.label}
					<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<div className="flex items-center justify-center border-b">
						<Search className="h-6 w-6 shrink-0 pl-2" />
						<CommandInput placeholder={t("searchPlaceholder")} />
					</div>
					<CommandEmpty>{t("noProjectsFound")}</CommandEmpty>
					<CommandGroup>
						{projects.map((project) => (
							<CommandItem
								key={project.value}
								value={project.value}
								onSelect={() => {
									setSelected(project);
									setOpen(false);
								}}>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										selected.value === project.value
											? "opacity-100"
											: "opacity-0",
									)}
								/>
								{project.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
