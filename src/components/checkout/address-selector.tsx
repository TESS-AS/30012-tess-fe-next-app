import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { SavedAddress } from "../../types/address"

interface AddressSelectorProps {
  savedAddresses: SavedAddress[]
  onAddressSelect: (address: SavedAddress) => void
  onAddNewClick: () => void
}

export const AddressSelector = ({
  savedAddresses,
  onAddressSelect,
  onAddNewClick
}: AddressSelectorProps) => {
  return (
    <Select
      onValueChange={(value) => {
        const selectedAddress = savedAddresses.find(addr => addr.id === value)
        if (selectedAddress) {
          onAddressSelect(selectedAddress)
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Velg en lagret adresse" />
      </SelectTrigger>
      <SelectContent className="p-2">
        <div className="px-1 py-2 text-sm font-medium text-[#009640] font-medium flex justify-between items-center">
          <span>Bruker</span>
        </div>
        {savedAddresses
          .filter(addr => addr.type === 'bruker')
          .map(addr => (
            <SelectItem 
              key={addr.id} 
              value={addr.id}
              className="pl-6 relative pr-24"
            >
              <span className="block truncate">{addr.name} - {addr.street} {addr.houseNumber}</span>
              <span className="text-xs bg-[#DEF7EC] text-[#005522] px-2 py-0.5 rounded font-medium absolute right-2 top-1/2 -translate-y-1/2">Bruker</span>
            </SelectItem>
          ))}

        <button
          type="button" 
          className="w-full px-3 py-2 text-sm font-medium text-[#009640] cursor-pointer hover:bg-[#E6F3EC] flex items-center gap-2 transition-colors"
          onClick={(e) => {
            e.preventDefault()
            onAddNewClick()
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Legg til adresse</span>
        </button>
        
        <div className="mt-2 px-1 py-2 text-sm font-medium text-[#009640] flex justify-between items-center border-t">
          <span>Kunde</span>
        </div>
        {savedAddresses
          .filter(addr => addr.type === 'kunde')
          .map(addr => (
            <SelectItem 
              key={addr.id} 
              value={addr.id}
              className="pl-6 relative pr-24"
            >
              <span className="block truncate">{addr.name} - {addr.street} {addr.houseNumber}</span>
              <span className="text-xs bg-[#DEF7EC] text-[#005522] px-2 py-0.5 rounded font-medium absolute right-2 top-1/2 -translate-y-1/2">Kunde</span>
            </SelectItem>
          ))}
        
        <div className="mt-2 px-1 py-2 text-sm font-medium text-[#009640] flex justify-between items-center border-t">
          <span>Organisasjon</span>
        </div>
        {savedAddresses
          .filter(addr => addr.type === 'organisasjon')
          .map(addr => (
            <SelectItem 
              key={addr.id} 
              value={addr.id}
              className="pl-6 relative pr-32"
            >
              <span className="block truncate">{addr.name} - {addr.street} {addr.houseNumber}</span>
              <span className="text-xs bg-[#DEF7EC] text-[#005522] font-medium px-2 py-0.5 rounded absolute right-2 top-1/2 -translate-y-1/2">Organisasjon</span>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
