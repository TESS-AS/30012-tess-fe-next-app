"use client";

import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

import { Breadcrumb } from "../ui/breadcrumb";

interface ProductBreadcrumbsProps {
	segment?: string;
	productName?: string;
}

export function ProductBreadcrumbs({
	segment,
	productName,
}: ProductBreadcrumbsProps) {
	const breadcrumbs = useBreadcrumbs(segment, productName);

	return (
		<div className="mb-10">
			<Breadcrumb items={breadcrumbs} />
		</div>
	);
}
