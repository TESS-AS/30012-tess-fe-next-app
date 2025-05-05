"use client";

import { useState } from "react";

import ProductVariantTable from "@/components/checkout/product-variant-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutProducts } from "@/mocks/mockCheckoutProducts";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

import { Modal, ModalContent, ModalHeader, ModalTitle } from "../ui/modal";

export default function OrderSummary() {
	const [openModalId, setOpenModalId] = useState<number | null>(null);

	return (
		<div className="h-fit w-full rounded-md border bg-white p-6 shadow-sm md:sticky md:top-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Bag (2)</h2>
				<span className="text-sm font-medium">$306.34</span>
			</div>

			{checkoutProducts.map((product) => (
				<div
					key={product.id}
					className="mb-4 flex justify-between gap-4 border-b pb-4">
					<div className="flex gap-4">
						<div className="relative h-32 w-34 overflow-hidden rounded border">
							<Image
								src={product.image}
								alt="Product"
								fill
								className="object-cover"
							/>
						</div>
						<div className="flex flex-col justify-between text-sm">
							<div>
								<p className="font-medium">{product.name}</p>
								<p className="text-muted-foreground">{product.details}</p>
							</div>
							<div className="mt-2 flex items-center gap-2">
								<Button
									size="icon"
									variant="outline">
									-
								</Button>
								<span>{product.quantity}</span>
								<Button
									size="icon"
									variant="outline">
									+
								</Button>
							</div>
							<p className="mt-1 font-medium">${product.price}</p>
						</div>
					</div>
					<div className="flex-end flex">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setOpenModalId(product.id)}>
							<ExternalLink />
						</Button>
						<Modal
							open={openModalId === product.id}
							onOpenChange={(open) => setOpenModalId(open ? product.id : null)}>
							<ModalContent>
								<ModalHeader>
									<ModalTitle>Product Variants - {product.name}</ModalTitle>
								</ModalHeader>
								<ProductVariantTable
									variants={product.variants}
									onAddVariant={(variant) => {
										console.log("Adding variant:", variant);
										setOpenModalId(null);
									}}
									onQuantityChange={(variant, quantity) => {
										console.log("Quantity changed:", variant, quantity);
									}}
								/>
							</ModalContent>
						</Modal>
					</div>
				</div>
			))}

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
