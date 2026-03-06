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
        description: "Performance snapshot and workspace health.",
        match: "exact",
      },
    ],
  },
  {
    title: "Program",
    items: [
      {
        href: "/onboarding",
        label: "Onboarding",
        description: "Launch checklist for apps, partners, and readiness.",
      },
      {
        href: "/partners",
        label: "Partners",
        description: "Directory for creators, affiliates, and owners.",
      },
      {
        href: "/codes",
        label: "Codes",
        description: "Referral code ownership and coverage.",
      },
      {
        href: "/apps/demo-app/apple-health",
        label: "Apple Health",
        description: "App-specific setup and implementation notes.",
        activePrefixes: ["/apps/"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/unattributed",
        label: "Needs Attribution",
        description: "Resolve unattributed installs, trials, and purchases.",
      },
      {
        href: "/commissions",
        label: "Commissions",
        description: "Review earnings states and payout readiness.",
      },
      {
        href: "/payout-batches",
        label: "Payouts",
        description: "Batching and finance handoff.",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        href: "/settings",
        label: "Workspace Settings",
        description: "Org-level controls, roles, and future configuration.",
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
