"use client";

const LINK_CLASSNAME =
	"cursor-pointer font-normal text-[#6B7280] underline underline-offset-2 hover:text-[#0F1912] focus:outline-none focus:ring-2 focus:ring-[#1C6D2C] focus:ring-offset-1";

interface FaqLoginLinkProps {
	children: string;
	onClick: () => void;
}

export function FaqLoginLink({ children, onClick }: FaqLoginLinkProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={LINK_CLASSNAME}>
			{children}
		</button>
	);
}
