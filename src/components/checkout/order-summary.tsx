"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/appContext";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

import ProductVariantTable from "./product-variant-table";
import { Modal, ModalHeader, ModalTitle } from "../ui/modal";
import QuantityButtons from "../ui/quantity-buttons";

export default function OrderSummary() {
	const { cartItems, prices, calculatedPrices, updateQuantity } =
		useAppContext();
	const [openModalId, setOpenModalId] = useState<string | null>(null);

	return (
		<div className="h-fit w-full rounded-md border bg-white p-6 shadow-sm md:sticky md:top-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Bag ({cartItems.length})</h2>
				<span className="text-sm font-medium">
					{cartItems
						?.reduce(
							(acc, item) =>
								acc +
								(calculatedPrices[item.itemNumber] ||
									prices[item.itemNumber] ||
									0),
							0,
						)
						.toFixed(2)}
					,- kr
				</span>
			</div>

			{cartItems.map((product) => (
				<div
					key={product.productNumber}
					className="mb-4 flex justify-between gap-4 border-b pb-4">
					<div className="flex gap-4">
						<div className="bg-muted relative h-32 w-34 overflow-hidden rounded border">
							<Image
								src={product.mediaId?.[0].url || ""}
								alt="Product"
								fill
								className="object-contain"
							/>
						</div>
						<div className="flex flex-col justify-between text-sm">
							<div>
								<p className="font-medium">{product.productNumber}</p>
								<p className="text-muted-foreground">{product.itemNumber}</p>
							</div>
							<QuantityButtons
								quantity={product.quantity}
								onIncrease={async (e) => {
									e.stopPropagation();
									await updateQuantity(
										product.cartLine ?? 0,
										product.itemNumber,
										product.quantity + 1,
									);
								}}
								onDecrease={async (e) => {
									e.stopPropagation();
									await updateQuantity(
										product.cartLine ?? 0,
										product.itemNumber,
										product.quantity - 1,
									);
								}}
							/>
							<p className="mt-1 font-medium">
								{calculatedPrices[product.itemNumber]?.toFixed(2)},- kr
							</p>
						</div>
					</div>
					<div className="flex-end flex">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setOpenModalId(product.productNumber)}>
							<ExternalLink />
						</Button>
						<Modal
							open={openModalId === product.productNumber}
							onOpenChange={(open) =>
								setOpenModalId(open ? product.productNumber : null)
							}>
							<ModalHeader>
								<ModalTitle>
									Product Variants - {product.productName}
								</ModalTitle>
							</ModalHeader>
							<ProductVariantTable
								variants={[]}
								productNumber={product.productNumber}
							/>
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
					<span>
						{cartItems
							?.reduce(
								(acc, item) =>
									acc +
									(calculatedPrices[item.itemNumber] ||
										prices[item.itemNumber] ||
										0),
								0,
							)
							.toFixed(2)}
						,- kr
					</span>
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
