import { Skeleton } from "@/components/ui/skeleton";

export function HoseResultsSkeleton() {
	return (
		<div className="min-w-0 flex-1 space-y-8 pb-8">
			<section className="space-y-3">
				<Skeleton className="h-5 w-56 bg-[#E8EAE9]" />
				<div className="border-y border-[#C1C4C2] bg-white py-5">
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<div className="space-y-3">
							<Skeleton className="h-7 w-[75%] bg-[#E8EAE9]" />
							<Skeleton className="h-4 w-full bg-[#E8EAE9]" />
							<Skeleton className="h-4 w-[85%] bg-[#E8EAE9]" />
							<Skeleton className="mt-4 h-36 w-full max-w-[280px] bg-[#E8EAE9]" />
						</div>
						<div className="space-y-3 rounded-md border border-[#009640]/20 bg-[#E8F8EB] p-4">
							<Skeleton className="h-4 w-40 bg-[#D4EED9]" />
							<Skeleton className="h-4 w-48 bg-[#D4EED9]" />
							<Skeleton className="h-4 w-44 bg-[#D4EED9]" />
							<Skeleton className="mt-4 h-10 w-full bg-[#D4EED9]" />
						</div>
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<Skeleton className="h-5 w-64 bg-[#E8EAE9]" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={index}
							className="rounded-lg border border-[#C1C4C2] bg-white p-4">
							<Skeleton className="h-5 w-[75%] bg-[#E8EAE9]" />
							<Skeleton className="mt-3 h-4 w-full bg-[#E8EAE9]" />
							<Skeleton className="mt-2 h-4 w-[85%] bg-[#E8EAE9]" />
							<Skeleton className="mx-auto mt-4 h-28 w-full max-w-[220px] bg-[#E8EAE9]" />
							<Skeleton className="mt-4 h-10 w-full bg-[#E8EAE9]" />
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

export function HoseFormFieldSkeleton() {
	return (
		<div className="space-y-1.5">
			<Skeleton className="h-4 w-28 bg-[#E8EAE9]" />
			<Skeleton className="h-11 w-full bg-[#E8EAE9]" />
		</div>
	);
}

export function HoseFormSkeleton() {
	return (
		<div className="w-full max-w-none space-y-5 border-[#E8EAE9] pb-8 lg:border-r lg:pr-10">
			<Skeleton className="h-5 w-40 bg-[#E8EAE9]" />
			<HoseFormFieldSkeleton />
			<HoseFormFieldSkeleton />
			<HoseFormFieldSkeleton />
			<HoseFormFieldSkeleton />
			<div className="flex items-center gap-2.5 pt-1">
				<Skeleton className="h-4 w-4 rounded-sm bg-[#E8EAE9]" />
				<Skeleton className="h-4 w-64 bg-[#E8EAE9]" />
			</div>
			<Skeleton className="mt-2 h-11 w-full bg-[#E8EAE9]" />
		</div>
	);
}
