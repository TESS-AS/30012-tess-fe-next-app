"use client";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
}

export function OrderSummary({ subtotal, shipping, tax }: OrderSummaryProps) {
  const total = subtotal + shipping + tax;

  return (
    <div className="sticky top-4 rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
