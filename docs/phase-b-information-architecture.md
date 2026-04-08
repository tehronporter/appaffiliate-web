# Phase B: Information Architecture Overhaul

## 1) Executive Summary

AppAffiliate needs to stop presenting itself like a route-driven internal tool and start behaving like a clear SaaS with three distinct experiences:

- a public marketing site for evaluation and trust-building
- an internal admin workspace for daily affiliate operations
- a read-only partner portal for partner visibility

Phase B defines the structure that future copy and design phases should follow. It does not redesign the UI yet. It aligns the product to the Phase A direction: TEHSO minimalism, Notion-like restraint and spacing rhythm, and a finance-first calm bias.

The public site should answer what AppAffiliate is, who it is for, how it works, why it is trustworthy, and how to start. The internal app should make daily workflows more discoverable and better grouped. The partner portal should remain intentionally narrow, simple, and separate from the admin app.

**A) Public sitemap**

- Home
- Product
- How it works
- Pricing
- Security
- Docs / Help
- Login
- Request access / Book demo

## 2) Public-site IA

### Home

Purpose:

- explain AppAffiliate clearly and quickly
- establish trust
- route qualified visitors to product pages, pricing, security, or a demo/access CTA

Primary audience:

- app founders
- growth/partnership leads
- operations leads
- finance-aware evaluators

Key questions it answers:

- What does AppAffiliate do?
- Who is it for?
- Why is it different from a generic affiliate dashboard?
- Can I trust it with attribution, commissions, and payout workflows?
- What should I do next?

Core CTA:

- `Request access` or `Book demo`

Supporting CTA:

- `View product`

Content sections needed:

- hero
- trust/value proposition
- who it’s for
- how it works summary
- product surface overview
- partner portal mention
- security/trust
- pricing/demo CTA
- footer

What should not live here:

- route-map framing
- internal admin navigation language
- low-level implementation detail
- finance/export workflow detail that belongs on Product or How it works

### Product

Purpose:

- explain the product in a structured way
- show what AppAffiliate covers today

Primary audience:

- buyers and evaluators who understand the category

Key questions it answers:

- What workflows does AppAffiliate actually cover?
- What are the major product areas?
- How does partner visibility fit in?

Core CTA:

- `Book demo`

Content sections needed:

- product overview
- workflow pillars: ingestion, attribution, review, commissions, payouts, exports
- admin workspace summary
- partner portal summary
- honest MVP scope note

What should not live here:

- pricing detail
- deep security detail
- implementation-specific route names

### How it works

Purpose:

- explain the product operating model end to end

Primary audience:

- evaluators who want process clarity
- operations and finance stakeholders

Key questions it answers:

- How does AppAffiliate move from ingest to payout?
- Where does manual review happen?
- What does partner visibility include?

Core CTA:

- `Request access`

Content sections needed:

- ingest and readiness
- attribution review
- commission review
- payout preparation
- exports and finance handoff
- portal visibility

What should not live here:

- marketing fluff
- architectural internals
- exhaustive settings detail

### Pricing

Purpose:

- frame commercial entry clearly even if billing is not yet productized

Primary audience:

- buyers
- founders
- ops leads evaluating fit

Key questions it answers:

- How is AppAffiliate sold?
- What kind of engagement should I expect?
- What should I do if I want access?

Core CTA:

- `Book demo`

Content sections needed:

- pricing posture
- package/engagement framing
- what is included
- implementation/access CTA

What should not live here:

- in-product billing details
- self-serve checkout assumptions
- internal pricing operations

### Security

Purpose:

- provide trust and operational assurance

Primary audience:

- technical evaluators
- ops and finance stakeholders

Key questions it answers:

- How does AppAffiliate protect access and data boundaries?
- How are admin and partner experiences separated?
- How are exports and finance actions permissioned?

Core CTA:

- `Request access`

Content sections needed:

- access model
- org scoping and permissions
- admin vs portal separation
- audit and operational controls
- Apple payload/privacy posture

What should not live here:

- legal boilerplate pretending to be a full compliance program
- unsupported enterprise claims

### Docs / Help

Purpose:

- provide implementation and operational guidance

Primary audience:

- prospects in technical review
- internal operators
- implementation partners

Key questions it answers:

- What does setup involve?
- What workflows exist today?
- What are the current limitations?

Core CTA:

- `Request access`

Content sections needed:

- getting started
- operator workflows
- portal scope
- known limitations

What should not live here:

- marketing homepage narrative
- sales-heavy CTA blocks

### Login

Purpose:

- route existing users into the right authenticated experience

Primary audience:

- internal users
- partner users

Key questions it answers:

- How do I sign in?
- What kind of account should use this page?

Core CTA:

- `Sign in`

What should not live here:

- broad product selling
- feature inventory

### Request access / Book demo

Purpose:

- convert qualified public interest into a sales/onboarding motion

Primary audience:

- evaluators ready to talk

Key questions it answers:

- How do I get access?
- What happens next?

Core CTA:

- `Book demo`

Content sections needed:

- concise qualification framing
- implementation expectation
- next-step clarity

What should not live here:

- full product education repeated from Home/Product/How it works

## 3) Internal App IA

### IA principles for the internal app

- Daily workflow routes should be easiest to reach.
- Configuration should not compete with operational review.
- Monitoring and audit should support decision-making, not dominate nav.
- Labels should sound like SaaS product areas, not internal project structure.

### Ideal top-level grouping

#### Overview

- Dashboard

Purpose:

- daily summary
- current risk / review / finance posture
- fastest route to the next important workflow

#### Program

- Apps / Apple Health
- Partners
- Codes

Purpose:

- persistent program setup and ownership structure

Notes:

- Apple Health should be more discoverable than it is now because it represents real ingest readiness.
- “Onboarding” should stop acting like a broad product bucket over time and become either:
  - a launch checklist page under Overview, or
  - a setup/readiness page under Program

Recommended direction:

- Rename visible label from `Onboarding` to `Launch checklist`
- Keep route reality if needed for now, but treat the page as readiness, not onboarding

#### Operations

- Events
- Unattributed
- Commissions
- Payouts
- Payout Batches

Purpose:

- daily operational review and finance workflow

Notes:

- These are the true day-to-day operational routes.
- `Unattributed` is a better top-level operational route than burying it.
- `Payout Batches` should be clearly tied to Payouts but remain directly reachable because it is an operational object, not just a detail page.

#### Controls

- Settings
- Audit
- Exports

Purpose:

- configuration, history, and controlled outputs

Recommended structure:

- Keep `Settings` as the control home
- Make `Audit` and `Exports` feel like control/oversight destinations rather than general workflow routes

### What should be top-level

- Dashboard
- Launch checklist
- Partners
- Codes
- Apple Health
- Events
- Unattributed
- Commissions
- Payouts
- Payout Batches
- Settings

### What should be grouped

- `Audit` should live under Settings/Controls in the IA, not as a separate main-work nav emphasis
- `Exports` should remain under Settings/Controls, not as a primary daily route
- `Organization`, `Team`, and `Rules` remain sub-pages of Settings

### What should be more discoverable

- Apple Health
- Launch checklist
- Payout Batches
- Exports for finance-capable users

### Daily workflow vs configuration vs monitoring

Daily workflow:

- Dashboard
- Launch checklist
- Events
- Unattributed
- Commissions
- Payouts
- Payout Batches

Program structure:

- Apple Health
- Partners
- Codes

Configuration / control:

- Settings
- Organization
- Team
- Rules
- Exports
- Audit

Monitoring / oversight:

- Dashboard
- Apple Health
- Audit
- parts of Settings overview

**B) Admin/workspace IA map**

- Overview
  - Dashboard
  - Launch checklist
- Program
  - Apple Health
  - Partners
  - Codes
- Operations
  - Events
  - Unattributed
  - Commissions
  - Payouts
  - Payout Batches
- Controls
  - Settings
    - Organization
    - Team
    - Rules
    - Exports
    - Audit

## 4) Partner Portal IA

### Current structure review

Current routes:

- `/portal`
- `/portal/codes`
- `/portal/performance`
- `/portal/payouts`

This is the correct MVP structure. It is shallow, understandable, and consistent with the product’s read-only portal scope.

### Recommended partner portal nav

- Overview
- Codes
- Performance
- Payouts

This should remain flat.

### Label recommendations

- `Overview` stays correct
- `Codes` stays correct
- `Performance` stays correct for current MVP
- `Payouts` stays correct

No additional portal sections should be introduced in this phase.

### What should remain out of scope

- settings
- profile editing
- payout method management
- tax forms
- messaging
- support inbox
- notifications
- code editing

### How the portal should stay distinct

- no admin nav patterns
- no settings/control mental model
- fewer navigation choices
- simpler page summaries
- clearer read-only posture
- softer copy than admin

**C) Partner portal IA map**

- Overview
- Codes
- Performance
- Payouts

## 5) Boundary Mapping

### Public marketing experience

Audience:

- new evaluators
- buyers
- app teams researching solutions

Entry points:

- Home
- Product
- How it works
- Pricing
- Security
- Docs / Help

CTAs should point to:

- Request access
- Book demo
- Login

Public-only content:

- value proposition
- persona framing
- pricing framing
- trust/security positioning
- product story

### Internal admin workspace

Audience:

- internal operators
- finance-aware admins
- app program owners

Entry point:

- Login → Dashboard / Launch checklist

App-only content:

- live operational queues
- review workflows
- finance actions
- exports
- audit/control surfaces
- settings and team controls

CTAs should point to:

- next workflow step
- review destinations
- finance-safe outputs

### Partner portal

Audience:

- linked partner users

Entry point:

- Login → Portal

Portal-only content:

- partner-linked codes
- partner-scoped performance
- payout visibility

CTAs should point to:

- the next read-only portal destination
- login if signed out

### Transition rules

- Public should never feel like internal documentation.
- Public CTAs should never send prospects straight to raw admin routes as the primary path.
- Login is the only shared auth entry.
- Internal users should land in admin.
- Partner users should land in portal.

**D) Boundary map: public vs app vs portal**

- Public = evaluation and trust
- App = operations and control
- Portal = partner visibility

## 6) Homepage Section Architecture

### Section 1: Hero

Job:

- explain the product in one clear frame

Core message:

- AppAffiliate helps app teams run affiliate operations with clearer attribution, commission review, payout readiness, and partner visibility

Ideal CTA:

- `Request access`

Visual treatment:

- large calm headline
- restrained supporting text
- one primary CTA, one secondary CTA

### Section 2: Trust / Value Proposition

Job:

- establish what kind of product this is

Core message:

- a calm, trust-heavy product for affiliate operations, not a noisy generic dashboard

Ideal CTA:

- `View product`

Visual treatment:

- short value pillars
- minimal stat or proof treatment

### Section 3: Who It’s For

Job:

- help the visitor self-identify quickly

Core message:

- built for app teams managing affiliate attribution, commissions, and payout operations

Ideal CTA:

- `See how it works`

Visual treatment:

- persona cards or structured audience blocks

### Section 4: How It Works

Job:

- explain the product flow from ingest to payout

Core message:

- AppAffiliate turns affiliate operations into a clear review flow: ingest, attribution, commission review, payout prep, partner visibility

Ideal CTA:

- `Explore the workflow`

Visual treatment:

- step sequence or process rail

### Section 5: Feature Surfaces

Job:

- show the real product surfaces without turning the homepage into a route map

Core message:

- the product covers the full operational loop

Ideal CTA:

- `View product`

Visual treatment:

- grouped capability blocks:
  - ingestion and readiness
  - attribution and review
  - commissions and payouts
  - exports and controls

### Section 6: Partner Portal

Job:

- explain that partner visibility exists without collapsing public and portal concepts

Core message:

- partners get read-only visibility into their codes, performance, and payouts without seeing admin controls

Ideal CTA:

- `See partner visibility`

Visual treatment:

- one focused supporting block, not a second homepage inside the homepage

### Section 7: Security / Trust

Job:

- reassure technical and finance-aware buyers

Core message:

- access boundaries, org scoping, auditability, and export controls are part of the product

Ideal CTA:

- `View security`

Visual treatment:

- concise trust bullets, low-noise layout

### Section 8: Pricing / Demo CTA

Job:

- convert qualified interest

Core message:

- AppAffiliate is available through a guided access/demo motion

Ideal CTA:

- `Book demo`

Visual treatment:

- simple CTA block, no fake self-serve pricing theatrics if not supported

### Section 9: Footer

Job:

- provide clear destination paths and trust anchors

Core message:

- complete but calm navigation

Ideal CTA:

- low-emphasis footer links

Visual treatment:

- clean multi-column footer or simple link grid

**E) Homepage section map**

- Hero
- Trust / value proposition
- Who it’s for
- How it works
- Feature surfaces
- Partner portal
- Security / trust
- Pricing / demo CTA
- Footer

## 7) Navigation Architecture

### Public top nav

Persistent:

- Product
- How it works
- Pricing
- Security
- Docs / Help
- Login
- Request access / Book demo

Rules:

- Keep it shallow
- No dropdown-heavy nav for MVP
- CTA stays singular and obvious

### Admin sidebar / nav priorities

Persistent top-level priorities:

- Dashboard
- Launch checklist
- Partners
- Codes
- Apple Health
- Events
- Unattributed
- Commissions
- Payouts
- Payout Batches
- Settings

Nested under Settings:

- Organization
- Team
- Rules
- Exports
- Audit

Rules:

- Keep daily workflow routes visible
- Keep config/controls grouped
- Apple Health should be persistent enough to be found without relying on app-specific route memory
- Avoid nav labels that sound like project phases

### Partner portal nav

Persistent:

- Overview
- Codes
- Performance
- Payouts

Rules:

- Flat
- read-only
- no settings
- no nested structures

### Public footer nav

Recommended:

- Product
- How it works
- Pricing
- Security
- Docs / Help
- Login
- Request access / Book demo

**F) Navigation recommendation summary**

- Public nav should be shallow and evaluative.
- Admin nav should emphasize daily workflow first, controls second.
- Portal nav should remain flat and read-only.
- Footer nav should mirror the public decision path, not repeat internal route groupings.

## 8) Naming Recommendations

### Public-facing labels

Use:

- Product
- How it works
- Pricing
- Security
- Docs / Help
- Request access
- Book demo

Avoid:

- route map
- workspace shell
- internal MVP
- operator notes as marketing framing

### Internal app labels

Current → Recommended visible label:

- `Onboarding` → `Launch checklist`
- `Needs Attribution` → keep as `Needs attribution` or simplify to `Attribution queue`
- `Workspace Settings` → `Settings`
- `Apple Health` → keep, but frame as app readiness / ingest health in supporting copy

Keep:

- Dashboard
- Partners
- Codes
- Events
- Commissions
- Payouts
- Payout Batches
- Exports
- Audit

### Portal labels

Keep:

- Overview
- Codes
- Performance
- Payouts

**G) Route naming / labeling recommendations**

- Public site should use buyer-friendly SaaS labels.
- Admin app should use workflow labels, not project or phase labels.
- Portal should remain simple and literal.
- The first visible rename target is `Onboarding` to `Launch checklist`.

## 9) Phase C Handoff Notes

Phase C should use this IA package to rewrite public and product copy before any broad visual rebuild begins.

What Phase C should do first:

1. Rewrite homepage messaging using the homepage section map.
2. Write Product, How it works, Pricing, Security, and Docs / Help page copy outlines.
3. Rewrite admin visible labels and page framing where naming drift still reflects the MVP shell mindset.
4. Tighten portal framing so read-only partner visibility is clearer and more polished.

What Phase C should not re-decide:

- public sitemap
- admin route grouping
- portal nav structure
- boundary model
- homepage section order

What later visual phases should inherit directly:

- public/app/portal distinction
- top-nav and sidebar priorities
- shallow portal navigation
- launch-checklist framing instead of onboarding framing

**H) Phase C handoff notes**

- Public copy should now be written against Home, Product, How it works, Pricing, Security, Docs / Help, Login, and Request access / Book demo.
- Admin copy should follow the Overview / Program / Operations / Controls model.
- Portal copy should preserve the flat Overview / Codes / Performance / Payouts structure.
