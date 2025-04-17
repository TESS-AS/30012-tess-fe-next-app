"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CategorySkeleton() {
    return (
        <div className="py-8">
            {/* Title Skeleton */}
            <Skeleton className="mb-6 h-10 w-1/4" />

            {/* Grid of Product Skeletons */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="group relative space-y-4">
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
    );
}
