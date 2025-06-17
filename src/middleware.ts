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

	if (segments.length < 1) return null;

	const rest = segments;

	if (rest[0] === "__default") return null;

	// /search/:productId
	if (rest[0] === "search" && rest.length === 2) {
		const [, productId] = rest;
		const filled = ["__default", "__default", "__default", productId];
		url.pathname = `/${filled.join("/")}`;
		return NextResponse.rewrite(url);
	}

	// /category[/subcategory]/productId
	if (rest.length === 2 || rest.length === 3) {
		const maybeProductId = rest.at(-1);
		const isProductId =
			/^P_[A-Za-z0-9_-]+$/.test(maybeProductId ?? "") ||
			/^\d+$/.test(maybeProductId ?? "");

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
	const path = nextUrl.pathname;

	if (path.startsWith(apiAuthPrefix)) {
		return NextResponse.next();
	}

	const localeRedirect = redirectToLocale(request);
	if (localeRedirect) return localeRedirect;

	const isLoggedIn = !!request.auth;
	const isProtected = protectedRoutes.some((route) =>
		path.split("/").includes(route),
	);

	const rewritten = rewriteProductUrls(request);
	if (rewritten) return rewritten;

	return NextResponse.next();
});

// Only apply to non-static, non-api, non-next routes
export const config = {
	matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
