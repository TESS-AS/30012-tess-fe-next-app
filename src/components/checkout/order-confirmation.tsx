import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface OrderConfirmationProps {
  orderNumber: string;
  date: string;
  paymentMethod: string;
  name: string;
  company: string;
  address: string;
  phone: string;
  email: string;
  onTrackOrder: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderNumber,
  date,
  paymentMethod,
  name,
  company,
  address,
  phone,
  email,
  onTrackOrder,
}) => {
  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-2">Takk for kjøpet!</h1>
      <p className="text-muted-foreground mb-6">
        Bestillingen din behandles innen 24 timer på virkedager. Vi sender deg en e-post når den er sendt.
      </p>

      <div className="flex gap-4 mb-8">
        <Button onClick={onTrackOrder} variant="default">
          Spor bestillingen
        </Button>
        <Button variant="outline" asChild className='font-medium'>
          <Link href="/products">Fortsett å handle</Link>
        </Button>
      </div>

      <div className="space-y-4 border border-[#E8EAE9] rounded-lg p-6 bg-[#F8F9F8]">
        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Ordrenummer</span>
          <span className="font-medium">#{orderNumber}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Dato</span>
          <span className="font-medium">{date}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Betalingsmetode</span>
          <span className="font-medium">{paymentMethod}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Navn</span>
          <span className="font-medium">{name}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Firma</span>
          <span className="font-medium">{company}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Adresse</span>
          <span className="font-medium">{address}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4 border-b border-[#C1C4C2]">
          <span className="text-muted-foreground">Telefon</span>
          <span className="font-medium">{phone}</span>
        </div>

        <div className="flex justify-between pt-1 pb-4">
          <span className="text-muted-foreground">E-post</span>
          <span className="font-medium">{email}</span>
        </div>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        Trenger du hjelp i mellomtiden? Kontakt oss på{' '}
        <a href="mailto:tess@tess.no" className="text-[#009640] hover:underline">
          tess@tess.no
        </a>
      </div>
    </div>
  );
};
