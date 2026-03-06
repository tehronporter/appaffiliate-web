import Link from "next/link";

import { AppShell, SectionCard, StatCard } from "@/components/app-shell";

type PlaceholderPageProps = {
  currentPath: string;
  title: string;
  description: string;
  eyebrow?: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  stats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  sections: Array<{
    title: string;
    description: string;
    items: string[];
  }>;
};

function actionLinkClasses(variant: "primary" | "secondary") {
  if (variant === "primary") {
    return "rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700";
  }

  return "rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";
}

export function PlaceholderPage({
  currentPath,
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryAction,
  stats,
  sections,
}: PlaceholderPageProps) {
  const actions = (
    <>
      {secondaryAction ? (
        <Link
          href={secondaryAction.href}
          className={actionLinkClasses("secondary")}
        >
          {secondaryAction.label}
        </Link>
      ) : null}
      {primaryAction ? (
        <Link
          href={primaryAction.href}
          className={actionLinkClasses("primary")}
        >
          {primaryAction.label}
        </Link>
      ) : null}
    </>
  );

  return (
    <AppShell
      currentPath={currentPath}
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={primaryAction || secondaryAction ? actions : undefined}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <SectionCard
            key={section.title}
            title={section.title}
            description={section.description}
            items={section.items}
          />
        ))}
      </div>
    </AppShell>
  );
}
