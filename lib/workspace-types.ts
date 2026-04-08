export const PHASE0_ROLE_KEYS = [
  "owner",
  "admin",
  "finance",
  "analyst",
  "partner_user",
] as const;

export type RoleKey = (typeof PHASE0_ROLE_KEYS)[number];

export type RoleDefinition = {
  key: RoleKey;
  name: string;
  description: string;
};

export type OrganizationRecord = {
  id: string;
  slug: string;
  name: string;
};

export type OrganizationMembershipRecord = {
  id: string;
  organization_id: string;
  user_id: string;
  role_key: RoleKey;
  status: "active" | "invited" | "disabled";
};

export type PartnerUserRecord = {
  id: string;
  organization_id: string;
  user_id: string;
  partner_id: string | null;
  display_name: string | null;
  partner_name: string | null;
};

export type WorkspaceContext = {
  organization: OrganizationRecord | null;
  membership: OrganizationMembershipRecord | null;
  partnerUser: PartnerUserRecord | null;
  role: RoleDefinition | null;
  roles: RoleDefinition[];
  source: "database" | "missing_setup";
};

export const PHASE0_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    key: "owner",
    name: "Owner",
    description: "Primary workspace owner with full control.",
  },
  {
    key: "admin",
    name: "Admin",
    description: "Team member who manages workspace setup and membership.",
  },
  {
    key: "finance",
    name: "Finance",
    description: "Team member focused on payout review and finance operations.",
  },
  {
    key: "analyst",
    name: "Analyst",
    description: "Team member who reviews attribution and reporting data.",
  },
  {
    key: "partner_user",
    name: "Partner User",
    description: "External or partner-facing user tied to an organization.",
  },
];
