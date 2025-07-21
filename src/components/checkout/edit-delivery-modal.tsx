import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Modal } from '../ui/modal';
import { Truck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface EditDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    method: 'address' | 'pickup';
  };
}

export const EditDeliveryModal: React.FC<EditDeliveryModalProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="flex items-center gap-2 mb-6">
        <Truck className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Velg leveringsmetode</h2>
      </div>

      <div className="space-y-4">
        <RadioGroup defaultValue={initialData?.method || 'address'}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="address" id="address" />
            <Label htmlFor="address">
              <div className="flex flex-col">
                <span className="font-medium">Levering til adresse</span>
                <span className="text-sm text-[#5A615D]">Estimert leveringstid: 2 til 7 virkedager</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onClose}>
          Avbryt
        </Button>
        <Button variant="default" onClick={() => onSave(initialData)}>
          Lagre leveringsmetode
        </Button>
      </div>
    </Modal>
  );
};
