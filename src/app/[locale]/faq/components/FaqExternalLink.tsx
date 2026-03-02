"use client";

const LINK_CLASSNAME = "underline hover:text-[#0F1912]";

interface FaqExternalLinkProps {
	href: string;
	children: React.ReactNode;
}

export function FaqExternalLink({ href, children }: FaqExternalLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={LINK_CLASSNAME}>
			{children}
		</a>
	);
}
