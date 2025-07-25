import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { UserDimensionsInput } from "./user-dimensions"
import { Order } from "@/types/orders.types"

interface Props {
  orderData: Order
  setOrderData: (data: any) => void
  dimensionInputMode: "select" | "search" | "manual";
  setDimensionInputMode: (mode: "select" | "search" | "manual") => void;
}

export const InvoiceInfoCard = ({ orderData, setOrderData, dimensionInputMode, setDimensionInputMode }: Props) => {

  return (
    <Card className="rounded-lg shadow-none">
      <CardContent className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <FileText className="w-5 h-5 mt-1" />
          <h2 className="text-xl font-semibold text-foreground">Tilleggsinformasjon for faktura</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Opplysningene vises på fakturaen og hjelper økonomiavdelingen med riktig bokføring.
        </p>

        <UserDimensionsInput 
          orderData={orderData}
          setOrderData={setOrderData}
          dimensionInputMode={dimensionInputMode}
          setDimensionInputMode={setDimensionInputMode}
        /> 
      </CardContent>
    </Card>
  )
}
