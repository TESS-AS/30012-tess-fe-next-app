import type React from "react";

export function Overlay({
	navRef,
	onClose,
}: {
	navRef: React.RefObject<HTMLElement | null>;
	onClose: () => void;
}) {
	return (
		<div
			className="fixed inset-x-0 bottom-0 z-40 cursor-pointer bg-[#0F1912]/25"
			onClick={onClose}
			ref={(el) => {
				if (el && navRef.current) {
					el.style.top = `${navRef.current.getBoundingClientRect().bottom}px`;
				}
			}}
		/>
	);
}
