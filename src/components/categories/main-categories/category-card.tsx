"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
	id: string;
	name: string;
	description: string;
	image: string;
}

export function CategoryCard({ name, description, image }: CategoryCardProps) {
	const slug = name.toLowerCase().replace(/\s+/g, "-");

	return (
		<Link
			href={`/${slug}`}
			className="group block h-full w-full">
			<div className="h-full w-full">
				<div className="relative h-64 w-full overflow-hidden rounded-xl">
					<motion.div
						whileHover={{ scale: 1.05 }}
						transition={{ type: "spring", stiffness: 300 }}
						className="absolute inset-0">
						<Image
							src={image}
							alt={name}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</motion.div>
				</div>
				<div className="mt-4 space-y-2">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold text-black">{name}</h3>
						<ArrowRight className="h-4 w-4 text-black" />
					</div>
					<p className="text-muted-foreground text-sm">{description}</p>
					<div className="relative mt-4 h-px w-full overflow-hidden bg-neutral-300">
						<div className="absolute top-0 left-0 h-full w-0 bg-green-600 transition-all duration-300 group-hover:w-full" />
					</div>
				</div>
			</div>
		</Link>
	);
}
