import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@radix-ui/react-select";

export default function CartSkeleton() {
	return (
		<main className="container min-h-screen py-10">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
				{/* Cart Items */}
				<div className="space-y-6 md:col-span-2">
					{/* Breadcrumb skeleton */}
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-10" />
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-10" />
					</div>

					{/* Warehouse selector skeleton */}
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-48" />
					</div>

					{/* Cart items skeleton */}
					{[...Array(3)].map((_, idx) => (
						<div
							key={idx}
							className="border-lightGray rounded-xl border p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<Skeleton className="h-16 w-16 rounded" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<Skeleton className="h-8 w-8" />
										<Skeleton className="h-6 w-8" />
										<Skeleton className="h-8 w-8" />
									</div>
									<Skeleton className="h-6 w-16" />
									<Skeleton className="h-8 w-8" />
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Order Summary */}
				<div className="space-y-6">
					<div className="bg-card border-lightGray rounded-xl border p-6">
						<h2 className="text-xl font-semibold">
							<Skeleton className="h-6 w-32" />
						</h2>
						<div className="mt-4 space-y-4 text-sm">
							<div className="flex justify-between">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-24" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-16" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-20" />
							</div>
							<Separator className="h-[1px] flex-1 bg-[#5A615D]" />
							<div className="flex justify-between">
								<Skeleton className="h-5 w-16" />
								<Skeleton className="h-5 w-20" />
							</div>
						</div>
						{/* Buttons */}
						<div className="mt-6 space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<div className="flex items-center justify-center gap-2">
								<Skeleton className="h-4 w-8" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-4" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
