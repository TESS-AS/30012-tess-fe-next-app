"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import type { DimensionType } from "@/types/dimensions.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dimensionTypes: DimensionType[];
  handleActiveChange: (index: number, checked: boolean) => void;
  handleTypeChange: (index: number, value: string) => void;
  onSave: () => void;
  onAfterCloseFocus?: () => void;
};

export default function TypeModal({
  open,
  onOpenChange,
  dimensionTypes,
  handleActiveChange,
  handleTypeChange,
  onSave,
  onAfterCloseFocus,
}: Props) {
  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v && onAfterCloseFocus) {
          setTimeout(onAfterCloseFocus, 0);
        }
      }}
    >
      <ModalHeader>
        <ModalTitle>Sett dimensjonstyper</ModalTitle>
      </ModalHeader>
      <div className="space-y-8">
        {dimensionTypes.map((dim, index) => (
          <div key={dim.dimension} className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm">Dimensjon</p>
                <Input value={dim.dimension} className="bg-[#F8F9F8] border-[#C1C4C2]" readOnly />
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id={`active-${dim.dimension}`}
                    checked={dim.active}
                    onCheckedChange={(checked) => handleActiveChange(index, checked as boolean)}
                  />
                  <label htmlFor={`active-${dim.dimension}`} className="text-sm">
                    Aktiv
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Type</p>
                <Input
                  placeholder="Skriv type"
                  className="bg-white border-[#C1C4C2] hover:border-[#009640] focus:border-[#009640] focus:ring-1 focus:ring-[#009640]"
                  value={dim.type}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                />
                {index === 0 && <p className="text-xs text-[#6B7280]">Eksempel: Prosjekt, avdeling, arbeidsordre osv.</p>}
              </div>
            </div>
            {index === 0 && (
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Dimensjon vises på utsjekk
                <br />
                og blir påkrevd å fylle ut av alle ansatte
              </p>
            )}
          </div>
        ))}
        <Button onClick={onSave} className="bg-[#009640] hover:bg-[#005522] text-white w-fit">
          Lagre dimensjonstyper
        </Button>
      </div>
    </Modal>
  );
}
