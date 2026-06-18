"use client";

import { RefObject, useEffect, useRef } from "react";

/**
 * Fire `callback` when the user clicks anywhere outside the element
 * referenced by `ref`. Use this when the inside-boundary element already has
 * a ref you want to reuse — for the create-the-ref-for-me variant, use
 * `useClickOutside`.
 *
 * Listens on `click` (not `mousedown`) so the callback runs AFTER any child
 * onClick handlers have had a chance to fire. This matters when the outside
 * area contains things like <Link>s — dismissing on mousedown would unmount
 * the link before the click event reaches it, swallowing the navigation.
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
		const handleClick = (event: MouseEvent) => {
			const el = ref.current;
			if (!el) return;
			if (el.contains(event.target as Node)) return;
			callbackRef.current();
		};
		document.addEventListener("click", handleClick);
		return () => document.removeEventListener("click", handleClick);
	}, [ref]);
}
