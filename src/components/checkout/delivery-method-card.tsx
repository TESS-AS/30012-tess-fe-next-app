// components/DeliveryMethodCard.tsx
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Truck, X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DeliveryMethodCardProps {
  showWarning?: boolean
  onDismissWarning?: () => void
}

export const DeliveryMethodCard: React.FC<DeliveryMethodCardProps> = ({
  showWarning = true,
  onDismissWarning,
}) => {
  return (
    <Card className="rounded-lg shadow-none">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-foreground" />
          <h2 className="font-semibold text-lg text-foreground">Velg leveringsmåte</h2>
        </div>

        {/* Warning */}
        {showWarning && (
          <div className="relative bg-yellow-50 p-4 rounded-md mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-bold ">
                  Noen varer er ikke på lager i ditt valgte varehus
                </p>
              </div>
            </div>
            <p className="text-sm mt-1">
              Noen varer er ikke på lager i ditt valgte varehus, og det kan ta opptil 3 dager ekstra å få dem levert.
            </p>
            <button
              className="absolute top-3 right-3  hover:text-yellow-700 cursor-pointer"
              onClick={onDismissWarning}
              aria-label="Lukk varsel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Delivery options */}
        <RadioGroup defaultValue="address" className="space-y-3">
          <div className="flex items-start gap-2 pl-1">
            <RadioGroupItem 
              value="address" 
              id="address"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Levering til adresse</p>
              <p className="text-xs text-muted-foreground">Estimert leveringstid: 2 til 7 virkedager</p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
