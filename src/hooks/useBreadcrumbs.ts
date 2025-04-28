import { useParams } from "next/navigation";
import { formatUrlToDisplayName } from "@/lib/utils";

interface BreadcrumbItem {
  href: string;
  label: string;
  current?: boolean;
}

export function useBreadcrumbs(query?: string | null) {
  const params = useParams();
  const category = params.category as string;
  const subcategory = params.subcategory as string;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      href: `/${category}`,
      label: formatUrlToDisplayName(category),
    },
    ...(subcategory
      ? [
          {
            href: `/${category}/${subcategory}`,
            label: formatUrlToDisplayName(subcategory),
          },
        ]
      : []),
    ...(query
      ? [
          {
            href: `/${category}/${subcategory}?query=${query}`,
            label: formatUrlToDisplayName(query),
            current: true,
          },
        ]
      : []),
  ];

  // Mark the last item as current if there's no query
  if (!query && breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].current = true;
  }

  return breadcrumbs;
}
