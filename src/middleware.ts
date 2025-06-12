import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { auth } from "../auth";
import { routing } from "./i18n/routing";

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
	const isLoggedIn = !!request.auth;

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

	if (isProtected && !isLoggedIn) {
		return NextResponse.redirect(
			new URL(`/${path.split("/")[1]}/login`, nextUrl),
		);
	}

	// Handle URL rewrites first
	const rewriteResponse = rewriteProductUrls(request);
	if (rewriteResponse) {
		return rewriteResponse;
	}

	// Then handle internationalization
	const intlMiddleware = createIntlMiddleware(routing);
	return intlMiddleware(request);
});

export const config = {
	matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};