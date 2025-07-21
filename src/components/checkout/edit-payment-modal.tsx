import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from '../ui/modal';
import { Wallet } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Betalingsmetode</h2>
      </div>

      <div className="space-y-6">
        <RadioGroup defaultValue={initialData?.method || 'invoice'}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="invoice" id="invoice" />
            <Label htmlFor="invoice">Faktura</Label>
          </div>
        </RadioGroup>

        <div className="space-y-4">
          <div>
            <Label htmlFor="project">Prosjekt</Label>
            <Input
              id="project"
              placeholder="Prosjekt 123"
              defaultValue={initialData?.project}
            />
          </div>

          <div>
            <Label htmlFor="department">Avdeling</Label>
            <Input
              id="department"
              placeholder="Salg"
              defaultValue={initialData?.department}
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              placeholder="Kontor"
              defaultValue={initialData?.category}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onClose}>
          Avbryt
        </Button>
        <Button variant="default" onClick={() => onSave(initialData)}>
          Lagre betalingsmetode
        </Button>
      </div>
    </Modal>
  );
};
