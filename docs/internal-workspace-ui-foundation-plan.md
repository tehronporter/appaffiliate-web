# Internal Workspace UI Foundation Plan

## Scope

Refactor the internal admin workspace and creator portal chrome into a denser, calmer TEHSO-aligned system without changing routes, data wiring, or backend behavior. This pass only touches shared foundations so existing pages inherit the new structure.

## Affected Files

### Shell and navigation

- `app/(workspace)/layout.tsx`
- `components/app-shell.tsx`
- `components/workspace-top-nav.tsx`
- `components/workspace-sidebar.tsx`
- `components/workspace-user-menu.tsx`
- `components/workspace-shell-types.ts`
- `app/portal/layout.tsx`
- `components/partner-portal-nav.tsx`

### Shared internal UI primitives

- `components/admin-ui.tsx`
- `components/activation-ui.tsx`
- `components/portal-ui.tsx`
- `components/settings-shell.tsx`
- `components/placeholder-page.tsx`
- `app/globals.css`

### Admin pages inheriting the foundation

- `app/(workspace)/dashboard/page.tsx`
- `app/(workspace)/onboarding/page.tsx`
- `app/(workspace)/partners/page.tsx`
- `app/(workspace)/codes/page.tsx`
- `app/(workspace)/events/page.tsx`
- `app/(workspace)/unattributed/page.tsx`
- `app/(workspace)/commissions/page.tsx`
- `app/(workspace)/payouts/page.tsx`
- `app/(workspace)/payout-batches/page.tsx`
- `app/(workspace)/apps/[appId]/apple-health/page.tsx`
- `app/(workspace)/settings/page.tsx`
- `app/(workspace)/settings/organization/page.tsx`
- `app/(workspace)/settings/team/page.tsx`
- `app/(workspace)/settings/rules/page.tsx`
- `app/(workspace)/settings/audit/page.tsx`
- `app/(workspace)/settings/exports/page.tsx`

### Creator portal pages inheriting the foundation

- `app/portal/page.tsx`
- `app/portal/codes/page.tsx`
- `app/portal/performance/page.tsx`
- `app/portal/payouts/page.tsx`

## Reusable Components to Create or Tighten

- Tighten the existing shared shell primitives instead of creating page-specific wrappers.
- Use `AppShell`, `TopBar`, and `SidebarNav` as the standard admin chrome.
- Use `SurfaceCard`, `PageHeader`, `SectionCard`, `ListTable`, `DetailPanel`, `FilterBar`, `StatCard`, `QuickActionTile`, and `EmptyState` as the shared admin foundation.
- Use `ActivationProgressCard`, `ActivationNextAction`, and `ActivationMilestoneCard` as the activation flow primitives.
- Use `PortalPageHeader`, `PortalMetricCard`, `PortalRecordCard`, and `PortalHelpCard` as the creator-facing subset.

## Reusable Tokens and Constants

- Add scoped internal shell tokens in `app/globals.css` for:
  - workspace and portal canvas colors
  - internal border and shadow values
  - sidebar width and sticky offsets
  - internal page max widths
  - secondary button and field treatments inside internal shells
- Keep the public site on the existing global tokens for now.

## Route and Layout Changes Needed

- No route changes required.
- No backend or data model changes required.
- Add shell-level root classes for the admin workspace and creator portal so internal chrome can evolve independently from the public marketing site.
- Keep the admin workspace and creator portal as separate layout systems with shared visual rules but different density and complexity.
