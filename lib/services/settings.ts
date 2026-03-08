import "server-only";

import { createServiceSupabaseClient } from "@/lib/service-supabase";
import { writeAuditLog } from "@/lib/services/audit";
import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import { listFinanceOpsSummary, type FinanceOpsSummary } from "@/lib/services/finance";
import {
  INTERNAL_WORKSPACE_ROLE_KEYS,
  ORGANIZATION_ADMIN_ROLE_KEYS,
  getWorkspaceRoleKey,
  hasWorkspaceRole,
  requireWorkspaceRole,
} from "@/lib/services/permissions";
import type { RoleKey } from "@/lib/workspace-types";

type SettingsRoleKey = Extract<RoleKey, "owner" | "admin" | "finance" | "analyst">;

type SettingsContext = {
  context: Awaited<ReturnType<typeof createServiceContext>>;
  organizationId: string;
  roleKey: SettingsRoleKey;
};

type OrganizationRow = {
  id: string;
  slug: string;
  name: string;
  updated_at: string;
};

type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role_key: RoleKey;
  status: "active" | "invited" | "disabled";
  created_at: string;
  updated_at: string;
};

type RoleRow = {
  key: RoleKey;
  name: string;
  description: string;
};

type AppRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  ingest_key: string | null;
};

type CommissionRuleRow = {
  id: string;
  name: string;
  app_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  rule_type: string;
  status: string;
  currency: string;
  priority: number;
  updated_at: string;
};

type PartnerRow = {
  id: string;
  name: string;
};

type PromoCodeRow = {
  id: string;
  code: string;
  app_id: string;
  partner_id: string | null;
  status: string;
};

type QueueRow = {
  id: string;
  status: string;
  reason: string;
  updated_at: string;
};

type ReceiptRow = {
  id: string;
  app_id: string | null;
  notification_type: string | null;
  processed_status: string | null;
  verification_status: string | null;
  received_at: string;
  last_error: string | null;
};

type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  actor_membership_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type JobRunRow = {
  id: string;
  job_name: string;
  job_scope: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
  created_at: string;
};

type UserDirectoryEntry = {
  email: string | null;
  displayName: string | null;
};

export type SettingsOverviewData = {
  hasWorkspaceAccess: boolean;
  organizationName: string | null;
  visibleMemberCount: number;
  activeRuleCount: number;
  auditEntryCount: number;
  financeSummary: FinanceOpsSummary;
  monitoring: OperationalMonitoringData;
};

export type OrganizationSettingsData = {
  hasWorkspaceAccess: boolean;
  canManageOrganization: boolean;
  organizationName: string | null;
  organizationSlug: string | null;
  updatedAt: string | null;
  appTimezoneLabels: string[];
  activeCurrencyLabels: string[];
  managedAppCount: number;
  readOnlyNotes: string[];
};

export type TeamMemberView = {
  membershipId: string;
  userId: string;
  displayName: string;
  email: string | null;
  roleKey: RoleKey;
  roleName: string;
  roleDescription: string;
  status: MembershipRow["status"];
  isCurrentUser: boolean;
  canChangeRole: boolean;
  roleOptions: Array<{
    key: RoleKey;
    name: string;
  }>;
};

export type TeamSettingsData = {
  hasWorkspaceAccess: boolean;
  canManageRoles: boolean;
  visibleScopeLabel: string;
  visibleMemberCount: number;
  pendingInviteCount: number;
  partnerUserCount: number;
  members: TeamMemberView[];
};

export type RulesSettingsData = {
  hasWorkspaceAccess: boolean;
  activeRuleCount: number;
  draftRuleCount: number;
  unresolvedQueueCount: number;
  inReviewQueueCount: number;
  activeOwnedCodeCount: number;
  activeUnassignedCodeCount: number;
  currencies: string[];
  commissionRules: Array<{
    id: string;
    name: string;
    status: string;
    scopeLabel: string;
    payoutLabel: string;
    updatedAt: string;
  }>;
  appleReadiness: Array<{
    id: string;
    appName: string;
    slug: string;
    ingestReady: boolean;
    latestReceiptAt: string | null;
    healthLabel: string;
  }>;
  readOnlyNotes: string[];
};

export type AuditEntryView = {
  id: string;
  createdAt: string;
  action: string;
  actionLabel: string;
  summary: string;
  entityLabel: string;
  actorLabel: string;
  actorRoleLabel: string | null;
  tone: "primary" | "success" | "warning" | "danger";
};

export type OperationalMonitoringData = {
  recentReceiptCount: number;
  failedReceiptCount: number;
  pendingReceiptCount: number;
  queueVolume: number;
  inReviewQueueCount: number;
  failedJobCount: number;
  recentReceipts: Array<{
    id: string;
    appName: string;
    receivedAt: string;
    notificationType: string;
    processedStatus: string;
    verificationStatus: string;
    errorMessage: string | null;
  }>;
  recentJobs: Array<{
    id: string;
    jobName: string;
    status: string;
    scope: string;
    createdAt: string;
    finishedAt: string | null;
    errorMessage: string | null;
  }>;
  financeSummary: FinanceOpsSummary;
};

export type AuditSettingsData = {
  hasWorkspaceAccess: boolean;
  totalEntries: number;
  partnerChangeCount: number;
  manualReviewCount: number;
  financeActionCount: number;
  exportEventCount: number;
  recentEntries: AuditEntryView[];
  monitoring: OperationalMonitoringData;
};

const INTERNAL_TEAM_ROLE_OPTIONS = ["admin", "finance", "analyst"] as const satisfies readonly RoleKey[];

function normalizeOptionalText(value: string | null | undefined, maxLength = 160) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeOrganizationName(value: string) {
  const normalized = value.trim();

  if (normalized.length < 2) {
    throw new ServiceError(
      "validation_error",
      "Organization display name must be at least 2 characters.",
      {
        status: 400,
      },
    );
  }

  return normalized.slice(0, 120);
}

function titleCaseLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeOptionalText(value, 40))
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

function formatActorLabel(entry: UserDirectoryEntry | null, fallbackUserId: string | null) {
  if (entry?.displayName && entry.email) {
    return `${entry.displayName} (${entry.email})`;
  }

  if (entry?.displayName) {
    return entry.displayName;
  }

  if (entry?.email) {
    return entry.email;
  }

  return fallbackUserId ? `User ${fallbackUserId.slice(0, 8)}` : "System";
}

function summarizeRuleScope(params: {
  rule: CommissionRuleRow;
  appsById: Map<string, AppRow>;
  partnersById: Map<string, PartnerRow>;
  promoCodesById: Map<string, PromoCodeRow>;
}) {
  const labels: string[] = [];

  if (params.rule.app_id) {
    labels.push(params.appsById.get(params.rule.app_id)?.name ?? "Unknown app");
  }

  if (params.rule.partner_id) {
    labels.push(
      params.partnersById.get(params.rule.partner_id)?.name ?? "Unknown partner",
    );
  }

  if (params.rule.promo_code_id) {
    labels.push(
      params.promoCodesById.get(params.rule.promo_code_id)?.code ?? "Unknown code",
    );
  }

  return labels.length > 0 ? labels.join(" • ") : "Organization-wide rule";
}

function summarizePayoutLabel(rule: CommissionRuleRow) {
  if (rule.rule_type === "revenue_share") {
    return `${rule.currency} revenue share`;
  }

  return `${rule.currency} ${titleCaseLabel(rule.rule_type)}`;
}

function auditTone(action: string) {
  if (
    action.includes("rejected") ||
    action.includes("failed") ||
    action.includes("error")
  ) {
    return "danger" as const;
  }

  if (action.includes("exported") || action.includes("paid")) {
    return "warning" as const;
  }

  if (
    action.includes("approved") ||
    action.includes("created") ||
    action.includes("updated") ||
    action.includes("attributed")
  ) {
    return "success" as const;
  }

  return "primary" as const;
}

function describeVisibleScope(roleKey: SettingsRoleKey) {
  if (roleKey === "owner" || roleKey === "admin") {
    return "Full workspace directory";
  }

  return "Your current membership only";
}

function ensureInternalRole(
  context: Awaited<ReturnType<typeof createServiceContext>>,
): SettingsContext | null {
  if (!context.supabase || !context.workspace.organization) {
    return null;
  }

  const roleKey = getWorkspaceRoleKey(context);

  if (!roleKey || !hasWorkspaceRole(context, INTERNAL_WORKSPACE_ROLE_KEYS)) {
    return null;
  }

  return {
    context,
    organizationId: context.workspace.organization.id,
    roleKey: roleKey as SettingsRoleKey,
  };
}

async function getOptionalSettingsContext() {
  const context = await createServiceContext();
  return ensureInternalRole(context);
}

async function requireSettingsContext() {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });
  const settings = ensureInternalRole(context);

  if (!settings) {
    throw new ServiceError(
      "forbidden",
      "Internal workspace access is required for settings.",
      {
        status: 403,
      },
    );
  }

  return settings;
}

async function requireOrganizationManagerContext() {
  const settings = await requireSettingsContext();

  requireWorkspaceRole(
    settings.context,
    ORGANIZATION_ADMIN_ROLE_KEYS,
    "Only owners and admins can manage organization settings.",
  );

  return settings;
}

async function readOrganizationRecord(
  organizationId: string,
  supabase: NonNullable<Awaited<ReturnType<typeof createServiceContext>>["supabase"]>,
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, slug, name, updated_at")
    .eq("id", organizationId)
    .single<OrganizationRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to read organization settings.", {
      status: 500,
      details: {
        message: error.message,
      },
    });
  }

  return data;
}

async function loadVisibleMemberships(
  settings: SettingsContext,
) {
  const [{ data: membershipRows, error: membershipError }, { data: roleRows, error: roleError }] =
    await Promise.all([
      settings.context.supabase!
        .from("organization_memberships")
        .select("id, organization_id, user_id, role_key, status, created_at, updated_at")
        .eq("organization_id", settings.organizationId)
        .order("status", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<MembershipRow[]>(),
      settings.context.supabase!
        .from("roles")
        .select("key, name, description")
        .returns<RoleRow[]>(),
    ]);

  if (membershipError || roleError) {
    throw new ServiceError("internal_error", "Failed to read workspace membership.", {
      status: 500,
      details: {
        membershipMessage: membershipError?.message,
        roleMessage: roleError?.message,
      },
    });
  }

  return {
    memberships: membershipRows ?? [],
    rolesByKey: new Map((roleRows ?? []).map((role) => [role.key, role])),
  };
}

async function loadUserDirectoryEntries(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserDirectoryEntry>();
  }

  const serviceSupabase = createServiceSupabaseClient();
  const profiles = await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await serviceSupabase.auth.admin.getUserById(userId);

      if (error || !data.user) {
        return [userId, { email: null, displayName: null } satisfies UserDirectoryEntry] as const;
      }

      const displayName =
        normalizeOptionalText(
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name
            : typeof data.user.user_metadata?.name === "string"
              ? data.user.user_metadata.name
              : null,
          120,
        ) ??
        normalizeOptionalText(
          typeof data.user.email === "string"
            ? data.user.email.split("@")[0]
            : null,
          120,
        );

      return [
        userId,
        {
          email: data.user.email ?? null,
          displayName,
        } satisfies UserDirectoryEntry,
      ] as const;
    }),
  );

  return new Map(profiles);
}

function buildRoleOptions(params: {
  actorRoleKey: SettingsRoleKey;
  member: MembershipRow;
  currentUserId: string | null;
  rolesByKey: Map<RoleKey, RoleRow>;
}) {
  if (params.member.user_id === params.currentUserId) {
    return [];
  }

  if (params.member.role_key === "owner") {
    return [];
  }

  if (params.actorRoleKey === "owner") {
    return INTERNAL_TEAM_ROLE_OPTIONS.map((roleKey) => ({
      key: roleKey,
      name: params.rolesByKey.get(roleKey)?.name ?? titleCaseLabel(roleKey),
    }));
  }

  if (
    params.actorRoleKey === "admin" &&
    (params.member.role_key === "finance" || params.member.role_key === "analyst")
  ) {
    return INTERNAL_TEAM_ROLE_OPTIONS.filter(
      (roleKey) => roleKey === "finance" || roleKey === "analyst",
    ).map((roleKey) => ({
      key: roleKey,
      name: params.rolesByKey.get(roleKey)?.name ?? titleCaseLabel(roleKey),
    }));
  }

  return [];
}

async function loadOperationalMonitoring(
  settings: SettingsContext,
): Promise<OperationalMonitoringData> {
  const [
    { data: queueRows, error: queueError },
    { data: receiptRows, error: receiptError },
    { data: appRows, error: appError },
    { data: jobRows, error: jobError },
    financeSummary,
  ] = await Promise.all([
    settings.context.supabase!
      .from("unattributed_queue")
      .select("id, status, reason, updated_at")
      .eq("organization_id", settings.organizationId)
      .returns<QueueRow[]>(),
    settings.context.supabase!
      .from("apple_notification_receipts")
      .select(
        "id, app_id, notification_type, processed_status, verification_status, received_at, last_error",
      )
      .eq("organization_id", settings.organizationId)
      .order("received_at", { ascending: false })
      .limit(12)
      .returns<ReceiptRow[]>(),
    settings.context.supabase!
      .from("apps")
      .select("id, name, slug, status, timezone, ingest_key")
      .eq("organization_id", settings.organizationId)
      .returns<AppRow[]>(),
    settings.context.supabase!
      .from("job_runs")
      .select(
        "id, job_name, job_scope, status, started_at, finished_at, error_message, created_at",
      )
      .eq("organization_id", settings.organizationId)
      .order("created_at", { ascending: false })
      .limit(12)
      .returns<JobRunRow[]>(),
    listFinanceOpsSummary(),
  ]);

  if (queueError || receiptError || appError || jobError) {
    throw new ServiceError("internal_error", "Failed to load operational monitoring data.", {
      status: 500,
      details: {
        queueMessage: queueError?.message,
        receiptMessage: receiptError?.message,
        appMessage: appError?.message,
        jobMessage: jobError?.message,
      },
    });
  }

  const appsById = new Map((appRows ?? []).map((app) => [app.id, app]));
  const receipts = receiptRows ?? [];
  const jobs = jobRows ?? [];
  const queue = queueRows ?? [];

  return {
    recentReceiptCount: receipts.length,
    failedReceiptCount: receipts.filter((receipt) => receipt.processed_status === "failed").length,
    pendingReceiptCount: receipts.filter((receipt) => receipt.processed_status === "pending").length,
    queueVolume: queue.filter((row) => row.status !== "resolved").length,
    inReviewQueueCount: queue.filter((row) => row.status === "in_review").length,
    failedJobCount: jobs.filter((job) => job.status === "failed").length,
    recentReceipts: receipts.map((receipt) => ({
      id: receipt.id,
      appName: receipt.app_id ? appsById.get(receipt.app_id)?.name ?? "Unknown app" : "Unknown app",
      receivedAt: receipt.received_at,
      notificationType: receipt.notification_type ?? "unknown",
      processedStatus: receipt.processed_status ?? "unknown",
      verificationStatus: receipt.verification_status ?? "unknown",
      errorMessage: receipt.last_error,
    })),
    recentJobs: jobs.map((job) => ({
      id: job.id,
      jobName: job.job_name,
      status: job.status,
      scope: job.job_scope,
      createdAt: job.created_at,
      finishedAt: job.finished_at,
      errorMessage: job.error_message,
    })),
    financeSummary,
  };
}

async function loadRulesData(settings: SettingsContext) {
  const [
    { data: ruleRows, error: ruleError },
    { data: appRows, error: appError },
    { data: partnerRows, error: partnerError },
    { data: promoCodeRows, error: promoCodeError },
    { data: queueRows, error: queueError },
    { data: receiptRows, error: receiptError },
  ] = await Promise.all([
    settings.context.supabase!
      .from("commission_rules")
      .select(
        "id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, priority, updated_at",
      )
      .eq("organization_id", settings.organizationId)
      .order("priority", { ascending: true })
      .order("updated_at", { ascending: false })
      .returns<CommissionRuleRow[]>(),
    settings.context.supabase!
      .from("apps")
      .select("id, name, slug, status, timezone, ingest_key")
      .eq("organization_id", settings.organizationId)
      .order("name", { ascending: true })
      .returns<AppRow[]>(),
    settings.context.supabase!
      .from("partners")
      .select("id, name")
      .eq("organization_id", settings.organizationId)
      .returns<PartnerRow[]>(),
    settings.context.supabase!
      .from("promo_codes")
      .select("id, code, app_id, partner_id, status")
      .eq("organization_id", settings.organizationId)
      .returns<PromoCodeRow[]>(),
    settings.context.supabase!
      .from("unattributed_queue")
      .select("id, status, reason, updated_at")
      .eq("organization_id", settings.organizationId)
      .returns<QueueRow[]>(),
    settings.context.supabase!
      .from("apple_notification_receipts")
      .select(
        "id, app_id, notification_type, processed_status, verification_status, received_at, last_error",
      )
      .eq("organization_id", settings.organizationId)
      .order("received_at", { ascending: false })
      .limit(50)
      .returns<ReceiptRow[]>(),
  ]);

  if (
    ruleError ||
    appError ||
    partnerError ||
    promoCodeError ||
    queueError ||
    receiptError
  ) {
    throw new ServiceError("internal_error", "Failed to load rule settings.", {
      status: 500,
      details: {
        ruleMessage: ruleError?.message,
        appMessage: appError?.message,
        partnerMessage: partnerError?.message,
        promoCodeMessage: promoCodeError?.message,
        queueMessage: queueError?.message,
        receiptMessage: receiptError?.message,
      },
    });
  }

  return {
    rules: ruleRows ?? [],
    apps: appRows ?? [],
    partners: partnerRows ?? [],
    promoCodes: promoCodeRows ?? [],
    queue: queueRows ?? [],
    receipts: receiptRows ?? [],
  };
}

export async function getSettingsOverviewData() {
  const settings = await getOptionalSettingsContext();

  if (!settings) {
    return {
      hasWorkspaceAccess: false,
      organizationName: null,
      visibleMemberCount: 0,
      activeRuleCount: 0,
      auditEntryCount: 0,
      financeSummary: {
        hasFinanceAccess: false,
        pendingReviewCount: 0,
        approvedCount: 0,
        payoutTrackedCount: 0,
        paidCount: 0,
        draftBatchCount: 0,
        exportedBatchCount: 0,
        paidBatchCount: 0,
      },
      monitoring: {
        recentReceiptCount: 0,
        failedReceiptCount: 0,
        pendingReceiptCount: 0,
        queueVolume: 0,
        inReviewQueueCount: 0,
        failedJobCount: 0,
        recentReceipts: [],
        recentJobs: [],
        financeSummary: {
          hasFinanceAccess: false,
          pendingReviewCount: 0,
          approvedCount: 0,
          payoutTrackedCount: 0,
          paidCount: 0,
          draftBatchCount: 0,
          exportedBatchCount: 0,
          paidBatchCount: 0,
        },
      },
    } satisfies SettingsOverviewData;
  }

  const [{ memberships }, { rules }, { data: auditRows, error: auditError }, monitoring] =
    await Promise.all([
      loadVisibleMemberships(settings),
      loadRulesData(settings),
      settings.context.supabase!
        .from("audit_logs")
        .select("id")
        .eq("organization_id", settings.organizationId)
        .order("created_at", { ascending: false })
        .limit(50),
      loadOperationalMonitoring(settings),
    ]);

  if (auditError) {
    throw new ServiceError("internal_error", "Failed to read recent audit activity.", {
      status: 500,
      details: {
        message: auditError.message,
      },
    });
  }

  return {
    hasWorkspaceAccess: true,
    organizationName: settings.context.workspace.organization?.name ?? null,
    visibleMemberCount: memberships.length,
    activeRuleCount: rules.filter((rule) => rule.status === "active").length,
    auditEntryCount: (auditRows ?? []).length,
    financeSummary: monitoring.financeSummary,
    monitoring,
  } satisfies SettingsOverviewData;
}

export async function getOrganizationSettingsData() {
  const settings = await getOptionalSettingsContext();

  if (!settings) {
    return {
      hasWorkspaceAccess: false,
      canManageOrganization: false,
      organizationName: null,
      organizationSlug: null,
      updatedAt: null,
      appTimezoneLabels: [],
      activeCurrencyLabels: [],
      managedAppCount: 0,
      readOnlyNotes: [],
    } satisfies OrganizationSettingsData;
  }

  const [{ data: appRows, error: appError }, { data: ruleRows, error: ruleError }, organization] =
    await Promise.all([
      settings.context.supabase!
        .from("apps")
        .select("id, name, slug, status, timezone, ingest_key")
        .eq("organization_id", settings.organizationId)
        .returns<AppRow[]>(),
      settings.context.supabase!
        .from("commission_rules")
        .select("id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, priority, updated_at")
        .eq("organization_id", settings.organizationId)
        .returns<CommissionRuleRow[]>(),
      readOrganizationRecord(settings.organizationId, settings.context.supabase!),
    ]);

  if (appError || ruleError) {
    throw new ServiceError("internal_error", "Failed to load organization settings.", {
      status: 500,
      details: {
        appMessage: appError?.message,
        ruleMessage: ruleError?.message,
      },
    });
  }

  const appTimezoneLabels = uniqueSorted((appRows ?? []).map((app) => app.timezone));
  const activeCurrencyLabels = uniqueSorted(
    (ruleRows ?? [])
      .filter((rule) => rule.status === "active")
      .map((rule) => rule.currency),
  );

  return {
    hasWorkspaceAccess: true,
    canManageOrganization: hasWorkspaceRole(
      settings.context,
      ORGANIZATION_ADMIN_ROLE_KEYS,
    ),
    organizationName: organization.name,
    organizationSlug: organization.slug,
    updatedAt: organization.updated_at,
    appTimezoneLabels,
    activeCurrencyLabels,
    managedAppCount: (appRows ?? []).length,
    readOnlyNotes: [
      "Organization display name is the only org-level field persisted in this MVP slice.",
      "Operational contact details are not modeled at the organization level yet, so they remain read-only and honest here.",
      "Timezone and currency defaults currently come from app records and active commission rules instead of a separate org settings table.",
    ],
  } satisfies OrganizationSettingsData;
}

export async function updateOrganizationSettings(input: {
  displayName: string;
}) {
  const settings = await requireOrganizationManagerContext();
  const organization = await readOrganizationRecord(
    settings.organizationId,
    settings.context.supabase!,
  );
  const displayName = normalizeOrganizationName(input.displayName);

  const { data, error } = await settings.context.supabase!
    .from("organizations")
    .update({
      name: displayName,
    })
    .eq("id", settings.organizationId)
    .select("id, slug, name, updated_at")
    .single<OrganizationRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to update organization settings.", {
      status: 500,
      details: {
        message: error.message,
      },
    });
  }

  await writeAuditLog(settings.context, {
    organizationId: settings.organizationId,
    entityType: "organization",
    entityId: data.id,
    action: "organization.updated",
    summary: `Updated organization display name to ${data.name}.`,
    metadata: {
      previousName: organization.name,
      nextName: data.name,
    },
  });

  return {
    id: data.id,
    name: data.name,
  };
}

export async function getTeamSettingsData() {
  const settings = await getOptionalSettingsContext();

  if (!settings) {
    return {
      hasWorkspaceAccess: false,
      canManageRoles: false,
      visibleScopeLabel: "Internal workspace access required",
      visibleMemberCount: 0,
      pendingInviteCount: 0,
      partnerUserCount: 0,
      members: [],
    } satisfies TeamSettingsData;
  }

  const { memberships, rolesByKey } = await loadVisibleMemberships(settings);
  const [
    userDirectory,
    { count: partnerUserCount, error: partnerUserError },
    { count: pendingInviteCount, error: inviteCountError },
  ] =
    await Promise.all([
      loadUserDirectoryEntries(
        memberships.map((membership) => membership.user_id),
      ),
      settings.context.supabase!
        .from("partner_users")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", settings.organizationId),
      settings.context.supabase!
        .from("workspace_invitations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", settings.organizationId)
        .eq("invite_type", "internal_team")
        .eq("status", "pending"),
    ]);

  if (partnerUserError || inviteCountError) {
    throw new ServiceError("internal_error", "Failed to read partner user count.", {
      status: 500,
      details: {
        message: partnerUserError?.message,
        inviteMessage: inviteCountError?.message,
      },
    });
  }

  const currentUserId = settings.context.user?.id ?? null;
  const members = memberships.map((membership) => {
    const role = rolesByKey.get(membership.role_key);
    const roleOptions = buildRoleOptions({
      actorRoleKey: settings.roleKey,
      member: membership,
      currentUserId,
      rolesByKey,
    });
    const user = userDirectory.get(membership.user_id) ?? null;

    return {
      membershipId: membership.id,
      userId: membership.user_id,
      displayName:
        user?.displayName ??
        (membership.user_id === currentUserId ? "You" : `User ${membership.user_id.slice(0, 8)}`),
      email: user?.email ?? null,
      roleKey: membership.role_key,
      roleName: role?.name ?? titleCaseLabel(membership.role_key),
      roleDescription: role?.description ?? "No role description was found.",
      status: membership.status,
      isCurrentUser: membership.user_id === currentUserId,
      canChangeRole: roleOptions.length > 0,
      roleOptions,
    } satisfies TeamMemberView;
  });

  return {
    hasWorkspaceAccess: true,
    canManageRoles: hasWorkspaceRole(
      settings.context,
      ORGANIZATION_ADMIN_ROLE_KEYS,
    ),
    visibleScopeLabel: describeVisibleScope(settings.roleKey),
    visibleMemberCount: members.length,
    pendingInviteCount: pendingInviteCount ?? 0,
    partnerUserCount: partnerUserCount ?? 0,
    members,
  } satisfies TeamSettingsData;
}

function normalizeAssignableRole(value: string): RoleKey {
  if (
    value === "admin" ||
    value === "finance" ||
    value === "analyst"
  ) {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid team role selection.", {
    status: 400,
  });
}

function assertRoleUpdateAllowed(params: {
  actorRoleKey: SettingsRoleKey;
  targetMembership: MembershipRow;
  nextRoleKey: RoleKey;
  currentUserId: string | null;
}) {
  if (params.targetMembership.user_id === params.currentUserId) {
    throw new ServiceError("validation_error", "Use another admin to change your own role.", {
      status: 400,
    });
  }

  if (params.targetMembership.role_key === "owner") {
    throw new ServiceError("validation_error", "Owner role changes are out of scope for this MVP.", {
      status: 400,
    });
  }

  if (params.actorRoleKey === "admin") {
    if (
      params.targetMembership.role_key !== "finance" &&
      params.targetMembership.role_key !== "analyst"
    ) {
      throw new ServiceError(
        "forbidden",
        "Admins can only rebalance finance and analyst roles in this MVP.",
        {
          status: 403,
        },
      );
    }

    if (params.nextRoleKey !== "finance" && params.nextRoleKey !== "analyst") {
      throw new ServiceError(
        "forbidden",
        "Admins can only assign finance or analyst roles in this MVP.",
        {
          status: 403,
        },
      );
    }
  }
}

export async function updateTeamMemberRole(input: {
  membershipId: string;
  roleKey: string;
}) {
  const settings = await requireOrganizationManagerContext();
  const nextRoleKey = normalizeAssignableRole(input.roleKey);
  const { memberships, rolesByKey } = await loadVisibleMemberships(settings);
  const targetMembership =
    memberships.find((membership) => membership.id === input.membershipId) ?? null;

  if (!targetMembership) {
    throw new ServiceError("not_found", "Workspace member was not found.", {
      status: 404,
    });
  }

  assertRoleUpdateAllowed({
    actorRoleKey: settings.roleKey,
    targetMembership,
    nextRoleKey,
    currentUserId: settings.context.user?.id ?? null,
  });

  if (targetMembership.role_key === nextRoleKey) {
    return {
      membershipId: targetMembership.id,
      roleKey: targetMembership.role_key,
    };
  }

  const { data, error } = await settings.context.supabase!
    .from("organization_memberships")
    .update({
      role_key: nextRoleKey,
    })
    .eq("organization_id", settings.organizationId)
    .eq("id", targetMembership.id)
    .select("id, organization_id, user_id, role_key, status, created_at, updated_at")
    .single<MembershipRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to update workspace role.", {
      status: 500,
      details: {
        message: error.message,
      },
    });
  }

  await writeAuditLog(settings.context, {
    organizationId: settings.organizationId,
    entityType: "organization_membership",
    entityId: data.id,
    action: "team.role_updated",
    summary: `Updated workspace role for membership ${data.id}.`,
    metadata: {
      membershipId: data.id,
      targetUserId: data.user_id,
      previousRoleKey: targetMembership.role_key,
      nextRoleKey,
      previousRoleName:
        rolesByKey.get(targetMembership.role_key)?.name ??
        titleCaseLabel(targetMembership.role_key),
      nextRoleName: rolesByKey.get(nextRoleKey)?.name ?? titleCaseLabel(nextRoleKey),
    },
  });

  return {
    membershipId: data.id,
    roleKey: data.role_key,
  };
}

export async function getRulesSettingsData() {
  const settings = await getOptionalSettingsContext();

  if (!settings) {
    return {
      hasWorkspaceAccess: false,
      activeRuleCount: 0,
      draftRuleCount: 0,
      unresolvedQueueCount: 0,
      inReviewQueueCount: 0,
      activeOwnedCodeCount: 0,
      activeUnassignedCodeCount: 0,
      currencies: [],
      commissionRules: [],
      appleReadiness: [],
      readOnlyNotes: [],
    } satisfies RulesSettingsData;
  }

  const { rules, apps, partners, promoCodes, queue, receipts } = await loadRulesData(settings);
  const appsById = new Map(apps.map((app) => [app.id, app]));
  const partnersById = new Map(partners.map((partner) => [partner.id, partner]));
  const promoCodesById = new Map(promoCodes.map((promoCode) => [promoCode.id, promoCode]));
  const latestReceiptByAppId = new Map<string, ReceiptRow>();

  for (const receipt of receipts) {
    if (!receipt.app_id || latestReceiptByAppId.has(receipt.app_id)) {
      continue;
    }

    latestReceiptByAppId.set(receipt.app_id, receipt);
  }

  return {
    hasWorkspaceAccess: true,
    activeRuleCount: rules.filter((rule) => rule.status === "active").length,
    draftRuleCount: rules.filter((rule) => rule.status === "draft").length,
    unresolvedQueueCount: queue.filter((row) => row.status !== "resolved").length,
    inReviewQueueCount: queue.filter((row) => row.status === "in_review").length,
    activeOwnedCodeCount: promoCodes.filter(
      (code) => code.status === "active" && Boolean(code.partner_id),
    ).length,
    activeUnassignedCodeCount: promoCodes.filter(
      (code) => code.status === "active" && !code.partner_id,
    ).length,
    currencies: uniqueSorted(
      rules.filter((rule) => rule.status === "active").map((rule) => rule.currency),
    ),
    commissionRules: rules.slice(0, 10).map((rule) => ({
      id: rule.id,
      name: rule.name,
      status: titleCaseLabel(rule.status),
      scopeLabel: summarizeRuleScope({
        rule,
        appsById,
        partnersById,
        promoCodesById,
      }),
      payoutLabel: summarizePayoutLabel(rule),
      updatedAt: rule.updated_at,
    })),
    appleReadiness: apps.map((app) => {
      const latestReceipt = latestReceiptByAppId.get(app.id) ?? null;
      const healthLabel = latestReceipt
        ? latestReceipt.processed_status === "failed"
          ? "Recent receipt failed"
          : latestReceipt.processed_status === "pending"
            ? "Receipt pending"
            : "Receipts processing"
        : "No receipts yet";

      return {
        id: app.id,
        appName: app.name,
        slug: app.slug,
        ingestReady: Boolean(app.ingest_key),
        latestReceiptAt: latestReceipt?.received_at ?? null,
        healthLabel,
      };
    }),
    readOnlyNotes: [
      "Commission rule storage is real, but cross-rule precedence still follows the existing matching helper rather than a broad rule-builder UI.",
      "Manual attribution review posture comes from the live unattributed queue and current code ownership, not from separate organization-wide switches.",
      "Apple readiness stays read-only here so operators can see ingest posture without opening broader app management tools.",
    ],
  } satisfies RulesSettingsData;
}

export async function getAuditSettingsData() {
  const settings = await getOptionalSettingsContext();

  if (!settings) {
    return {
      hasWorkspaceAccess: false,
      totalEntries: 0,
      partnerChangeCount: 0,
      manualReviewCount: 0,
      financeActionCount: 0,
      exportEventCount: 0,
      recentEntries: [],
      monitoring: {
        recentReceiptCount: 0,
        failedReceiptCount: 0,
        pendingReceiptCount: 0,
        queueVolume: 0,
        inReviewQueueCount: 0,
        failedJobCount: 0,
        recentReceipts: [],
        recentJobs: [],
        financeSummary: {
          hasFinanceAccess: false,
          pendingReviewCount: 0,
          approvedCount: 0,
          payoutTrackedCount: 0,
          paidCount: 0,
          draftBatchCount: 0,
          exportedBatchCount: 0,
          paidBatchCount: 0,
        },
      },
    } satisfies AuditSettingsData;
  }

  const [{ data: auditRows, error: auditError }, { memberships, rolesByKey }, monitoring] =
    await Promise.all([
      settings.context.supabase!
        .from("audit_logs")
        .select(
          "id, actor_user_id, actor_membership_id, entity_type, entity_id, action, summary, metadata, created_at",
        )
        .eq("organization_id", settings.organizationId)
        .order("created_at", { ascending: false })
        .limit(40)
        .returns<AuditLogRow[]>(),
      loadVisibleMemberships(settings),
      loadOperationalMonitoring(settings),
    ]);

  if (auditError) {
    throw new ServiceError("internal_error", "Failed to read audit history.", {
      status: 500,
      details: {
        message: auditError.message,
      },
    });
  }

  const auditEntries = auditRows ?? [];
  const membershipById = new Map(memberships.map((membership) => [membership.id, membership]));
  const userDirectory = await loadUserDirectoryEntries(
    Array.from(
      new Set(
        auditEntries
          .map((entry) => entry.actor_user_id)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    ),
  );

  const recentEntries = auditEntries.map((entry) => {
    const actorMembership = entry.actor_membership_id
      ? membershipById.get(entry.actor_membership_id) ?? null
      : null;
    const actorRoleLabel = actorMembership
      ? rolesByKey.get(actorMembership.role_key)?.name ??
        titleCaseLabel(actorMembership.role_key)
      : null;

    return {
      id: entry.id,
      createdAt: entry.created_at,
      action: entry.action,
      actionLabel: titleCaseLabel(entry.action.replaceAll(".", " ")),
      summary: entry.summary,
      entityLabel: `${titleCaseLabel(entry.entity_type)}${entry.entity_id ? ` ${entry.entity_id.slice(0, 8)}` : ""}`,
      actorLabel: formatActorLabel(
        entry.actor_user_id ? userDirectory.get(entry.actor_user_id) ?? null : null,
        entry.actor_user_id,
      ),
      actorRoleLabel,
      tone: auditTone(entry.action),
    } satisfies AuditEntryView;
  });

  return {
    hasWorkspaceAccess: true,
    totalEntries: auditEntries.length,
    partnerChangeCount: auditEntries.filter((entry) => entry.action.startsWith("partner.")).length,
    manualReviewCount: auditEntries.filter(
      (entry) =>
        entry.action.startsWith("unattributed_queue.") ||
        entry.action.startsWith("normalized_event."),
    ).length,
    financeActionCount: auditEntries.filter(
      (entry) =>
        entry.action.startsWith("commission.") ||
        entry.action.startsWith("payout_batch."),
    ).length,
    exportEventCount: auditEntries.filter(
      (entry) => entry.action === "finance.export.downloaded",
    ).length,
    recentEntries,
    monitoring,
  } satisfies AuditSettingsData;
}
