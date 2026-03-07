export type WorkspaceSearchGroup = "Creators" | "Codes" | "Events" | "Payouts";

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
    id: "creators-directory",
    group: "Creators",
    title: "Creator directory",
    description: "Open partners and review creator records.",
    href: "/partners",
    keywords: ["partners", "creators", "directory", "invite"],
  },
  {
    id: "creators-invite",
    group: "Creators",
    title: "Invite creator",
    description: "Start a new creator record from the drawer flow.",
    href: "/partners?drawer=create",
    keywords: ["partner", "creator", "invite", "email"],
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
    id: "events-register",
    group: "Events",
    title: "Events table",
    description: "Review tracked results and operational state.",
    href: "/events",
    keywords: ["events", "results", "audit", "activity"],
  },
  {
    id: "events-review-queue",
    group: "Events",
    title: "Review queue",
    description: "Resolve unattributed or blocked result records.",
    href: "/unattributed",
    keywords: ["queue", "review", "unattributed", "blocked"],
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
    id: "commissions-ledger",
    group: "Payouts",
    title: "Commission ledger",
    description: "Approve or reject earnings before payout.",
    href: "/commissions",
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

