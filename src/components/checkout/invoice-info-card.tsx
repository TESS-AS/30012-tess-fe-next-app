import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"

export const InvoiceInfoCard = () => {
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

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Dimensjon 1 - Prosjekt *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Søk eller skriv prosjektnavn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project1">Project 1</SelectItem>
                <SelectItem value="project2">Project 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Dimensjon 2 - Avdeling</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Søk eller skriv avdeling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dept1">Department 1</SelectItem>
                <SelectItem value="dept2">Department 2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs font-medium text-muted-foreground mt-1">Eksempel: Internt kostnadsted som skal belastes</p>
          </div>

          <div>
            <Label className="mb-2 block">Dimensjon 3 - Kategori</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Søk eller skriv kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cat1">Category 1</SelectItem>
                <SelectItem value="cat2">Category 2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs font-medium text-muted-foreground mt-1">Eksempel: Type utgift eller produktkategori</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
