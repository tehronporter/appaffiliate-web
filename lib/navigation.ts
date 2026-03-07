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
        description: "Workspace health, queue posture, and launch readiness.",
        match: "exact",
      },
      {
        href: "/onboarding",
        label: "Launch checklist",
        description: "Readiness across apps, partners, finance, and controls.",
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
        description: "Partner records, ownership context, and program coverage.",
      },
      {
        href: "/codes",
        label: "Codes",
        description: "Promo code ownership, status, and linked apps.",
      },
      {
        href: "/apps/demo-app/apple-health",
        label: "Apple Health",
        description: "Apple ingest readiness and receipt health by app.",
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
        description: "Inspect event flow and attributed state safely.",
      },
      {
        href: "/unattributed",
        label: "Unattributed",
        description: "Resolve items that still need partner or code attribution.",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        href: "/commissions",
        label: "Commissions",
        description: "Review commission state before payout preparation.",
      },
      {
        href: "/payouts",
        label: "Payouts",
        description: "Track payout status across approved records.",
      },
      {
        href: "/payout-batches",
        label: "Payout batches",
        description: "Group payout-ready work into exportable batches.",
      },
      {
        href: "/settings/exports",
        label: "Exports",
        description: "Finance-ready exports and download history.",
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
        description: "Organization details, team context, and rules.",
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
        description: "Activity history for internal workflow changes.",
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
