import {
  ActionLink,
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/app-shell";

type PlaceholderPageProps = {
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
    tone?: "primary" | "success" | "warning";
  }>;
  sections: Array<{
    title: string;
    description: string;
    items: string[];
  }>;
};

export function PlaceholderPage({
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
        <ActionLink href={secondaryAction.href}>{secondaryAction.label}</ActionLink>
      ) : null}
      {primaryAction ? (
        <ActionLink href={primaryAction.href} variant="primary">
          {primaryAction.label}
        </ActionLink>
      ) : null}
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={primaryAction || secondaryAction ? actions : undefined}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            tone={stat.tone}
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
    </PageContainer>
  );
}
