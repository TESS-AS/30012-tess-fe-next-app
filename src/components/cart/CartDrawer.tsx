"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/providers/CartProvider";
import { Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
	const router = useRouter();

	const { items, isOpen, closeCart, openCart, removeItem } = useCart();

	//TODO: I will remove this once linked to user context
	const subtotal = items.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0,
	);

	const handleCheckout = () => {
		closeCart();
		router.push("/checkout");
	};

	return (
		<Sheet
			open={isOpen}
			onOpenChange={(open) => (open ? openCart() : closeCart())}>
			<SheetContent
				side="right"
				className="animate-in animate-out slide-in-from-right slide-out-from-left w-full max-w-sm p-0">
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-b p-4">
						<SheetTitle>Your Cart ({items.length})</SheetTitle>
					</div>
					<div className="flex-1 overflow-y-auto px-4">
						{items.map((item, idx) => (
							<div
								key={idx}
								className="relative flex gap-4 border-b py-4">
								<Button
									size="icon"
									variant="ghost"
									className="absolute top-0 right-0"
									onClick={() => removeItem(idx)}>
									<Trash className="text-muted-foreground h-4 w-4" />
								</Button>

								<div className="bg-muted relative h-24 w-24 flex-shrink-0 rounded">
									{item.image ? (
										<Image
											src={item.image}
											alt={item.name}
											fill
											className="object-contain"
										/>
									) : (
										<div className="h-full w-full bg-gray-200" />
									)}
								</div>
								<div className="flex flex-col justify-between pr-6">
									<div>
										<p className="text-sm font-medium">{item.name}</p>
										<p className="text-muted-foreground text-sm">
											{item.currency}
											{item.price}
										</p>
									</div>
									<div className="mt-2 flex items-center gap-2">
										<Button
											size="icon"
											variant="outline">
											<Minus className="h-4 w-4" />
										</Button>
										<span className="w-6 text-center">{item.quantity}</span>
										<Button
											size="icon"
											variant="outline">
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						))}

						<div className="mt-10">
							<h2 className="text-md mb-5 font-semibold">Related Products</h2>
							<div className="grid grid-cols-3 gap-2">
								<div className="text-center">
									<div className="relative h-24 w-full rounded">
										<Image
											src="/images/helmet.jpg"
											alt="Related product"
											fill
											className="object-contain"
										/>
									</div>
									<p className="mt-1 text-sm">Helmet</p>
									<p className="text-muted-foreground text-xs">$12.00</p>
								</div>
								<div className="text-center">
									<div className="relative h-24 w-full rounded">
										<Image
											src="/images/gloves.jpg"
											alt="Related product"
											fill
											className="object-contain"
										/>
									</div>
									<p className="mt-1 text-sm">Gloves</p>
									<p className="text-muted-foreground text-xs">$24.50</p>
								</div>
								<div className="text-center">
									<div className="relative h-24 w-full rounded">
										<Image
											src="/images/welding.jpg"
											alt="Related product"
											fill
											className="object-contain"
										/>
									</div>
									<p className="mt-1 text-sm">Welding Mask</p>
									<p className="text-muted-foreground text-xs">$18.00</p>
								</div>
							</div>
						</div>
					</div>
					<div className="border-t p-4">
						<div className="mb-4 flex justify-between text-sm font-medium">
							<span>Subtotal</span>
							<span>${subtotal.toFixed(2)}</span>
						</div>
						<Button
							className="w-full"
							onClick={handleCheckout}>
							Continue to Checkout
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
