import { Fragment, type ReactNode } from "react";

import { CONTENT_EMAIL_REGEX, CONTENT_EMAILS } from "./constants";

/**
 * Converts plain-text email addresses (netthandel@tess.no, tess@tess.no) in a string
 * into underlined mailto links. Non-string content is returned unchanged.
 */
export function renderWithEmailLinks(content: ReactNode): ReactNode {
	if (typeof content !== "string") return content;
	const parts = content.split(CONTENT_EMAIL_REGEX);
	if (parts.length <= 1) return content;
	return parts.map((part, i) =>
		CONTENT_EMAILS.includes(part as (typeof CONTENT_EMAILS)[number]) ? (
			<a
				key={`email-${i}`}
				href={`mailto:${part}`}
				className="underline hover:text-[#0F1912]">
				{part}
			</a>
		) : (
			<Fragment key={`text-${i}`}>{part}</Fragment>
		),
	);
}
