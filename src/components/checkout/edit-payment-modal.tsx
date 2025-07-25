import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from '../ui/modal';
import { Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Order } from '@/types/orders.types';
import { InvoiceInfoCard } from './invoice-info-card';
import { UserDimensionsInput } from './user-dimensions';

interface EditPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    method: 'invoice' | 'card';
    project?: string;
    department?: string;
    category?: string;
  };
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  orderData: Order;
  setOrderData: (data: any) => void;
  dimensionInputMode: "select" | "search" | "manual";
  setDimensionInputMode: (mode: "select" | "search" | "manual") => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  paymentMethod,
  setPaymentMethod,
  orderData,
  setOrderData,
  dimensionInputMode,
  setDimensionInputMode,
}) => {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Betalingsmetode</h2>
      </div>

      <div className="space-y-6">
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="faktura" id="faktura" />
            <Label htmlFor="faktura">Faktura</Label>
          </div>
        </RadioGroup>

        <UserDimensionsInput 
          orderData={orderData} 
          setOrderData={setOrderData}
          dimensionInputMode={dimensionInputMode}
          setDimensionInputMode={setDimensionInputMode}
        />
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onClose}>
          Avbryt
        </Button>
        <Button
          variant="default"
          onClick={() => onSave({
            method: paymentMethod,
            orderData,
          })}
        >
          Lagre betalingsmetode
        </Button>
      </div>
    </Modal>
  );
};