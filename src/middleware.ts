import { NextRequest, NextResponse } from "next/server";

import { auth } from "../auth";

const protectedRoutes = ["profile"];
const apiAuthPrefix = "/api/auth";
const supportedLocales = ["en", "no"];

function redirectToLocale(request: NextRequest): NextResponse | null {
	const { pathname } = request.nextUrl;

	const hasLocale = supportedLocales.some((locale) =>
		pathname.startsWith(`/${locale}`),
	);

	if (!hasLocale) {
		const locale = "no";
		return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
	}

	return null;
}

function rewriteProductUrls(request: NextRequest): NextResponse | null {
	const url = request.nextUrl.clone();
	const segments = url.pathname.split("/").filter(Boolean);

	if (segments.length < 2) return null;

	const [locale, ...rest] = segments;

	if (rest[0] === "__default") return null;

	// CASE 1: /locale/search/:productId
	if (rest[0] === "search" && rest.length === 2) {
		const [, productId] = rest;
		const filled = ["__default", "__default", "__default", productId];
		url.pathname = `/${locale}/${filled.join("/")}`;
		return NextResponse.rewrite(url);
	}

	// CASE 2: /locale/category[/subcategory]/productId (only if ID looks valid)
	if (rest.length === 2 || rest.length === 3) {
		const maybeProductId = rest.at(-1);
		const isProductId = maybeProductId
			? // P_ prefixed IDs with alphanumeric and special chars
				/^P_[A-Za-z0-9_-]+$/.test(maybeProductId) ||
				// Pure numeric IDs
				/^\d+$/.test(maybeProductId) ||
				// Prefixed IDs with optional hyphenated suffixes
				/^(AT|TR|VH|VS|US|GW|KN|KF|CW|GK|AV|JB|AU|AS|AK|VM|ZS)\d+(?:-[A-Za-z0-9]+)?$/i.test(
					maybeProductId,
				) ||
				// Special p_rw format
				/^p_rw\d+$/i.test(maybeProductId)
			: false;

		if (isProductId) {
			const filled = [...rest];
			while (filled.length < 4) {
				filled.splice(filled.length - 1, 0, "__default");
			}
			url.pathname = `/${segments[0]}/${filled.join("/")}`;
			return NextResponse.rewrite(url);
		}
	}

	return null;
}

export default auth((request) => {
	const { nextUrl } = request;
	const isLoggedIn = !!request.auth;

	const path = nextUrl.pathname;

	if (path.startsWith(apiAuthPrefix)) {
		return NextResponse.next();
	}

	const localeRedirect = redirectToLocale(request);
	if (localeRedirect) return localeRedirect;

	const isProtected = protectedRoutes.some((route) =>
		path.split("/").includes(route),
	);

	const rewritten = rewriteProductUrls(request);
	if (rewritten) return rewritten;

	return NextResponse.next();
});

// Only apply to non-static, non-api, non-next routes
export const config = {
	matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};
