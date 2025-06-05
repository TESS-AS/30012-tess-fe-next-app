import { NextRequest, NextResponse } from "next/server";

import { auth } from "../auth";

// Route groups
const protectedRoutes = ["profile"];
const apiAuthPrefix = "/api/auth";

// Rewriting product-related URLs
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
			url.pathname = `/${filled.join("/")}`;
			return NextResponse.rewrite(url);
		}
	}

	return null;
}

// Middleware logic
export default auth((request) => {
	if (process.env.NODE_ENV !== "production") {
		console.log("=== HEADERS START ===");
		for (const [key, value] of request.headers.entries()) {
			console.log(`${key}: ${value}`);
		}
		console.log("=== HEADERS END ===");
	}

	const { nextUrl } = request;
	const path = nextUrl.pathname;
	const isApiAuthRoute = path.startsWith(apiAuthPrefix);

	if (isApiAuthRoute) {
		return NextResponse.next();
	}

	const isLoggedIn = !!request.auth;
	const isProtected = protectedRoutes.some((route) =>
		path.split("/").includes(route),
	);

	if (isProtected && !isLoggedIn) {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	const rewritten = rewriteProductUrls(request);
	if (rewritten) return rewritten;

	return NextResponse.next();
});

// Only apply to non-static, non-api, non-next routes
export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
