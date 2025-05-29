import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	console.log("Middleware triggered: new version", request.nextUrl.pathname);
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next|static|trpc|_vercel|.*\\..*|favicon.ico).*)"],
};
