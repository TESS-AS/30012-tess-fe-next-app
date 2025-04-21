"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

interface CategoryCardProps {
	id: string;
	name: string;
	description: string;
	icon: React.ElementType;
}

export function CategoryCard({
	name,
	description,
	icon: Icon,
}: CategoryCardProps) {
	const slug = name.toLowerCase().replace(/\s+/g, "-");

	return (
		<Link
			href={`/${slug}`}
			className="h-full w-full">
			<motion.div
				whileHover={{ scale: 1.03 }}
				transition={{ type: "spring", stiffness: 300 }}
				className="h-full w-full">
				<Card className="border-muted group h-full border transition-colors duration-300 hover:border-[#02a554]">
					<CardContent className="space-y-3 p-5">
						<Icon className="text-muted-foreground h-7 w-7 transition-colors group-hover:text-[#02a554]" />
						<div className="text-base font-semibold group-hover:text-[#02a554]">
							{name}
						</div>
						<p className="text-muted-foreground text-sm">{description}</p>
					</CardContent>
				</Card>
			</motion.div>
		</Link>
	);
}
