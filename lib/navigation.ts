export type NavItem = {
  href: string;
  label: string;
  description: string;
  match?: "exact" | "prefix";
  activePrefixes?: string[];
  icon: string;
  location?: "sidebar" | "utility" | "hidden";
  dividerAfter?: boolean;
};

export const PARTNER_PORTAL_BASE_PATH = "/portal";

export const workspaceNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Performance, review posture, and next actions.",
    match: "exact",
    icon: "LayoutDashboard",
    location: "sidebar",
  },
  {
    href: "/onboarding",
    label: "Activation",
    description: "First-run milestones and launch readiness.",
    match: "exact",
    icon: "Rocket",
    location: "sidebar",
    dividerAfter: true,
  },
  {
    href: "/partners",
    label: "Partners",
    description: "Creator records and program coverage.",
    icon: "Users",
    location: "sidebar",
  },
  {
    href: "/codes",
    label: "Codes",
    description: "Code ownership, status, and app links.",
    icon: "Code2",
    location: "sidebar",
  },
  {
    href: "/apple-health",
    label: "Apple Health",
    description: "Apple ingest readiness by app.",
    activePrefixes: ["/apps/", "/apple-health"],
    icon: "Heart",
    location: "sidebar",
  },
  {
    href: "/events",
    label: "Events",
    description: "Inspect event flow and tracked state.",
    icon: "Activity",
    location: "sidebar",
  },
  {
    href: "/unattributed",
    label: "Unattributed",
    description: "Resolve items still waiting for attribution.",
    icon: "AlertTriangle",
    location: "sidebar",
    dividerAfter: true,
  },
  {
    href: "/commissions",
    label: "Commissions",
    description: "Review commission state before payout prep.",
    icon: "DollarSign",
    location: "sidebar",
  },
  {
    href: "/payouts",
    label: "Payouts",
    description: "Track payout status across approved work.",
    icon: "Wallet",
    location: "sidebar",
  },
  {
    href: "/payout-batches",
    label: "Payout Batches",
    description: "Group payout-ready work into batches.",
    icon: "Layers",
    location: "sidebar",
  },
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
    icon: "Settings",
    location: "utility",
  },
  {
    href: "/settings/audit",
    label: "Audit",
    description: "Activity history and operational trail.",
    match: "exact",
    activePrefixes: ["/settings/audit"],
    icon: "FileSearch",
    location: "hidden",
  },
  {
    href: "/settings/exports",
    label: "Exports",
    description: "Finance exports and download history.",
    match: "exact",
    activePrefixes: ["/settings/exports"],
    icon: "Download",
    location: "hidden",
  },
];

export const workspaceSidebarNavItems = workspaceNavItems.filter(
  (item) => item.location === "sidebar",
);

export const workspaceUtilityNavItems = workspaceNavItems.filter(
  (item) => item.location === "utility",
);

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
  for (const item of workspaceNavItems) {
    if (isNavItemActive(pathname, item)) {
      return {
        item,
      };
    }
  }

  return null;
}
