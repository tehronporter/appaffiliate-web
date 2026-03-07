# Phase A: Brand Translation + UX Direction Lock

## 1) Executive Summary

AppAffiliate should stop looking like a well-built internal MVP shell and start reading as a calm, premium SaaS for affiliate operations. The product already has real workflow depth: Apple ingestion readiness, partners, codes, unattributed review, attribution decisions, commissions, payouts, payout batches, exports, settings, audit, and a read-only partner portal. Phase A locks the design and copy direction before any broad visual rebuild begins.

TEHSO is the brand source. Notion is the interaction reference for restraint, hierarchy, whitespace, and rhythm. AppAffiliate should not imitate either literally. It should translate TEHSO minimalism into a finance-first operational product: more polished, more composed, more trustworthy, and more focused than a generic dashboard, without becoming airy, decorative, or editorial.

This phase is docs-only. It does not redesign pages, swap tokens in code, or change runtime UI. Its job is to remove ambiguity so later redesign phases can execute quickly and consistently.

**A) AppAffiliate Design Direction Summary**

- AppAffiliate is a calm operations product, not a loud growth dashboard.
- Minimal means lower visual noise, fewer competing actions, and cleaner hierarchy, not less information.
- TEHSO Blue leads. White carries the canvas. Near-black carries meaning. Soft gray carries structure.
- The product should feel precise, composed, premium, and human, not startup-hyped or enterprise-bloated.
- Public site, admin workspace, and partner portal should feel like one system expressed in three different levels of density.

## 2) Brand Translation

### Brand principles

1. Clarity over decoration.
2. Trust over energy.
3. Restraint over feature theater.
4. Guidance over interruption.
5. Consistency over novelty.
6. Quiet confidence over marketing noise.

### Product personality

AppAffiliate should feel:

- calm
- exact
- capable
- premium
- trustworthy
- modern
- operational
- human

AppAffiliate should not feel:

- flashy
- loud
- trend-chasing
- “growth hack” oriented
- cluttered
- pseudo-enterprise
- over-designed
- emotionally cold

### Design values

- Make the most important decision on the screen obvious.
- Preserve breathing room around dense operational content.
- Treat structure as a product feature, not just styling.
- Keep states and labels honest, especially in finance and review workflows.
- Reduce friction without hiding consequences.
- Let typography, spacing, and alignment do more work than color.

### Visual behavior rules

- Blue is directional, not decorative.
- White space is intentional and should never feel like empty filler.
- Surfaces exist to organize complexity, not to create visual layering for its own sake.
- Dense workflow screens should become calmer through grouping and rhythm, not through compression.
- Every page should present one dominant action focus at a time.
- Status systems should feel measured and trustworthy, never urgent unless something is truly blocked.

### What “minimal” means for AppAffiliate

For AppAffiliate, minimal means:

- fewer competing accents
- fewer simultaneous CTA styles
- stronger type hierarchy
- more stable spacing rhythm
- clearer section boundaries
- less explanatory fluff
- less dashboard chrome
- tighter, more honest copy

It does **not** mean:

- hiding critical counts or finance state
- removing tables from workflow-heavy screens
- collapsing useful context into hidden drawers by default
- overusing blank space until operational work becomes slower
- using vague copy instead of explicit workflow language

### How AppAffiliate should feel compared to generic SaaS dashboards

Generic SaaS dashboards often feel:

- louder
- busier
- more metric-theater driven
- more badge-heavy
- more sales-led than workflow-led

AppAffiliate should feel:

- more composed
- more trust-oriented
- more specific to attribution and finance review
- more deliberate with emphasis
- more premium through restraint

## 3) Visual System Rules

### Core visual direction

- Blue-led but restrained
- White canvas
- Near-black text
- Soft gray surfaces
- Inter only
- Generous whitespace
- Low visual noise
- One clear action focus at a time

### Color usage

Primary palette:

- Primary blue: `#2E53FF`
- Blue support / darker emphasis: `#284ABF`
- White canvas: `#FFFFFF`
- Near-black text: `#1A1A1A` or `#111111`
- Muted body/support text: `#6B6B6B`
- Soft muted text: `#A0A0A0`
- Dividers: `#EBEBEB`
- Surface gray: `#F5F5F5`
- Canvas gray only when needed for app framing: `#FAFAFA`

Rules:

- Blue is reserved for primary CTA, active nav, links, focus, key highlights, and the wordmark.
- Do not use multiple saturated accents on the same page.
- Success, warning, and danger states should exist, but quieter than the blue system and used only when the state truly matters.
- Default screens should read mostly as white, gray, and near-black.
- Avoid heavy gradients, colored card backgrounds, and decorative glows in the base system.

### Typography usage

- Typeface: `Inter` only
- Display headlines: `800-900`, tight tracking around `-0.03em` to `-0.04em`
- Page titles / section headers: `700-800`, tracking around `-0.02em`
- UI labels / buttons / badges: `500-600`
- Body copy: `400`
- Small overlines / labels: uppercase only when they improve orientation, not as a default styling habit
- Body line height: around `1.6-1.7`
- Headline line height: around `1.1-1.2`

Rules:

- Do not mix Inter with display fonts.
- Do not use pure black for body copy.
- Use strong type hierarchy before introducing additional surfaces or dividers.
- Favor fewer text sizes with more disciplined weight use.

### Spacing system

- Base unit: `8px`
- Common spacing values: `8, 16, 24, 32, 40, 48, 64, 80`
- Minimum touch target: `44px`
- Prefer stable vertical rhythm over local one-off spacing fixes

Rules:

- Dense pages still follow the same 8px rhythm.
- Headings should have enough room above them to feel like section starts, not label changes.
- Tables should sit inside clear section spacing, not directly against headers or unrelated cards.

### Max widths and content widths

Public marketing:

- Hero content width: `560-720px`
- Standard content width: `680-760px`
- Broader feature grids can extend to `1100-1200px`

Admin workspace:

- Main page container: `1200-1440px`
- Dense table/content sections can extend wider than reading text
- Intro/header copy blocks should remain narrower than data tables

Partner portal:

- Main container: `960-1120px`
- Simpler than admin, but not as narrow as editorial marketing copy

### Border radius

- Inputs: `8px`
- Inline cards / data wells: `10-12px`
- Primary cards / section surfaces: `12px`
- Pills / badges / capsule buttons: `999px`

Rules:

- Avoid oversized rounded corners that make finance/admin UI feel playful.
- Use radius consistently enough that component roles feel related.

### Card treatment

- Cards are organizational devices, not decorative glass boxes.
- Default card background: white or very light gray
- Border first, shadow second
- Shadows should be soft and sparse
- Cards should not stack excessive nested surfaces unless grouping is necessary

Rules:

- Public site cards can breathe more and feel more polished.
- Admin cards should bias toward utility and grouping clarity.
- Portal cards should feel simpler and more reassuring than admin cards.

### Table treatment

- Tables remain first-class UI in the admin product.
- Use tables where comparison, review, or status scanning matters.
- Avoid over-styling rows.
- Emphasize column alignment, whitespace, and status clarity over dense ornamentation.

Rules:

- Row height should be comfortable, not compressed.
- Status chips should be readable but quiet.
- Header rows should feel stable and understated.
- Secondary metadata belongs in muted text, not another badge.

### Button treatment

- One primary button style across the system
- Primary button uses blue fill
- Secondary button uses white/light surface with border
- Tertiary action should usually be text or subtle ghost treatment

Rules:

- Do not place multiple primary buttons in the same action cluster.
- On dense screens, the primary action should be the next best workflow move, not every possible action.
- Portal CTAs should be fewer and calmer than admin CTAs.

### Input and form treatment

- Inputs use light surfaces, clear borders, and strong focus states
- Labels remain visible; do not rely on placeholder-only labeling
- Group fields into clear sections with vertical rhythm
- Validation copy should be direct and calm

Rules:

- Avoid overly tinted form backgrounds.
- Avoid crowded inline form layouts unless the data is naturally compact.
- Forms should look operational and reliable, not promotional.

### Badge and chip treatment

- Use badges for state, not decoration.
- Badge palette should stay desaturated and legible.
- Default badge count per row should be low.

Rules:

- Prefer one meaningful status chip over multiple overlapping labels.
- Avoid turning metadata into a badge if muted text is enough.
- Blue badge usage should imply relevance, not just presence.

### Iconography rules

- Single-weight line icons only
- No filled icon sets
- No mixed icon families
- Icons support orientation, not branding spectacle

Rules:

- Use icons sparingly in data-heavy areas.
- Do not use icons where label text alone is clearer.
- Navigation icons should remain simple and low-contrast.

### Empty state rules

- Empty states should explain what is missing, why it might be normal, and what to do next.
- Empty states should not sound apologetic unless there is an error.
- Portal empty states should reassure rather than imply failure.

Rules:

- Keep one clear next action.
- Avoid illustrations in the base system.
- Avoid generic “nothing here yet” copy without context.

### Page header rules

- Every page header should establish what the page is for, not just restate the nav label.
- Headers should include:
  - clear title
  - short functional description
  - optional state badges
  - tightly curated actions

Rules:

- Marketing headers can be more persuasive.
- Admin headers should be more operational.
- Portal headers should be more reassuring and explanatory.

### Section spacing rules

- Major page sections should be visually obvious without relying on loud separators.
- Use vertical spacing before adding more card treatments.
- Alternate between open spacing and contained surfaces to keep long pages readable.

**C) AppAffiliate UI Rules Checklist**

- Use Inter only
- Use one primary blue
- Default to white canvas and soft gray surfaces
- Keep text near-black, not pure black
- Follow 8px spacing rhythm
- Use borders before shadows
- Keep one primary action focus per section
- Use tables where review/scanning matters
- Use badges only for meaningful state
- Keep empty states actionable and calm
- Keep headers short, clear, and purpose-led
- Reduce visual noise before reducing information

## 4) Voice/Tone Rules

### Copy principles

- Be clear before clever.
- Sound trustworthy, not theatrical.
- Use product language that reflects real workflow value.
- Explain state honestly, especially in review and finance contexts.
- Keep headlines shorter and more confident.
- Treat users as capable professionals, not leads to persuade inside the product.

### Public marketing copy

Tone:

- calm
- polished
- specific
- benefit-led
- SaaS-clear

Should emphasize:

- affiliate operations
- attribution clarity
- commission review
- payout readiness
- partner visibility
- finance-ready exports
- trust and control

Should avoid:

- “internal shell”
- “route map”
- “boundary”
- “phase foundation”
- “operator notes” as primary framing

### Logged-in internal app copy

Tone:

- direct
- operational
- steady
- trust-heavy
- low-drama

Should emphasize:

- what changed
- what needs review
- what is blocked
- what is ready
- what the next safe action is

### Finance and ops workflow copy

Tone:

- explicit
- measured
- audit-friendly
- non-hyped

Rules:

- Say approved, rejected, payout-ready, exported, paid.
- Avoid vague phrases like “looks good” or “all set” when a workflow state exists.
- Keep money/status copy precise.
- Error states should explain what failed and what the user can do next.

### Partner portal copy

Tone:

- simple
- calm
- reassuring
- read-only by default

Rules:

- Emphasize visibility, status, and trust.
- Avoid internal admin language.
- Avoid exposing the mechanics of internal review unless needed for honesty.

### Empty states

Rules:

- Say why the page is empty
- Say whether that can be normal
- Say what action, if any, should happen next

Good tone:

- “No payout batches are visible yet.”
- “Once approved commission items are moved into payout batches, they will appear here.”

### Success, error, and action feedback

Success:

- short
- factual
- no celebration language

Error:

- calm
- specific
- actionable

Action feedback:

- oriented around workflow state change, not UI mechanics

### Vocabulary to favor

- affiliate operations
- attribution
- partner visibility
- codes
- review
- commission status
- payout status
- payout batch
- exports
- finance-ready
- trusted
- clear
- controlled
- read-only

### Vocabulary to avoid

- shell
- route map
- boundary as homepage framing
- phase foundation
- operator notes as marketing framing
- leverage
- optimize
- growth-hack
- KPI-heavy claims
- unlock all features
- maximize productivity

### Good headline tone examples

- “Affiliate operations with clearer attribution and payout control.”
- “Review commissions, prepare payouts, and keep partner visibility clean.”
- “A calmer way to run affiliate workflows.”
- “Partner visibility without exposing internal finance controls.”

### Good microcopy tone examples

- “Review the items still waiting on attribution.”
- “This export is ready for finance handoff.”
- “No partner-linked codes are visible yet.”
- “This account is not using the partner portal role.”
- “Enter a commission amount before approving this item.”

**B) AppAffiliate Voice/Tone Summary**

- Marketing is polished and product-specific.
- Admin copy is calm and operational.
- Finance copy is exact and state-based.
- Portal copy is reassuring and read-only.
- Empty states teach the next step.
- Feedback stays factual, never theatrical.

## 5) Public vs App vs Portal Distinction

### What should feel shared

- Same core blue/white/near-black system
- Same typography voice
- Same spacing discipline
- Same quiet confidence
- Same avoidance of visual noise
- Same emphasis on trust and clarity

### What should feel different

#### Logged-out public marketing site

Should feel:

- cleaner
- more persuasive
- more aspirational
- more brand-forward

Should prioritize:

- product story
- core value
- confidence
- clarity

Should avoid:

- internal MVP framing
- route-driven framing
- admin vocabulary as the hero narrative

#### Logged-in internal admin workspace

Should feel:

- denser
- more operational
- more task-led
- more exact

Should prioritize:

- review workflows
- state clarity
- data visibility
- action confidence

Should avoid:

- excessive promo language
- decorative hero treatments
- dashboard noise

#### Logged-in read-only partner portal

Should feel:

- simpler than admin
- softer than finance screens
- more reassuring
- still clearly part of the same brand

Should prioritize:

- partner-owned visibility
- status understanding
- payout trust
- read-only clarity

Should avoid:

- admin framing
- internal process language
- finance-control language

**D) Public Site vs App vs Portal Distinction Summary**

- Public site sells confidence and clarity.
- Admin workspace supports review, control, and operations.
- Portal provides calm read-only visibility.
- Shared brand comes from discipline, not identical layouts.
- App density increases by surface responsibility: public lowest, portal medium, admin highest.

## 6) Do / Don’t Guide

### Public website

Do:

- Lead with product value and trust
- Use fewer, stronger sections
- Keep headlines short and concrete
- Use premium restraint instead of enterprise feature stuffing

Don’t:

- frame the homepage as a route index
- describe the product as a shell
- use internal navigation vocabulary as marketing
- overload hero areas with cards, badges, and metrics

### Product UI

Do:

- make the current workflow state obvious
- use grouping to calm dense information
- keep actions consistent and scarce
- favor alignment, spacing, and typography over decoration

Don’t:

- scatter multiple primary actions
- make every row visually loud
- create dashboards that look like KPI walls
- over-badge every piece of metadata

### Portal UI

Do:

- keep the portal simpler and more reassuring than admin
- explain read-only posture clearly
- show only partner-safe data

Don’t:

- expose admin copy, internal notes, or internal controls
- mirror admin density exactly
- treat missing partner linkage as a broken state

### Navigation

Do:

- keep labels practical and short
- use labels that match real product jobs
- preserve a stable mental model across surfaces

Don’t:

- use vague category names when job-specific names exist
- add visual noise to the nav
- turn navigation into marketing copy

### CTAs

Do:

- present one dominant CTA per context
- use verbs tied to the user’s next safe step

Don’t:

- promote multiple equal-priority CTAs at once
- use generic “learn more” where a product action exists
- make destructive or finance-sensitive actions feel casual

### Cards

Do:

- use cards to group content and reduce scanning stress
- keep card internals clean and ordered

Don’t:

- over-nest cards inside cards inside cards
- use colored cards as decoration
- use cards where a simple open layout is clearer

### Dashboards

Do:

- summarize state and point to next actions
- reduce visual competition between stats and workflow sections

Don’t:

- become a vanity metric wall
- show every count as equally important
- treat all cards as the same visual priority

### Tables

Do:

- keep column hierarchy clear
- use whitespace and muted secondary text
- let status labels do the minimum needed

Don’t:

- compress rows to fit more data at the expense of clarity
- add unnecessary visual separators
- use color as the main method of understanding rows

### Empty states

Do:

- explain whether empty is normal
- offer the next action when relevant
- sound calm and useful

Don’t:

- say only “nothing here yet”
- over-apologize for normal empty states
- use placeholder-sounding product language

## 7) Design North Star

**E) Design North Star**

AppAffiliate should feel like a premium operations product that reduces noise without reducing control. Every screen should look composed, blue-led, and spacious enough to think clearly, while still supporting real attribution, commission, payout, and partner-review work. The goal is not to impress with interface volume. The goal is to make complex affiliate operations feel trustworthy, legible, and calm.

## 8) Copy North Star

**F) Copy North Star**

AppAffiliate should speak with clear, quiet authority. Public copy should explain the product like a polished SaaS, internal copy should guide review and finance work precisely, and portal copy should reassure partners with clean read-only visibility. Across every surface, the language should sound specific, trustworthy, and human, never vague, loud, or internally framed as an MVP shell.

## 9) Phase B Handoff Notes

Phase B should translate this direction into actual UI changes in this order:

1. Public-site overhaul first.
   - Replace route-map framing with product-story framing.
   - Rebuild hero, supporting sections, and CTA hierarchy around affiliate operations, attribution clarity, commissions, payouts, exports, and partner visibility.
2. Shared visual primitives second.
   - Redesign foundational tokens and primitives: page headers, cards, buttons, inputs, badges, tables, and empty states.
   - Move toward Inter-only, white-canvas, blue-led restraint.
3. Internal admin surfaces third.
   - Apply the system to dashboard, onboarding, partners, codes, unattributed, commissions, payouts, payout batches, settings, and audit.
   - Preserve workflow clarity and table quality over visual novelty.
4. Partner portal fourth.
   - Keep it recognizably related to the admin product but simpler, quieter, and more reassuring.

What must remain consistent:

- one primary blue
- Inter only
- 8px spacing rhythm
- one dominant action focus
- calm status presentation
- honest workflow language

What should be redesigned first at the component level:

- public shell/header
- page header
- surface card
- section card
- stat card
- status badge
- action buttons
- form inputs
- list/table containers
- empty states

Where public, app, and portal should intentionally diverge:

- Public gets more narrative spacing and stronger value framing.
- Admin gets more density, table support, and workflow clarity.
- Portal gets simpler summaries and softer read-only reassurance.

This direction is approved when later phases can redesign pages without re-deciding:

- what minimal means
- how blue is used
- how copy should sound
- how public/app/portal differ
- how trust and restraint should show up in dense operational UI
