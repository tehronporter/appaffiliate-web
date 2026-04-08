# Ready for rollout

Phase 10 closes the AppAffiliate UI overhaul with a final QA and consistency pass across public, workspace, portal, onboarding, and support surfaces.

## What to verify before launch

### Public marketing
- `/`
- `/product`
- `/how-it-works`
- `/pricing`
- `/security`
- `/docs`
- `/request-access`
- `/login`

Checks:
- Founder-first copy stays results-led and never drifts into ops-heavy language above the fold.
- Homepage hero comparison, CTA rhythm, and section spacing hold at laptop and mobile widths.
- Request-access and sign-in feel like polished public entry points, not leftover utility pages.

### Internal workspace
- `/dashboard`
- `/partners`
- `/codes`
- `/events`
- `/unattributed`
- `/payouts`
- `/payout-batches`
- `/apps/[appId]/apple-health`
- `/onboarding`
- `/settings`
- `/settings/organization`
- `/settings/team`
- `/settings/rules`
- `/settings/audit`
- `/settings/exports`

Checks:
- Page headers, filter bars, table shells, detail panels, empty states, and status chips use the same component language.
- Dashboard, review queues, and finance surfaces read clearly at laptop widths without awkward sticky collisions.
- Money states stay easy to scan: review, approved, reserved, in payout, paid, blocked.

### Creator portal
- `/portal`
- `/portal/codes`
- `/portal/performance`
- `/portal/payouts`

Checks:
- Portal remains lighter and simpler than the workspace.
- Creator-safe wording stays read-only, reassuring, and free of internal workspace jargon.
- Mobile layouts keep summary cards, records, and help blocks readable without crowding.

### Activation and support
- `/onboarding`
- `/docs`
- `/request-access`
- `/login`

Checks:
- Activation language stays milestone-based and action-oriented.
- Support pages clearly direct founders to learn the basics, request access, or sign in.
- Empty and fallback states always explain what happened and what to do next.

## Interaction audit
- Verify hover, focus, and active states on buttons, nav items, filter chips, links, and quick actions.
- Confirm visible keyboard focus on all primary actions and navigation.
- Confirm loading, empty, blocked, and no-access states feel intentional rather than placeholder-like.

## Screenshot set for staging review
- Homepage hero and founder pain section
- Dashboard header, snapshot row, and needs-attention module
- Events detail/review view
- Payouts and payout-batch summary states
- Portal home and payouts at desktop and mobile widths
- Onboarding milestone flow
- Docs landing, request access, and sign-in split entry

## Sign-off owners
- Product/founder: positioning, copy, and rollout scope
- Design review: spacing, hierarchy, and responsive polish
- Engineering review: shared-component consistency, regressions, and accessibility basics

## Launch readiness criteria
- `npm run lint` passes
- `npm run build` passes
- Major route families reviewed in staging
- No leftover old-template cards, stale copy, or inconsistent status language on top-level routes
- Public, workspace, and portal surfaces feel intentionally related but clearly distinct
