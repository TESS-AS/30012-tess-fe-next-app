import React, { useState } from "react";

import { useTranslations } from "next-intl";

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
	const t = useTranslations("Checkout.modals.feedback");
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
						<h2 className="mb-2 text-xl font-semibold">{t("title")}</h2>
						<p className="text-muted-foreground font-medium">
							{t("description")}
						</p>
					</div>

					<div className="space-y-4">
						<div>
							<p className="text-muted-foreground mb-4 font-medium">
								{t("question")}
							</p>
							<RadioGroup
								value={rating.toString()}
								onValueChange={(value) => setRating(parseInt(value))}
								className="flex flex-col gap-3">
								{[
									{ value: "1", label: t("ratings.1") },
									{ value: "2", label: t("ratings.2") },
									{ value: "3", label: t("ratings.3") },
									{ value: "4", label: t("ratings.4") },
									{ value: "5", label: t("ratings.5") },
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
								<Label>{t("commentLabel")}</Label>
								<Textarea
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									placeholder={t("commentPlaceholder")}
									className="mt-2"
								/>
							</div>
						)}
					</div>

					<Button
						onClick={handleSubmit}
						disabled={rating === 0}
						variant="default">
						{t("submit")}
					</Button>
				</>
			</div>
		</Modal>
	);
};
