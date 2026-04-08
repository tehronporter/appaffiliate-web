export type WorkspaceSearchGroup =
  | "Setup"
  | "Apps"
  | "Creators"
  | "Codes"
  | "Review"
  | "Payouts";

export type WorkspaceSearchItem = {
  id: string;
  group: WorkspaceSearchGroup;
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

export const workspaceSearchItems: WorkspaceSearchItem[] = [
  {
    id: "setup-checklist",
    group: "Setup",
    title: "Setup checklist",
    description: "Open the persistent launch checklist for the workspace.",
    href: "/setup",
    keywords: ["setup", "checklist", "onboarding", "activation"],
  },
  {
    id: "apps-workspace",
    group: "Apps",
    title: "Apps",
    description: "Review app lanes, health, and readiness.",
    href: "/apps",
    keywords: ["apps", "apple", "health", "readiness"],
  },
  {
    id: "creators-directory",
    group: "Creators",
    title: "Creator directory",
    description: "Open creators and review program records.",
    href: "/creators",
    keywords: ["partners", "creators", "directory", "invite"],
  },
  {
    id: "creators-invite",
    group: "Creators",
    title: "Add creator",
    description: "Start a new creator record from the create flow.",
    href: "/creators?drawer=create",
    keywords: ["partner", "creator", "invite", "email", "add"],
  },
  {
    id: "codes-register",
    group: "Codes",
    title: "Code register",
    description: "Inspect ownership, status, and linked apps.",
    href: "/codes",
    keywords: ["codes", "register", "ownership", "promo"],
  },
  {
    id: "codes-create",
    group: "Codes",
    title: "Create code",
    description: "Add the next trackable code or link.",
    href: "/codes?drawer=create",
    keywords: ["create", "code", "link", "promo", "tracking"],
  },
  {
    id: "review-results",
    group: "Review",
    title: "All results",
    description: "Review tracked results and operational state.",
    href: "/review?view=all",
    keywords: ["events", "results", "audit", "activity", "review"],
  },
  {
    id: "review-queue",
    group: "Review",
    title: "Review queue",
    description: "Resolve unattributed or blocked result records.",
    href: "/review?view=needs-review",
    keywords: ["queue", "review", "unattributed", "blocked", "approval"],
  },
  {
    id: "payouts-workspace",
    group: "Payouts",
    title: "Payout workspace",
    description: "Review ready groups, batches, and finance state.",
    href: "/payouts",
    keywords: ["payouts", "finance", "batches", "ready"],
  },
  {
    id: "earnings-ledger",
    group: "Payouts",
    title: "Earnings ledger",
    description: "Approve or reject earnings before payout.",
    href: "/earnings",
    keywords: ["commissions", "earnings", "approve", "reject"],
  },
  {
    id: "payout-batches",
    group: "Payouts",
    title: "Payout batches",
    description: "Inspect grouped payout handoffs and exports.",
    href: "/payout-batches",
    keywords: ["batches", "exports", "paid", "finance"],
  },
];
