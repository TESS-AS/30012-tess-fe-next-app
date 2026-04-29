import { RefObject, useLayoutEffect, useState } from "react";

/**
 * Detects when an element's children collectively overflow its width.
 * Uses ResizeObserver + rAF for cheap, debounced measurement.
 *
 * `resetKey` clears the overflow flag when the contents change so a fresh
 * measurement runs in the comfortable state.
 */
export function useChildrenOverflow(
	ref: RefObject<HTMLElement | null>,
	resetKey: string,
): boolean {
	const [isOverflowing, setIsOverflowing] = useState(false);

	useLayoutEffect(() => {
		setIsOverflowing(false);
	}, [resetKey]);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		let raf: number | null = null;
		const measure = () => {
			if (raf != null) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				raf = null;
				if (!el) return;
				const items = Array.from(el.children) as HTMLElement[];
				if (items.length === 0) return;
				const itemsWidth = items.reduce((s, it) => s + it.offsetWidth, 0);
				if (itemsWidth > el.clientWidth + 1) {
					setIsOverflowing((prev) => (prev ? prev : true));
				}
			});
		};

		const observer = new ResizeObserver(measure);
		observer.observe(el);
		measure();

		return () => {
			observer.disconnect();
			if (raf != null) cancelAnimationFrame(raf);
		};
	}, [ref, resetKey, isOverflowing]);

	return isOverflowing;
}
