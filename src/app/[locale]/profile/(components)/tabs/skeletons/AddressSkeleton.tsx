import { Skeleton } from "@/components/ui/skeleton";

export const AddressSkeleton = () => {
	return (
		<div className="mb-4 rounded-md border p-4 shadow-sm">
			<div className="mb-4 h-6 w-1/3">
				<Skeleton className="h-6 w-1/2" />
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{Array.from({ length: 8 }).map((_, idx) => (
					<div key={idx}>
						<Skeleton className="mb-1 h-4 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
		</div>
	);
};
