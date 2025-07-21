import React from 'react';
import { Button } from './button';
import { Plus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

export interface SavedAddress {
  id: string;
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  extraInfo?: string;
}

interface AddressSelectorProps {
  savedAddresses: SavedAddress[];
  onAddressSelect: (address: SavedAddress) => void;
  onAddNewClick: () => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  savedAddresses,
  onAddressSelect,
  onAddNewClick,
}) => {
  return (
    <div className="space-y-4">
      {savedAddresses.length > 0 && (
        <RadioGroup
          className="flex flex-col gap-3"
          onValueChange={(value) => {
            const selectedAddress = savedAddresses.find((addr) => addr.id === value);
            if (selectedAddress) {
              onAddressSelect(selectedAddress);
            }
          }}
        >
          {savedAddresses.map((address) => (
            <div key={address.id} className="flex items-center space-x-3">
              <RadioGroupItem value={address.id} id={address.id} />
              <Label htmlFor={address.id} className="font-normal">
                {address.name} - {address.street} {address.houseNumber}, {address.postalCode} {address.city}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      <Button
        variant="outline"
        onClick={onAddNewClick}
        className="text-sm font-medium text-foreground border-[#C1C4C2]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Legg til ny adresse
      </Button>
    </div>
  );
};
