import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function CartSkeleton() {
	return (
		<main className="container min-h-screen py-10">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3">
				{/* Cart Items */}
				<div className="space-y-6 md:col-span-2">
					<h1 className="text-2xl font-semibold">
						<Skeleton className="h-8 w-48" />
					</h1>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product</TableHead>
								<TableHead>Price</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Total</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...Array(3)].map((_, idx) => (
								<TableRow key={idx}>
									<TableCell>
										<div className="flex items-center gap-4">
											<Skeleton className="h-16 w-16 rounded" />
											<Skeleton className="h-4 w-32" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-8 w-8" />
											<Skeleton className="h-4 w-6" />
											<Skeleton className="h-8 w-8" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="ml-auto h-8 w-8" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Order Summary */}
				<div className="space-y-6">
					<div className="bg-card rounded-xl border p-6 shadow">
						<h2 className="text-xl font-semibold">
							<Skeleton className="h-6 w-32" />
						</h2>
						<div className="mt-4 space-y-4 text-sm">
							<div className="flex justify-between">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-16" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-32" />
							</div>
						</div>
						<Skeleton className="mt-6 h-10 w-full" />
					</div>

					{/* Related Products */}
					<div className="bg-card rounded-xl border p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold">
							<Skeleton className="h-6 w-32" />
						</h2>
						<div className="grid grid-cols-3 gap-4">
							{[...Array(3)].map((_, index) => (
								<div
									key={index}
									className="text-center">
									<Skeleton className="h-24 w-full rounded" />
									<Skeleton className="mx-auto mt-2 h-4 w-16" />
									<Skeleton className="mx-auto mt-1 h-4 w-12" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
