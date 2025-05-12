import { NextResponse } from "next/server";

import { auth } from "./auth";

const protectedRoutes = ["profile"];
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const path = nextUrl.pathname;
	const isApiAuthRoute = path.startsWith(apiAuthPrefix);
	const isProtectedRoute = protectedRoutes.includes(path.replace(/^\/+/, ""));

	if (isApiAuthRoute) {
		return NextResponse.next();
	}
	if (isProtectedRoute && !isLoggedIn) {
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
