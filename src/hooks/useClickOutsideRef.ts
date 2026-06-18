"use client";

import { RefObject, useEffect, useRef } from "react";

/**
 * Fire `callback` when the user mousedowns anywhere outside the element
 * referenced by `ref`. Use this when the inside-boundary element already has
 * a ref you want to reuse — for the create-the-ref-for-me variant, use
 * `useClickOutside`.
 *
 * The listener is attached once and always calls the latest `callback` via a
 * ref, so an inline arrow at the call site doesn't cause re-attachment thrash.
 */
export function useClickOutsideRef<T extends HTMLElement>(
	ref: RefObject<T | null>,
	callback: () => void,
) {
	const callbackRef = useRef(callback);
	useEffect(() => {
		callbackRef.current = callback;
	});

	useEffect(() => {
		if (typeof document === "undefined") return;
		const handleMouseDown = (event: MouseEvent) => {
			const el = ref.current;
			if (!el) return;
			if (el.contains(event.target as Node)) return;
			callbackRef.current();
		};
		document.addEventListener("mousedown", handleMouseDown);
		return () => document.removeEventListener("mousedown", handleMouseDown);
	}, [ref]);
}
