import React from "react";

import { cn } from "@/lib/utils";

interface CharLimitFeedbackProps {
	helperText?: React.ReactNode;
	valueLength: number;
	maxLength: number;
	showTooLong?: boolean;
	exceededText?: React.ReactNode;
}

export const CharLimitFeedback: React.FC<CharLimitFeedbackProps> = ({
	helperText,
	valueLength,
	maxLength,
	showTooLong,
	exceededText,
}) => {
	const isAtLimit = valueLength >= maxLength;
	const isTooLong = !!showTooLong;

	return (
		<div className="flex items-center justify-between">
			{helperText ? (
				<p className="text-muted-foreground mt-1 text-xs font-medium">{helperText}</p>
			) : (
				<span />
			)}
			<div className="mt-1 flex items-center justify-between">
				{isTooLong ? (
					<p className="text-xs font-medium text-red-600">
						{exceededText ?? `Maks ${maxLength} tegn`}
					</p>
				) : (
					<span />
				)}
				<p
					className={cn(
						"text-xs font-medium",
						(isAtLimit || isTooLong) && "text-red-600",
						!(isAtLimit || isTooLong) && "text-muted-foreground",
					)}>
					{valueLength}/{maxLength}
				</p>
			</div>
		</div>
	);
};
