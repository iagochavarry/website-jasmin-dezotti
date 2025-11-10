import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
                <li>
                    <Link
                        href="/"
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        Início
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        <svg
                            className="h-4 w-4 text-[var(--color-text-muted)]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-[var(--color-text-primary)] font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
