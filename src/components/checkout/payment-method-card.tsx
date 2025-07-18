import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Wallet } from "lucide-react"

export const PaymentMethodCard = () => {
  return (
    <Card className="rounded-lg shadow-none">
      <CardContent className="p-6">
        <div className="flex items-start gap-2 mb-6">
          <Wallet className="w-5 h-5 mt-1" />
          <h2 className="text-xl font-semibold text-foreground">Velg betalingsmåte</h2>
        </div>

        <RadioGroup defaultValue="faktura">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="faktura" id="faktura" />
            <Label htmlFor="faktura" className="font-medium text-sm">Faktura</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
