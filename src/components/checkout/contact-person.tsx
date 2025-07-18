import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User2, SquarePen } from "lucide-react"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface ContactPersonProps {
  firstName: string
  lastName: string
  email: string
  phone: string
  onSave?: (updated: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }) => void
}

export const ContactPerson: React.FC<ContactPersonProps> = ({
  firstName,
  lastName,
  email,
  phone,
  onSave,
}) => {
  const [editMode, setEditMode] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [formData, setFormData] = useState({ firstName, lastName, email, phone })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setFormData({ firstName, lastName, email, phone })
    setEditMode(false)
    setIsSaved(false)
  }

  const handleSave = () => {
    onSave?.(formData)
    setEditMode(false)
    setIsSaved(true)
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardContent className="p-6  flex flex-col items-start">
        <div className="flex justify-between items-start mb-3 w-full">
          <div className="flex items-start gap-2">
            <User2 className="w-5 h-5 mt-1" />
            <h2 className="text-lg font-semibold text-foreground">Kontaktperson</h2>
          </div>

          {editMode && <div
            className=" px-3 py-2 rounded flex items-center gap-1 text-xs bg-[#FDFDEA] text-[#633112] font-bold hover:bg-transparent"
          >
            <SquarePen className="w-4 h-4" />
            Endre kontaktperson
          </div>}
        </div>

        {editMode ? (
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

            {/* E-post */}
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
              <Button onClick={handleCancel} variant="outline" className="text-foreground font-medium">
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <div className="">
            <p className="text-sm text-foreground mb-1">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-foreground mb-1">{email}</p>
            <p className="text-sm text-foreground">{phone}</p>
          </div>
        )}

        {isSaved && !editMode && <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 mt-4 text-xs font-medium text-[#005522] bg-[#DEF7EC] rounded">
          <Image src="/icons/map-pin-alt.svg" alt="map-pin-alt" width={10} height={10} />
          Hentet fra profil
        </div>}
        {!editMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditMode(true)}
            className="text-xs mt-4 border-[#C1C4C2] font-medium text-foreground"
          >
            <SquarePen className="w-1 h-1 mr-1" />
            Endre kontaktperson
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
