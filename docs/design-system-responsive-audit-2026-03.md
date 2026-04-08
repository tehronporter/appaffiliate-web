# AppAffiliate Design System And Responsive Audit

Date: March 8, 2026

## Scope

This audit covers the public marketing site, public auth surfaces, internal workspace shell, workspace pages, activation flow, and creator portal.

## Current System Snapshot

- Typeface is already standardized on Inter.
- Primary accent is already consistent with TEHSO Blue `#2E53FF`.
- Base primitives exist in [`app/globals.css`](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/globals.css), but the system is still only partially tokenized.
- Shared workspace primitives exist in [`components/admin-ui.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/admin-ui.tsx).
- Shared marketing primitives exist in [`components/marketing-page.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-page.tsx), [`components/marketing-shell.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-shell.tsx), and [`components/public-shell.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/public-shell.tsx).

## Major Findings

### 1. Layout tokens are incomplete

- Container widths are split across inline literals and root variables.
- Horizontal gutters are repeated with `px-4`, `sm:px-6`, `lg:px-8`, `px-5`, `sm:px-8`, `lg:px-12`, and `max-w-[1200px]`.
- Marketing, public, portal, and workspace surfaces use similar but not identical width rules.

Impact:

- Large-screen rhythm varies between routes.
- Tablet layouts feel inconsistent because components do not collapse at the same widths.

### 2. Responsive behavior is duplicated instead of systematized

- Hero, section, CTA, auth, and support layouts each define their own spacing and grid collapse behavior.
- Table pages repeat the same mobile-collapse pattern manually.
- Metric strips rely on repeated horizontal scroll wrappers instead of a shared responsive stat grid.

Impact:

- Mobile/tablet fixes require touching many files.
- Similar UI patterns drift visually over time.

### 3. Internal app shell lacks a first-class mobile navigation pattern

- [`components/app-shell.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/app-shell.tsx) and [`components/workspace-top-nav.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/workspace-top-nav.tsx) support a desktop sidebar, but not a cohesive mobile sidebar drawer.
- Search is desktop-first and not easily discoverable below `lg`.

Impact:

- Internal navigation is less usable on phones and small tablets.
- Topbar density becomes fragile at narrower widths.

### 4. Page headers, filters, and action rows are not fully normalized

- Header actions wrap, but not always intentionally.
- Badges and actions can create ragged rows on narrower widths.
- Filter bars are functional but can become visually noisy or too loose.

Impact:

- Narrow tablet widths produce uneven header stacks.
- Repeated list/register pages feel related but not identical.

### 5. Table responsiveness is functional but not production-ready

- Most workspace tables collapse from explicit desktop column grids to generic stacked grids without mobile field labels.
- Mobile users often have to infer what each value means from the desktop order.
- Drawers are reasonably sized, but their mobile layout and content rhythm are not yet standardized enough.

Impact:

- Operational clarity drops sharply below `md`.
- “Responsive” behavior exists, but readability and scanability are not good enough.

### 6. Spacing and radius scales drift across surface types

- Card radii vary across `10`, `12`, `14`, `16`, `18`, `20`, `22`, `24`, `26`, and `28` pixel values.
- Section spacing varies between marketing, public, auth, workspace, activation, and portal surfaces.
- Button/input heights are partly standardized, but auth and activation introduce one-off overrides.

Impact:

- The product feels assembled from adjacent systems instead of one coherent system.

### 7. Typography fit is mostly solid but inconsistent at edge widths

- Marketing headings use `clamp` in some places and fixed step changes in others.
- Public/auth hero and page headings still include some hard-coded large sizes.
- Utility text, pills, and CTA rows can create awkward wraps around small tablet widths.

Impact:

- Typography is good on desktop and acceptable on mobile, but not consistently deliberate at intermediate breakpoints.

## Duplicated Or Fragmented Style Logic

- Container widths:
  - `max-w-[1200px]`
  - `max-w-[var(--marketing-max-width)]`
  - `max-w-[var(--portal-max-width)]`
  - `max-w-[1600px]`
- Repeated section gutters:
  - `px-4 sm:px-6 lg:px-8`
  - `px-5 sm:px-8 lg:px-12`
- Repeated card shells:
  - marketing cards/support cards/public cards/auth cards all reimplement similar borders, radii, padding, and shadows
- Repeated table shells:
  - partners, codes, events, unattributed, commissions, payouts, and payout batches all manually encode desktop columns and mobile collapse
- Repeated metric strip wrappers:
  - `-mx-4 overflow-x-auto px-4` plus `flex min-w-max gap-3`

## High-Priority Breakpoint Failures

- `768px` to `1024px`:
  - marketing nav/action density starts to feel crowded
  - hero content and visual balance vary by route
  - page header actions and badges can create ragged stacks
- `375px` to `430px`:
  - workspace shell lacks a dedicated mobile nav affordance
  - internal list/register rows lose field-label clarity
  - activation flow fields and cards rely on one-off sizing instead of shared control tokens
- `1280px` and up:
  - some public and marketing sections stretch less consistently than the shell suggests
  - spacing between sections and within cards is not always aligned across page templates

## Centralization Opportunities

- Introduce shared semantic container classes for:
  - marketing shell width
  - public shell width
  - workspace shell width
  - portal shell width
- Introduce shared gutter and section-spacing tokens.
- Normalize:
  - page header spacing
  - card padding
  - badge height
  - filter chip height
  - input/button height variants
  - drawer width rules
  - metric grid behavior
- Convert repeated table/register patterns into a consistent “desktop columns + mobile labeled rows” pattern.

## Refactor Priorities

### Priority 1

- Centralize tokens and layout primitives in [`app/globals.css`](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/globals.css)
- Normalize header and shell container behavior
- Add a mobile-safe workspace navigation pattern

### Priority 2

- Normalize marketing/public heroes, sections, CTA panels, footer rhythm, and auth surfaces
- Normalize shared workspace primitives in [`components/admin-ui.tsx`](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/admin-ui.tsx)

### Priority 3

- Refactor register/table pages to improve mobile readability
- Tighten activation flow, portal card layouts, and remaining one-off form/card sizing

## Implementation Notes

The refactor should preserve the existing AppAffiliate identity:

- Keep Inter
- Keep TEHSO Blue `#2E53FF`
- Avoid brand redesign
- Reduce one-off values instead of inventing a new visual language
- Make mobile, tablet, laptop, desktop, and wide-desktop behavior intentional with the fewest possible primitives
