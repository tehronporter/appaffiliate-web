# Phase J Design System Notes

This pass normalizes the practical UI system already in use across the public site, admin workspace, and partner portal. It is intentionally implementation-focused.

## Core Tokens

- Primary: `#2E53FF`
- Background: `#F5F7FA`
- Surface: `#F8FAFC`
- Surface muted: `#F2F5F8`
- Surface elevated: `#FFFFFF`
- Border: `#E5EAF0`
- Border strong: `#D2DAE5`
- Ink: `#141A24`
- Ink muted: `#5B6678`
- Ink subtle: `#7C8798`
- Success, warning, and danger remain narrow semantic accents, not decorative color systems.

## Typography

- Inter is the only UI font.
- Public pages can use larger headlines, but app and portal titles should stay restrained.
- Use tighter tracking only for headings and small uppercase eyebrows.
- Metadata, helper text, and table support text should stay in `text-sm` or smaller.

## Shared Component Rules

- Use `aa-button` plus a variant class for shared action styling:
  - `aa-button-primary`
  - `aa-button-secondary`
  - `aa-button-success`
  - `aa-button-danger`
- Use `aa-field` for shared text input, textarea, and select treatment where practical.
- Reuse `SurfaceCard`, `SectionCard`, `PageHeader`, `StatCard`, `EmptyState`, and `StatusBadge` instead of page-local shells where possible.
- Prefer token-backed classes like `border-border`, `bg-surface`, `bg-surface-muted`, `text-ink`, and `text-ink-muted` over one-off hex values.

## Surface Families

- Public site:
  - Most spacious
  - Section-led
  - Persuasive but restrained
- Admin workspace:
  - Densest
  - Operational and finance-trustworthy
  - Strong hierarchy, minimal noise
- Partner portal:
  - Lighter and simpler than admin
  - Read-only
  - Reassuring and narrow in scope

## Status Usage

- Primary: active neutral progress or controlled visibility
- Success: complete, healthy, paid, ready
- Warning: under review, pending, partial, needs follow-up
- Danger: failed, rejected, blocked
- Neutral: passive metadata or low-emphasis labels

## Ongoing Implementation Rule

When adding or redesigning UI:

1. Start from the shared token system in `app/globals.css`.
2. Prefer shared shells/components before adding page-specific wrappers.
3. Keep brand differences between public, admin, and portal intentional through spacing and density, not through unrelated colors or typography.
