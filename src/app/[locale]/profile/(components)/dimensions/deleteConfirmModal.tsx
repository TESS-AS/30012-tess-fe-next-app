"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name?: string;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({ open, onOpenChange, name, onConfirm }: Props) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="p-6 space-y-6">
        <div className="flex justify-center">
          <Trash2 className="h-6 w-6 text-[#6B726F]" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-base text-[#5A615D]">Er du sikker på at du vil slette "{name}"?</p>
          <p className="text-base text-[#5A615D]">Dette vil også slette alle underliggende elementer.</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            className="border-[#C1C4C2] text-[#0F1912] hover:bg-[#F3FAF7] hover:text-[#0F1912]"
            onClick={() => onOpenChange(false)}
          >
            Nei, avbryt
          </Button>
          <Button className="bg-[#C81E1E] hover:bg-[#A01818] text-white" onClick={onConfirm}>
            Ja, jeg er sikker
          </Button>
        </div>
      </div>
    </Modal>
  );
}
