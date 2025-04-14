import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
	return (
		<div className="container mx-auto space-y-12 px-4 py-8">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-2 flex flex-col gap-4">
						{[1, 2, 3].map((i) => (
							<Skeleton
								key={i}
								className="aspect-square w-full"
							/>
						))}
					</div>
					<Skeleton className="col-span-10 aspect-square w-full" />
				</div>

				<div className="flex flex-col gap-6">
					<div className="space-y-2">
						<Skeleton className="h-8 w-2/3" />
						<Skeleton className="h-4 w-1/3" />
					</div>

					<Skeleton className="h-7 w-24" />

					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<div className="flex flex-wrap gap-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton
									key={i}
									className="h-10 w-14"
								/>
							))}
						</div>
					</div>

					<Skeleton className="h-11 w-full" />

					<div className="space-y-2">
						<Skeleton className="h-6 w-40" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-4 w-4/6" />
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-5 w-24" />
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="space-y-3">
							<Skeleton className="aspect-square w-full" />
							<Skeleton className="h-5 w-2/3" />
							<Skeleton className="h-4 w-1/3" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
