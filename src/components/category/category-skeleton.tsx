"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CategorySkeleton() {
	return (
		<div className="flex flex-col">
			<div className="grid-row-2 mb-4 grid h-[100px] grid-cols-1 gap-4">
				<Skeleton className="lg:w-2/4" />
				<Skeleton className="lg:w-1/4" />
			</div>
			<div className="flex flex-col gap-8 lg:flex-row">
				{/* Title Skeleton */}
				<Skeleton className="lg:w-1/4" />

				{/* Grid of Product Skeletons */}
				<div className="flex-1">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<div
								key={i}
								className="group relative space-y-4">
								{/* Product Image Skeleton */}
								<Skeleton className="aspect-square w-full rounded-lg" />

								{/* Product Info Skeletons */}
								<div className="space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-4 w-1/4" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
