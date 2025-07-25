import React, { useState } from "react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Modal } from "../ui/modal";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";

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
	const [rating, setRating] = useState<number>(0);
	const [comment, setComment] = useState("");
	const [showComment, setShowComment] = useState(false);

	const handleSubmit = () => {
		onSubmit(rating, comment);
	};

	const handleClose = () => {
		setRating(0);
		setComment("");
		setShowComment(false);
		onClose();
	};

	return (
		<Modal
			open={open}
			onOpenChange={handleClose}>
			<div className="space-y-6">
				<>
					<div>
						<h2 className="mb-2 text-xl font-semibold">
							Tilbakemelding etter kjøp
						</h2>
						<p className="text-muted-foreground font-medium">
							Vi vil gjerne høre hvordan kjøpsopplevelsen din var. Din
							tilbakemelding hjelper oss å bli enda bedre.
						</p>
					</div>

					<div className="space-y-4">
						<div>
							<p className="text-muted-foreground mb-4 font-medium">
								Hvordan opplevde du kjøpet?
							</p>
							<RadioGroup
								value={rating.toString()}
								onValueChange={(value) => setRating(parseInt(value))}
								className="flex flex-col gap-3">
								{[
									{ value: "1", label: "1 - Veldig dårlig" },
									{ value: "2", label: "2 - Dårlig" },
									{ value: "3", label: "3 - Helt grei" },
									{ value: "4", label: "4 - Bra" },
									{ value: "5", label: "5 - Veldig bra" },
								].map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2">
										<RadioGroupItem
											value={option.value}
											id={`rating-${option.value}`}
										/>
										<Label htmlFor={`rating-${option.value}`}>
											{option.label}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						{rating > 0 && (
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
						variant="default">
						Send tilbakemelding
					</Button>
				</>
			</div>
		</Modal>
	);
};
