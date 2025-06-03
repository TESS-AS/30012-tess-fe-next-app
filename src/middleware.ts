import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "../auth";
import { routing } from "./i18n/routing";

// Route groups
const protectedRoutes = ["profile"];
const apiAuthPrefix = "/api/auth";

// Rewriting product-related URLs
function rewriteProductUrls(request: NextRequest): NextResponse | null {
	const url = request.nextUrl.clone();
	const segments = url.pathname.split("/").filter(Boolean);

	if (segments.length < 2) return null;

	const [locale, ...rest] = segments;

	if (rest[0] === "__default") return null;

	// /locale/search/:productId
	if (rest[0] === "search" && rest.length === 2) {
		const [, productId] = rest;
		const filled = ["__default", "__default", "__default", productId];
		url.pathname = `/${locale}/${filled.join("/")}`;
		return NextResponse.rewrite(url);
	}

	// /locale/category[/subcategory]/productId
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
			url.pathname = `/${locale}/${filled.join("/")}`;
			return NextResponse.rewrite(url);
		}
	}

	return null;
}

// Middleware logic
export default auth((request) => {
	const { nextUrl } = request;
	const path = nextUrl.pathname;
	const isApiAuthRoute = path.startsWith(apiAuthPrefix);

	// Allow auth APIs to pass through
	if (isApiAuthRoute) {
		return NextResponse.next();
	}

	// Check authentication
	const isLoggedIn = !!request.auth;
	const isProtected = protectedRoutes.some((route) =>
		path.split("/").includes(route)
	);

	if (isProtected && !isLoggedIn) {
		const locale = nextUrl.pathname.split("/")[1];
		return NextResponse.redirect(new URL(`/${locale}/login`, nextUrl));
	}

	// Rewriting product URLs
	const rewritten = rewriteProductUrls(request);
	if (rewritten) return rewritten;

	// Apply next-intl middleware (last, minimal header effect)
	const intlMiddleware = createIntlMiddleware({
		locales: ["en", "no"],
		defaultLocale: "en",
		localeDetection: false, // Avoid Accept-Language header parsing
	});
	return intlMiddleware(request);
});

// Only apply to non-static, non-api, non-next routes
export const config = {
	matcher: ["/((?!_next|favicon.ico|api|.*\\..*).*)"],
};
