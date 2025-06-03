import { NextRequest, NextResponse } from "next/server";

import { auth } from "../auth";

const protectedRoutes = ["profile"];
const apiAuthPrefix = "/api/auth";

function rewriteProductUrls(request: NextRequest) {
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

			url.pathname = `/${locale}/${filled.join("/")}`;
			return NextResponse.rewrite(url);
		}
	}

	return null;
}

export default auth((request) => {
	const { nextUrl } = request;
	const isLoggedIn = !!request.auth;

	const path = nextUrl.pathname;
	const isApiAuthRoute = path.startsWith(apiAuthPrefix);
	const isProtectedRoute = protectedRoutes.some((route) =>
		path.split("/").includes(route),
	);

	if (isApiAuthRoute) {
		return NextResponse.next();
	}

	if (isProtectedRoute && !isLoggedIn) {
		const locale = nextUrl.pathname.split("/")[1];
		return NextResponse.redirect(new URL(`/${locale}/login`, nextUrl));
	}

	const rewriteResponse = rewriteProductUrls(request);
	if (rewriteResponse) {
		return rewriteResponse;
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
