import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
	return (
		<main className="container mx-auto min-h-screen py-10">
			<div className="space-y-6">
				{/* Breadcrumb skeleton */}
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-4" />
					<Skeleton className="h-4 w-24" />
				</div>
				{/* Stepper skeleton */}
				<div className="flex gap-2">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-10 flex-1" />
					))}
				</div>
				{/* Content area - reserve space to reduce CLS */}
				<div className="grid grid-cols-1 gap-10 pt-6 md:grid-cols-3">
					<div className="space-y-4 md:col-span-2">
						<Skeleton className="h-[400px] w-full rounded-lg" />
					</div>
					<div className="space-y-4">
						<Skeleton className="h-[320px] w-full rounded-lg" />
					</div>
				</div>
			</div>
		</main>
	);
}
