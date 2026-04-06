import { Link } from "@/i18n/navigation";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-border" aria-hidden>
                  /
                </span>
              )}
              {isLast ? (
                <span className="font-medium text-foreground">{item.label}</span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="transition hover:text-accent hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-muted">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
