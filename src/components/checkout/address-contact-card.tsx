// components/AddressCard.tsx
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Pencil, Loader2, Plus, SquarePen } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddressSelector } from "./address-selector"
import { SavedAddress, AddressFormState } from "../../types/address"
import { getPostalCode } from "@/services/orders.service"

interface AddressCardProps {
  name: string
  label?: string
  street: string
  postalCode: string
  city: string
  addressName?: string
  houseNumber?: string
  extraInfo?: string
  isUserAddress?: boolean
  onSave?: (data: AddressFormState) => void
}

const POSTAL_CODE_REGEX = /^\d{4}$/

export const AddressCard: React.FC<AddressCardProps> = ({
  name,
  label = "Hjemmeadresse",
  street,
  postalCode,
  city,
  addressName = "",
  houseNumber = "",
  extraInfo = "",
  isUserAddress = false,
  onSave
}) => {
  const [editMode, setEditMode] = useState(false)
  const [showExtra, setShowExtra] = useState(!!extraInfo)
  const [isLoading, setIsLoading] = useState(false)
// Mock data - replace with actual data from your tables
const savedAddresses: SavedAddress[] = [
    { id: 'b1', type: 'bruker', name: 'Adresse 1', street: 'Storgata', houseNumber: '1', postalCode: '0155', city: 'Oslo' },
    { id: 'b2', type: 'bruker', name: 'Adresse 2', street: 'Lillegata', houseNumber: '2', postalCode: '0156', city: 'Oslo' },
    { id: 'k1', type: 'kunde', name: 'Adresse 1', street: 'Kundegata', houseNumber: '10', postalCode: '5020', city: 'Bergen' },
    { id: 'k2', type: 'kunde', name: 'Adresse 2', street: 'Bedriftsvei', houseNumber: '20', postalCode: '5021', city: 'Bergen' },
    { id: 'k3', type: 'kunde', name: 'Adresse 3', street: 'Næringsveien', houseNumber: '30', postalCode: '5022', city: 'Bergen' },
    { id: 'o1', type: 'organisasjon', name: 'Adresse 1', street: 'Orggata', houseNumber: '100', postalCode: '7030', city: 'Trondheim' },
    { id: 'o2', type: 'organisasjon', name: 'Adresse 2', street: 'Firmagata', houseNumber: '200', postalCode: '7031', city: 'Trondheim' },
]

const [formData, setFormData] = useState<AddressFormState>({
    name,
    street,
    houseNumber,
    extraInfo,
    postalCode,
    city,
    isUserAddress
  })

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (name === 'postalCode') {
      await fetchCityFromPostalCode(value)
    }
  }

  const handleSave = () => {
    onSave?.(formData)
    setEditMode(false)
  }

  const handleCancel = () => {
    setFormData({
      name,
      street,
      houseNumber,
      extraInfo,
      postalCode,
      city,
      isUserAddress
    })
    setEditMode(false)
  }

  const [cityReadOnly, setCityReadOnly] = useState(true);

  const fetchCityFromPostalCode = async (postalCode: string) => {
    if (!POSTAL_CODE_REGEX.test(postalCode)) {
      setFormData(prev => ({ ...prev, city: "" }))
      setCityReadOnly(false)
      return
    }

    setIsLoading(true)
    try {
      const postalCodeData = await getPostalCode(postalCode)
      if (postalCodeData && postalCodeData.length > 0) {
        setFormData(prev => ({ ...prev, city: postalCodeData[0].city }))
        setCityReadOnly(true)
      } else {
        setFormData(prev => ({ ...prev, city: "" }))
        setCityReadOnly(false)
      }
    } catch (error) {
      console.error("Error fetching city:", error)
      setFormData(prev => ({ ...prev, city: "" }))
      setCityReadOnly(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3 w-full">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 mt-1 " />
            <h2 className="text-lg font-semibold text-foreground">Din adresse</h2>
          </div>
          {editMode && <div
            className=" px-3 py-2 rounded flex items-center gap-1 text-xs bg-[#FDFDEA] text-[#633112] font-bold hover:bg-transparent"
          >
            <SquarePen className="w-4 h-4" />
            Endre adresse
          </div>}
        </div>

        {!editMode ? (
          <div>
            <p className="text-sm text-foreground mb-1">{label}</p>
            <p className="text-sm text-foreground">{street} {houseNumber}</p>
            <p className="text-sm text-foreground">{postalCode} {city}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Lagrede adresser</Label>
              <AddressSelector
                savedAddresses={savedAddresses}
                onAddressSelect={(selectedAddress) => {
                  setFormData(prev => ({
                    ...prev,
                    addressName: selectedAddress.name,
                    street: selectedAddress.street,
                    houseNumber: selectedAddress.houseNumber,
                    postalCode: selectedAddress.postalCode,
                    city: selectedAddress.city,
                    extraInfo: selectedAddress.extraInfo || ''
                  }))
                }}
                onAddNewClick={() => {
                  // Handle new address creation
                  console.log('Add new address')
                }}
              />
            </div>

            <div>
              <Label>Navn på adresse</Label>
              <Input
                name="addressName"
                value={formData.name}
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
                <Input
                  name="extraInfo"
                  value={formData.extraInfo}
                  onChange={handleChange}
                  placeholder="Legg til husnummer"
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
                    className={cn(isLoading && "pr-10")}
                  />
                  {isLoading && (
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
        )}
        {!editMode && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setEditMode(true)}
            className="text-xs mt-4 border-[#C1C4C2] font-medium text-foreground"
            disabled={true}
            >
            <Pencil className="w-3 h-3 mr-1" />
            Endre adresse
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
