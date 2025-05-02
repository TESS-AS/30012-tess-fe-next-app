"use client";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function OrderSummary() {
	return (
		<div className="h-fit w-full rounded-md border bg-white p-6 shadow-sm md:sticky md:top-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Bag (2)</h2>
				<span className="text-sm font-medium">$306.34</span>
			</div>

			<div className="mb-4 flex gap-4 border-b pb-4">
				<div className="relative h-32 w-34 overflow-hidden rounded border">
					<Image
						src="/images/gloves.jpg"
						alt="Product"
						fill
						className="object-cover"
					/>
				</div>
				<div className="flex flex-col justify-between text-sm">
					<div>
						<p className="font-medium">Protective Gloves</p>
						<p className="text-muted-foreground">25 | Black | 27.5</p>
					</div>
					<div className="mt-2 flex items-center gap-2">
						<Button
							size="icon"
							variant="outline">
							-
						</Button>
						<span>2</span>
						<Button
							size="icon"
							variant="outline">
							+
						</Button>
					</div>
					<p className="mt-1 font-medium">$236</p>
				</div>
			</div>
			<ProductVariantTable />

			<div className="my-4 space-y-2">
				<Input placeholder="Gift or promo code" />
				<Button
					variant="outline"
					className="w-full">
					Apply
				</Button>
			</div>

			<div className="mb-4 space-y-1 text-sm">
				<div className="flex justify-between">
					<span>Subtotal</span>
					<span>$236</span>
				</div>
				<div className="flex justify-between">
					<span>Duties</span>
					<span>$23.60</span>
				</div>
				<div className="flex justify-between">
					<span>Estimated Tax</span>
					<span>$46.74</span>
				</div>
				<div className="flex justify-between">
					<span>Estimated Shipping</span>
					<span>Free</span>
				</div>
				<hr className="my-2" />
				<div className="flex justify-between font-semibold">
					<span>Total</span>
					<span>$306.34</span>
				</div>
			</div>

			<div className="mb-4 rounded bg-yellow-50 p-3 text-xs text-yellow-800">
				Duties, Tax, and Shipping are estimated totals until shipping step is
				complete.
			</div>

			<div className="space-y-2 text-sm">
				<p className="font-semibold">Save Your Info (Optional)</p>
				<p className="text-muted-foreground">
					Create a password for easy order review and faster checkout the next
					time you shop.
				</p>
				<Input
					type="password"
					placeholder="Password"
				/>
				<Button
					className="w-full bg-gray-300 text-white"
					disabled>
					Place Order
				</Button>
			</div>
		</div>
	);
}
