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
    description: "Setup status, priorities, and next actions.",
    match: "exact",
    icon: "LayoutDashboard",
    location: "sidebar",
  },
  {
    href: "/setup",
    label: "Setup",
    description: "Persistent workspace and app launch checklist.",
    match: "exact",
    activePrefixes: ["/setup", "/onboarding"],
    icon: "ListChecks",
    location: "sidebar",
  },
  {
    href: "/apps",
    label: "Apps",
    description: "Manage app lanes, health, and readiness.",
    activePrefixes: ["/apps", "/apple-health"],
    icon: "AppWindow",
    location: "sidebar",
  },
  {
    href: "/creators",
    label: "Creators",
    description: "Creator records, invites, and linked apps.",
    activePrefixes: ["/creators", "/partners"],
    icon: "Users",
    location: "sidebar",
  },
  {
    href: "/codes",
    label: "Codes",
    description: "Bulk ownership register for creator-linked codes.",
    icon: "Code2",
    location: "sidebar",
  },
  {
    href: "/review",
    label: "Review",
    description: "Review tracked results and attribution decisions.",
    activePrefixes: ["/review", "/events", "/unattributed"],
    icon: "ClipboardCheck",
    location: "sidebar",
  },
  {
    href: "/earnings",
    label: "Earnings",
    description: "Approve or reject earnings before payout prep.",
    activePrefixes: ["/earnings", "/commissions"],
    icon: "DollarSign",
    location: "sidebar",
  },
  {
    href: "/payouts",
    label: "Payouts",
    description: "Track payout status across approved work.",
    activePrefixes: ["/payouts", "/payout-batches"],
    icon: "Wallet",
    location: "sidebar",
  },
  {
    href: "/payout-batches",
    label: "Payout Batches",
    description: "Group payout-ready work into batches.",
    icon: "Layers",
    location: "hidden",
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
