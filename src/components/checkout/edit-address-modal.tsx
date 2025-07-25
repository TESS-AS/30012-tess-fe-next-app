import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from '../ui/modal';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { getPostalCode } from "@/services/orders.service";
import { Textarea } from '../ui/textarea';
import { AddressSelector } from '@/components/ui/address-selector';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

export interface SavedAddressData {
  id?: string;
  addressName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  extraInfo?: string;
  isUserAddress: boolean;
}

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SavedAddressData) => void;
  initialData?: Partial<SavedAddressData>;
  savedAddresses?: SavedAddressData[];
}

export const EditAddressModal: React.FC<EditAddressModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  savedAddresses = []
}) => {
  const [formData, setFormData] = useState<SavedAddressData>({
    addressName: initialData?.addressName || '',
    street: initialData?.street || '',
    houseNumber: initialData?.houseNumber || '',
    postalCode: initialData?.postalCode || '',
    city: initialData?.city || '',
    extraInfo: initialData?.extraInfo || '',
    isUserAddress: initialData?.isUserAddress || false
  });

  const [showExtra, setShowExtra] = useState(!!formData.extraInfo);
  const [loading, setLoading] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const [cityReadOnly, setCityReadOnly] = useState(true);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real postal code validation
    if (name === 'postalCode') {
      try {
        setLoading(true);
        const postalCodeData = await getPostalCode(value);
        if (postalCodeData && postalCodeData.length > 0) {
          setFormData(prev => ({
            ...prev,
            city: postalCodeData[0].city
          }));
          setCityReadOnly(true);
        } else {
          setFormData(prev => ({ ...prev, city: '' }));
          setCityReadOnly(false);
        }
      } catch (error) {
        console.error('Error fetching postal code:', error);
        setFormData(prev => ({ ...prev, city: '' }));
        setCityReadOnly(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate postal code validation
    if (formData.postalCode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      onSave(formData);
      onClose();
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Din adresse</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Lagrede adresser</Label>
          <AddressSelector
            savedAddresses={savedAddresses}
            onAddressSelect={(selectedAddress: SavedAddressData) => {
              setFormData(prev => ({
                ...prev,
                addressName: selectedAddress.addressName,
                street: selectedAddress.street,
                houseNumber: selectedAddress.houseNumber,
                postalCode: selectedAddress.postalCode,
                city: selectedAddress.city,
                extraInfo: selectedAddress.extraInfo || ''
              }));
            }}
            onAddNewClick={() => setShowNewAddressForm(true)}
          />
        </div>

        <div>
          <Label>Navn på adresse</Label>
          <Input
            name="addressName"
            value={formData.addressName}
            onChange={handleChange}
            placeholder="Legg til navn"
          />
          <p className="text-xs text-muted-foreground mt-1 font-medium">Eksempel: Hjem, Jobb, Kontor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Gatenavn</Label>
            <Input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Legg til gatenavn"
            />
            <p className="text-xs text-muted-foreground mt-1 font-medium">Eksempel: Storgata</p>
          </div>
          <div>
            <Label>Husnummer</Label>
            <Input
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              placeholder="Legg til husnummer"
            />
            <p className="text-xs text-muted-foreground mt-1 font-medium">Eksempel: 15</p>
          </div>
        </div>

        {!showExtra && (
          <Button
            variant="outline"
            className="text-sm font-medium text-foreground border-[#C1C4C2]"
            onClick={() => setShowExtra(true)}
          >
            <Plus className="w-4 h-4" />Legg til tilleggsopplysninger
          </Button>
        )}
        {showExtra && (
          <div>
            <Label>Tilleggsopplysninger (valgfri)</Label>
            <Textarea
              name="extraInfo"
              value={formData.extraInfo}
              onChange={handleChange}
              placeholder="Legg til adresseelementer som ikke passer i gatenavn eller husnummer."
            />
            <p className="text-xs text-muted-foreground mt-1 font-medium">Eksempel: c/o, etasje, oppgang osv.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Postnummer</Label>
            <div className="relative">
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Legg til postnummer"
                className={cn(loading && "pr-10")}
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#009640]" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Eksempel: 0155</p>
          </div>
          <div>
            <Label>Sted</Label>
            <Input
              name="city"
              value={formData.city}
              readOnly={cityReadOnly}
              onChange={handleChange}
              placeholder={cityReadOnly ? "(fylles automatisk etter postnummer er validert)" : "Skriv inn sted"}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="user-address"
            checked={formData.isUserAddress}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isUserAddress: !!checked }))
            }
          />
          <Label htmlFor="user-address">Lagre som brukeradresse</Label>
        </div>

        <div className="flex gap-4 pt-2">
          <Button onClick={handleSave} variant="outlineGreen" className="font-medium">Bruk adresse</Button>
          <Button variant="outline" onClick={handleCancel} className="font-medium text-foreground">
            Avbryt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
