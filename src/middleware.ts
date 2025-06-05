import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "../auth";

// Route groups
const protectedRoutes = ["profile"];
const apiAuthPrefix = "/api/auth";

// URL Rewriter
function rewriteProductUrls(request: NextRequest): NextResponse | null {
	const url = request.nextUrl.clone();
	const segments = url.pathname.split("/").filter(Boolean);

	if (segments.length < 2) return null;
	const [locale, ...rest] = segments;

	if (rest[0] === "__default") return null;

	if (rest[0] === "search" && rest.length === 2) {
		const [, productId] = rest;
		const filled = ["__default", "__default", "__default", productId];
		url.pathname = `/${filled.join("/")}`;
		return NextResponse.rewrite(url);
	}

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
	if (process.env.NODE_ENV === "production") {
		console.log("=== HEADERS START ===");
		for (const [key, value] of request.headers.entries()) {
			console.log(`${key}: ${value}`);
		}
		console.log("=== HEADERS END ===");
	}
	if (process.env.NODE_ENV === "production") {
		let size = 0;
		for (const [k, v] of request.headers.entries()) {
			size += Buffer.byteLength(k + v);
		}
		console.log(`PROD Header size: ${size} bytes`);
	}

	const { nextUrl } = request;
	const isLoggedIn = !!request.auth;
	const path = nextUrl.pathname;
	const isApiAuthRoute = path.startsWith(apiAuthPrefix);
	const isProtectedRoute = protectedRoutes.some((route) =>
		path.split("/").includes(route),
	);

	if (isApiAuthRoute) return NextResponse.next();

	if (isProtectedRoute && !isLoggedIn) {
		const locale = nextUrl.pathname.split("/")[1];
		return NextResponse.redirect(new URL(`/${locale}/login`, nextUrl));
	}

	const rewritten = rewriteProductUrls(request);
	if (rewritten) return rewritten;

	const intlMiddleware = createIntlMiddleware({
		locales: ["en", "no"],
		defaultLocale: "no",
		localeDetection: false,
	});

	return intlMiddleware(request);
});

// ✅ Matcher improved to avoid static/API routes
export const config = {
	matcher: ["/((?!_next|favicon.ico|api|static|.*\\..*).*)"],
};
