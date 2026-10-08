"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after `delayMs` of inactivity. The returned value trails
 * the input while the user is still typing/mutating, and catches up once
 * the burst stops.
 *
 * Why centralize: there are 6+ inline `setTimeout` debounces across the
 * app (user search, order history, product search, slider filters…) that
 * all do this manually. New call sites should prefer this hook.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(t);
	}, [value, delayMs]);

	return debounced;
}
