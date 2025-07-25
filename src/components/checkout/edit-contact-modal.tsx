import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from '../ui/modal';
import { User2 } from 'lucide-react';
import { updateUserProfile } from '@/services/user.service';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface EditContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => void;
  initialData?: ContactFormData;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  open,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<ContactFormData>(initialData || {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
    updateUserProfile(formData.firstName, formData.lastName, formData.phone)
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="flex items-center gap-2 mb-6">
        <User2 className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Kontaktperson</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <Label htmlFor="firstName">Fornavn</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="lastName">Etternavn</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled
          />
          <p className="text-xs text-muted-foreground mt-1">Eksempel: navn@navnesen.no</p>
        </div>

        <div>
          <Label htmlFor="phone">Telefonnummer</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Eksempel: +47 123 45 678</p>
        </div>

        <div className="col-span-full flex gap-4 pt-2">
          <Button onClick={handleSave} variant="outlineGreen" className="font-medium">
            Lagre kontaktperson
          </Button>
          <Button onClick={onClose} variant="outline" className="text-foreground font-medium">
            Avbryt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
