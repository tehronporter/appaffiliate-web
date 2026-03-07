export type NavItem = {
  href: string;
  label: string;
  description: string;
  match?: "exact" | "prefix";
  activePrefixes?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const PARTNER_PORTAL_BASE_PATH = "/portal";

export const workspaceNavGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        description: "Performance, review posture, and next actions.",
        match: "exact",
      },
      {
        href: "/onboarding",
        label: "Activation",
        description: "First-run milestones and launch readiness.",
        match: "exact",
      },
    ],
  },
  {
    title: "Program",
    items: [
      {
        href: "/partners",
        label: "Partners",
        description: "Creator records and program coverage.",
      },
      {
        href: "/codes",
        label: "Codes",
        description: "Code ownership, status, and app links.",
      },
      {
        href: "/apps/demo-app/apple-health",
        label: "Apple Health",
        description: "Apple ingest readiness by app.",
        activePrefixes: ["/apps/"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/events",
        label: "Events",
        description: "Inspect event flow and tracked state.",
      },
      {
        href: "/unattributed",
        label: "Unattributed",
        description: "Resolve items still waiting for attribution.",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        href: "/commissions",
        label: "Commissions",
        description: "Review commission state before payout prep.",
      },
      {
        href: "/payouts",
        label: "Payouts",
        description: "Track payout status across approved work.",
      },
      {
        href: "/payout-batches",
        label: "Payout batches",
        description: "Group payout-ready work into batches.",
      },
      {
        href: "/settings/exports",
        label: "Exports",
        description: "Finance exports and download history.",
        match: "exact",
        activePrefixes: ["/settings/exports"],
      },
    ],
  },
  {
    title: "Controls",
    items: [
      {
        href: "/settings",
        label: "Settings",
        description: "Organization, team, and rules.",
        match: "exact",
        activePrefixes: [
          "/settings/organization",
          "/settings/team",
          "/settings/rules",
        ],
      },
      {
        href: "/settings/audit",
        label: "Audit",
        description: "Activity history and operational trail.",
        match: "exact",
        activePrefixes: ["/settings/audit"],
      },
    ],
  },
];

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.activePrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getRouteContext(pathname: string) {
  for (const group of workspaceNavGroups) {
    for (const item of group.items) {
      if (isNavItemActive(pathname, item)) {
        return {
          groupTitle: group.title,
          item,
        };
      }
    }
  }

  return null;
}
