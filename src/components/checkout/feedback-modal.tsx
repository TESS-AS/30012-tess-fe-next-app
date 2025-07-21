import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const handleSubmit = () => {
    if (step === 1 && rating > 0) {
      if (rating <= 3) {
        setShowComment(true);
        setStep(2);
      } else {
        onSubmit(rating);
        setStep(3);
      }
    } else if (step === 2) {
      onSubmit(rating, comment);
      setStep(3);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setStep(1);
    setRating(0);
    setComment('');
    setShowComment(false);
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <div className="space-y-6">
        {step === 3 ? (
          <>
            <h2 className="text-xl font-semibold">Takk for tilbakemeldingen!</h2>
            <p className="text-muted-foreground">
              Vi setter stor pris på at du tok deg tid til å dele din opplevelse med oss. Din tilbakemelding hjelper oss å bli enda bedre.
            </p>
            <p className="font-medium">Ha en fin dag!</p>
            <Button onClick={handleClose} className="w-full" variant="outlineGreen">
              Lukk
            </Button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-2">Tilbakemelding etter kjøp</h2>
              <p className="text-muted-foreground">
                Vi vil gjerne høre hvordan kjøpsopplevelsen din var. Din tilbakemelding hjelper oss å bli enda bedre.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium mb-4">Hvordan opplevde du kjøpet?</p>
                <RadioGroup
                  value={rating.toString()}
                  onValueChange={(value) => setRating(parseInt(value))}
                  className="flex flex-col gap-3"
                >
                  {[
                    { value: '1', label: '1 - Veldig dårlig' },
                    { value: '2', label: '2 - Dårlig' },
                    { value: '3', label: '3 - Helt grei' },
                    { value: '4', label: '4 - Bra' },
                    { value: '5', label: '5 - Veldig bra' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`rating-${option.value}`} />
                      <Label htmlFor={`rating-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {step === 2 && (
                <div>
                  <Label>Har du kommentarer? (valgfritt)</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Fortell oss gjerne hva som fungerte bra, eller hva vi kan forbedre"
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              variant="outlineGreen"
              className="w-full"
            >
              Send tilbakemelding
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
