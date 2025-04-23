"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator, showHome = true, ...props }, ref) => {
    const Separator = separator || <ChevronRight className="h-4 w-4" />;

    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn(
          "inline-flex items-center space-x-2 text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        <ol className="inline-flex items-center space-x-2">
          {showHome && (
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-muted-foreground hover:text-foreground"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
          )}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <React.Fragment key={item.href}>
                {index > 0 || showHome ? (
                  <li
                    aria-hidden="true"
                    className="select-none text-muted-foreground/40"
                  >
                    {Separator}
                  </li>
                ) : null}
                <li className="inline-flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:text-foreground",
                      isLast
                        ? "font-semibold text-foreground pointer-events-none"
                        : "text-muted-foreground"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb, type BreadcrumbItem };