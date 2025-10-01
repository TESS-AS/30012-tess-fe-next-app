"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface RFQRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onRemoveId?: (id: string) => void;
  onSubmit: (payload: { requestType: string; comment: string; ids: string[] }) => Promise<void> | void;
  className?: string;
}

export function RFQRequestDialog({
  open,
  onOpenChange,
  selectedIds,
  onRemoveId,
  onSubmit,
  className,
}: RFQRequestDialogProps) {
  const [requestType, setRequestType] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ requestType, comment: comment.trim(), ids: selectedIds });
      setRequestType("");
      setComment("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl rounded-2xl p-0 max-h-[85vh] overflow-y-auto", className)}>
        <DialogHeader className="px-6 pt-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            Legg til forespørsel (RFQ)
            <Info className="h-4 w-4 text-[#5A615D]" />
          </DialogTitle>
          <DialogClose className="text-muted-foreground" />
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          {/* Selected IDs chips */}
          <div className="rounded-md border border-[#C1C4C2] bg-white p-3">
            <p className="mb-2 text-sm font-medium text-[#0F1912]">Valgte slanger som skal behandles</p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.length === 0 ? (
                <span className="text-sm text-[#5A615D]">Ingen valgt</span>
              ) : (
                selectedIds.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1 rounded-md bg-[#E8EAE9] px-2 py-1 text-xs text-[#005522]">
                    {id}
                    {onRemoveId && (
                      <button
                        type="button"
                        aria-label="Fjern"
                        onClick={() => onRemoveId(id)}
                        className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-sm p-0.5 hover:bg-[#d6ecdb]"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Request type */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#0F1912]">Forespørselstype</label>
              <Info className="h-4 w-4 text-[#5A615D]" />
            </div>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Velg forespørselstype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m-trykktest">m/trykktest og sertifikat</SelectItem>
                <SelectItem value="u-trykktest">u/trykktest og sertifikat</SelectItem>
                <SelectItem value="uspesifisert">Uspesifisert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#0F1912]">Leveringsadresse / Kommentar</label>
            <Textarea
              placeholder="Legg til kommentar"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border-[#8A8F8C] bg-[#F8F9F8] text-[#5A615D]"
            />
          </div>

          <Button
            className="mt-2 w-full bg-[#1C6D2C] text-white hover:bg-[#164B1F]"
            disabled={submitting || !requestType}
            onClick={handleSubmit}
          >
            {submitting ? "Sender..." : "Send forespørsel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
