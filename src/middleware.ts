import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const url = request.nextUrl.clone();
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length < 2) return response;

  const [locale, ...rest] = segments;

  // CASE 1: /locale/search/:productId
  if (rest[0] === "search" && rest.length === 2) {
    const productId = rest[1];
    const filled = ["__default", "__default", "__default", productId];
    url.pathname = `/${locale}/${filled.join("/")}`;
    return NextResponse.rewrite(url);
  }

  // CASE 2: /locale/category[/subcategory]/productId (only if ID looks valid)
  if (rest.length === 2 || rest.length === 3) {
    const maybeProductId = rest.at(-1);
    const isProductId = /^P_[A-Za-z0-9_-]+$/.test(maybeProductId ?? "") || /^\d+$/.test(maybeProductId ?? "");

    if (isProductId) {
      const filled = [...rest];
      while (filled.length < 4) {
        filled.splice(filled.length - 1, 0, "__default");
      }

      url.pathname = `/${locale}/${filled.join("/")}`;
      return NextResponse.rewrite(url);
    }
  }

  // CASE 3: Full 4-segment product path — pass through
  if (rest.length === 4) {
    const maybeProductId = rest.at(-1);
    const isProductId = /^P_[A-Za-z0-9_-]+$/.test(maybeProductId ?? "");

    if (isProductId) {
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
