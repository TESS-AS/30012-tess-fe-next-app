"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import type { DimensionType } from "@/types/dimensions.types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dimensionTypes: DimensionType[];
  handleActiveChange: (index: number, checked: boolean) => void;
  handleTypeChange: (index: number, value: string) => void;
  onSave: () => void;
  onAfterCloseFocus?: () => void;
  currentLevel: number;
};

export default function TypeModal({
  open,
  onOpenChange,
  dimensionTypes,
  handleActiveChange,
  handleTypeChange,
  onSave,
  onAfterCloseFocus,
  currentLevel,
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
            <div className={cn("grid grid-cols-2 gap-4", {
              "opacity-50": index !== currentLevel
            })}>
              <div className="space-y-2">
                <p className="text-sm">Dimensjon</p>
                <Input value={dim.dimension} className="bg-[#F8F9F8] border-[#C1C4C2]" readOnly />
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id={`active-${dim.dimension}`}
                    checked={index === currentLevel ? dim.active : false}
                    onCheckedChange={(checked) => handleActiveChange(index, checked as boolean)}
                    disabled={index !== currentLevel}
                  />
                  <label 
                    htmlFor={`active-${dim.dimension}`} 
                    className={cn("text-sm", {
                      "cursor-not-allowed": index !== currentLevel
                    })}
                  >
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
                  readOnly
                  disabled={index !== currentLevel}
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
        <Button 
          onClick={onSave} 
          className={cn("text-white w-fit", {
            "bg-[#009640] hover:bg-[#005522]": dimensionTypes.some(d => d.active),
            "bg-gray-400 cursor-not-allowed": !dimensionTypes.some(d => d.active)
          })} 
          disabled={!dimensionTypes.some(d => d.active)}
        >
          Lagre dimensjonstyper
        </Button>
      </div>
    </Modal>
  );
}
