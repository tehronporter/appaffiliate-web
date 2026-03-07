# Marketing Site UI Tightening Plan

## Scope
- Pages: [app/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/page.tsx), [app/product/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/product/page.tsx), [app/how-it-works/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/how-it-works/page.tsx), [app/pricing/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/pricing/page.tsx), [app/security/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/security/page.tsx), [app/docs/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/docs/page.tsx)
- Shared public chrome: [components/marketing-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-shell.tsx), [components/public-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/public-shell.tsx), [components/brand-logo.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/brand-logo.tsx)
- Shared public sections: [components/marketing-page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-page.tsx), [components/support-ui.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/support-ui.tsx)

## Current Issues By Area

### Shared nav / footer / logo
- [components/marketing-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-shell.tsx)
  - Header and footer still rely on gradient-heavy backgrounds that compete with page content.
  - Desktop and mobile CTA buttons are shared structurally, but spacing and visual weight are still heavier than the target polish level.
- [components/public-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/public-shell.tsx)
  - Public utility shell still uses an oversized gradient hero-card treatment.
  - Header copy block under the logo is longer than needed for repeat surfaces.
- [components/brand-logo.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/brand-logo.tsx)
  - Marketing and footer logo sizes should be rechecked against the tightened header/footer scale so the mark does not feel oversized.

### Shared hero layouts
- [components/marketing-page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-page.tsx)
  - `MarketingHero` is the main source of oversized typography, gradient wash, and placeholder-feeling right-column framing.
  - The scroll indicator adds ornamental motion and extra vertical space.
  - Eyebrow usage is structurally encouraged on every hero and section heading.
- `MarketingHeroVisual` should keep the homepage 3D icon, but the surrounding frame needs to feel more product-intentional and less like a generic placeholder box.

### Shared cards / CTA / comparison / support blocks
- [components/marketing-page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-page.tsx)
  - `MarketingCard` icon treatment is soft-filled and visually weak for feature scanning.
  - `MarketingCard`, `MarketingSteps`, `MarketingComparison`, and `MarketingCtaPanel` all lean on gradients and stronger shadows than the desired direction.
  - Comparison table colors are hardcoded and should move to cleaner semantic public tokens.
- [components/support-ui.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/support-ui.tsx)
  - `SupportCard` and `FaqGroup` still use larger radii, heavier shadows, and long text blocks.
  - `SupportChecklist` is gradient-heavy and visually louder than the rest of the docs surface.

### Homepage
- [app/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/page.tsx)
  - The homepage still includes a gradient comparison section wrapper that breaks section rhythm.
  - Several sections stack eyebrow, long title, and long paragraph in sequence, creating too much heading ceremony.
  - Comparison copy and mid-page feature copy can be tightened for faster scanning.

### Product
- [app/product/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/product/page.tsx)
  - Hero right column uses generic checklist boxes that read as placeholder scaffolding.
  - Multiple sections repeat long explanatory paragraphs when a tighter single sentence would work.
  - Feature cards need stronger icon hierarchy and more disciplined line length.

### How It Works
- [app/how-it-works/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/how-it-works/page.tsx)
  - Hero right column has the same placeholder checklist treatment as Product and Security.
  - The page uses repeated explanatory copy around the five-step sequence that can be shortened.
  - Step cards depend on the current soft-filled icon badge pattern.

### Pricing
- [app/pricing/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/pricing/page.tsx)
  - Contains the strongest leftover gradient usage after the homepage.
  - The two-card pricing CTA block feels taller and louder than needed.
  - Comparison section, included coverage, and pricing explanation all compete at similar visual weight.

### Security
- [app/security/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/security/page.tsx)
  - Hero right column still uses generic bullet-box treatment.
  - “Trust” sections reuse the same heading rhythm and feel longer than necessary.
  - Feature cards need sharper icon styling and tighter body copy.

### Docs
- [app/docs/page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/app/docs/page.tsx)
  - Hero right column still uses placeholder checklist boxes.
  - Docs entry cards and FAQ groups use different card language than the rest of the marketing system.
  - FAQ copy is useful but can be tightened to reduce reading time.

## Shared Components To Refactor First
- `MarketingHero`
  - Reduce vertical space, tighten type scale, simplify background treatment, and create a clearer optional right-column pattern.
- `MarketingHeroVisual`
  - Keep the homepage 3D icon, but normalize the frame, border, and spacing around hero visuals.
- `MarketingSectionHeading`
  - Make the eyebrow optional by default and reduce the amount of heading ceremony per section.
- `MarketingCard`
  - Normalize card padding, icon treatment, copy length, and hover state.
- `MarketingSteps`
  - Tighten card height, reduce decorative fill treatment, and improve sequence scanning.
- `MarketingComparison`
  - Keep structure, but reduce gradient use, simplify header styling, and standardize table row density.
- `MarketingCtaPanel`
  - Keep the locked headline, but reduce height and visual heaviness.
- `SupportCard`, `FaqGroup`, `SupportChecklist`
  - Bring docs/support surfaces onto the same radius, border, button-height, and typography system.
- `MarketingShell` and `PublicShell`
  - Normalize public header/footer rhythm, logo scale, and button usage across all public pages.

## Shared Building Blocks To Create Or Improve
- `PublicButton`
  - Single shared public CTA primitive with consistent 44px minimum height and primary/secondary/link variants.
- `PublicHeroAside`
  - Reusable right-column pattern for hero supporting content so pages stop hand-rolling placeholder boxes.
- `PublicFeatureIcon`
  - Line-icon wrapper that removes soft filled circles and gives feature cards a stronger, consistent icon treatment.
- `PublicSectionVariant`
  - Small helper for white vs surface-gray section rhythm so pages stop using ad hoc gradients.
- `PublicCopyWidth`
  - Shared max-width utility for hero paragraphs, section intros, and card body text to control line length.

## Copy Blocks To Tighten
- Homepage hero supporting paragraph and comparison intro.
- Product hero description and product-area intro paragraphs.
- How It Works hero description and sequence intro.
- Pricing hero description, comparison intro, and “How pricing is handled” section copy.
- Security hero description and both section intros.
- Docs hero description, entry-path intro, and FAQ descriptions.
- Footer supporting brand paragraph in [components/marketing-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-shell.tsx).
- Public shell brand-line paragraph in [components/public-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/public-shell.tsx).

## Implementation Order
1. Normalize shared public primitives in [components/marketing-page.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-page.tsx), [components/marketing-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/marketing-shell.tsx), [components/public-shell.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/public-shell.tsx), [components/support-ui.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/support-ui.tsx), and [components/brand-logo.tsx](/Users/user/Documents/AppAffiliate/appaffiliate-web/components/brand-logo.tsx).
2. Update hero sections on Homepage, Product, How It Works, Pricing, Security, and Docs to use the tightened shared hero system.
3. Tighten section rhythm, card/icon treatment, and CTA panels page by page without changing page order or core messaging.
4. Run one final public-site consistency pass for button heights, eyebrow frequency, copy length, and section background rhythm.

## Notes
- Keep the homepage headline `Pay creators for results, not hype.` unchanged.
- Keep the CTA headline `Start rewarding results instead of guessing on hype.` unchanged.
- Keep the homepage 3D app icon in place until real product screenshots are ready.
- Keep the comparison table structure; only tighten presentation and copy.
