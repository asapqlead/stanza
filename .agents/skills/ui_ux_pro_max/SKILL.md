---
name: ui-ux-pro-max
description: >
  UI/UX design intelligence for web and mobile. Use when designing pages (landing, dashboard, admin,
  SaaS, mobile app), creating or refactoring UI components (buttons, modals, forms, tables, charts),
  choosing color schemes, typography, spacing or layout systems, reviewing UI code for accessibility
  or visual consistency, implementing animations or responsive behavior, building design systems,
  logo/brand identity work, slide/presentation creation, banner design, or icon design. Also use when
  UI looks "not professional enough", for pre-launch quality checks, or for cross-platform alignment
  (Web/iOS/Android). Skip only for pure backend, API/database-only, or non-visual tasks.
---

# UI/UX Pro Max — Unified Design Reference

Comprehensive design guide for web and mobile: 50+ styles, 161 color palettes, 57 font pairings,
99 UX guidelines, 25 chart types, plus brand, design system, slides, banner, and icon guidance.

---

## ROUTING GUIDE

| Task | Section |
|------|---------|
| New page / component / style / color / font | §1 Design System + §2 Rules |
| Review existing UI for UX or accessibility | §2 Rules (Priority 1–3) |
| Fix a UI bug (hover, layout shift, etc.) | §2 Rules → relevant priority |
| Improve / optimize / dark mode / charts | §2 Rules §7 or §10 |
| Brand identity, voice, logo | §3 Brand & Design System |
| Presentations / pitch decks | §4 Slides |
| Banners / social media images | §5 Banners |
| SVG icon design | §6 Icons |

---

## §1. DESIGN SYSTEM APPROACH

### Step 1: Analyze the Request
Extract: product type, target audience, style keywords, tech stack.

**Product types:** Entertainment (social, video, gaming) · Tool (scanner, editor) · Productivity
(tasks, calendar) · SaaS · E-commerce · Portfolio · Healthcare · Fintech · Hospitality

### Step 2: Assemble a Design System
For any new project, define these five dimensions before writing code:

| Dimension | What to Decide |
|-----------|---------------|
| **Pattern** | Page structure (hero-centric, feature-grid, dashboard-split…) |
| **Style** | Visual language (see §2 §4 Style Selection) |
| **Colors** | Primary, secondary, accent, surface, on-surface tokens |
| **Typography** | Heading / body font pairing + scale (12/14/16/18/24/32) |
| **Effects** | Shadow scale, blur, border-radius, gradients — must match style |

### Step 3: Choose the Right Style for the Product

| Style | Best For | Key Traits |
|-------|----------|-----------|
| Minimalism | SaaS, tools, productivity | White space, restrained color, no decoration |
| Glassmorphism | Apps, SaaS, modern | Frosted blur, translucency, layered depth |
| Claymorphism | Consumer apps, health | Puffy 3D shapes, pastel, soft shadows |
| Brutalism | Creative, portfolio | Raw grids, bold type, high contrast |
| Neumorphism | Dashboards, IOT | Soft extruded surfaces, subtle shadows |
| Bento Grid | SaaS, portfolios | Card mosaic, varying sizes, organized chaos |
| Dark Mode | Dev tools, media | Deep backgrounds, desaturated accents |
| Flat Design | Corporate, Google-style | No shadows, bold color blocks, clean icons |
| Skeuomorphism | Consumer, luxury | Realistic textures, tactile affordance |
| Gradient | Modern brands, fintech | Rich color transitions, depth, energy |

### Anti-Patterns to Always Avoid
- Mixing flat and skeuomorphic styles on the same screen
- Using emoji as structural icons (use SVG icon sets: Lucide, Heroicons)
- Raw hex values in components — always use semantic tokens
- Placeholder text as the only label for inputs
- Color as the sole differentiator for information

---

## §2. UX RULES BY PRIORITY

### Priority 1 — ACCESSIBILITY (CRITICAL)

| Rule | Standard |
|------|----------|
| Color contrast | 4.5:1 minimum for body text; 3:1 for large text (≥18px bold) |
| Focus states | Visible focus rings (2–4px) on all interactive elements |
| Alt text | Descriptive alt for meaningful images; empty alt for decorative |
| Aria labels | `aria-label` on icon-only buttons; native `accessibilityLabel` in mobile |
| Keyboard nav | Tab order matches visual order; full keyboard support |
| Form labels | `<label for>` on every input; never placeholder-only |
| Heading order | Sequential h1→h6, no skipped levels |
| Color not only | Add icon or text alongside color to convey meaning |
| Dynamic Type | Support system text scaling; avoid truncation as text grows |
| Reduced motion | Respect `prefers-reduced-motion`; disable/reduce animations |
| VoiceOver/SR | Meaningful labels, logical reading order |
| Keyboard shortcuts | Preserve system a11y shortcuts; provide alternatives for drag-and-drop |

### Priority 2 — TOUCH & INTERACTION (CRITICAL)

| Rule | Standard |
|------|----------|
| Touch target size | Min 44×44pt (iOS) / 48×48dp (Android); extend `hitSlop` if icon is smaller |
| Touch spacing | Min 8px/8dp gap between adjacent targets |
| Primary interaction | Use click/tap; never rely on hover alone as the only trigger |
| Loading feedback | Disable button during async; show spinner or progress |
| Error feedback | Clear error message near the problem element |
| Tap delay | `touch-action: manipulation` to eliminate 300ms delay (Web) |
| Press feedback | Visual feedback within 100ms (ripple, opacity, elevation) |
| Haptic | Confirmations and important actions only; no overuse |
| Safe areas | Keep targets away from notch, Dynamic Island, gesture bar |
| Swipe clarity | Swipeable items must show affordance (chevron, hint, label) |
| Gesture conflicts | One primary gesture per region; no nested tap/drag conflicts |

### Priority 3 — PERFORMANCE (HIGH)

| Rule | Standard |
|------|----------|
| Image format | WebP/AVIF; `srcset`/`sizes` for responsive; lazy load off-screen |
| Image dimensions | Declare `width`/`height` or `aspect-ratio` to prevent CLS |
| Font loading | `font-display: swap/optional`; preload only critical weights |
| Code splitting | Route-level splitting (React Suspense / Next.js dynamic) |
| List virtualization | Virtualize lists with 50+ items |
| Layout thrashing | Batch DOM reads then writes; avoid read/write interleaving |
| CLS | Reserve space for async content (skeletons); CLS < 0.1 |
| Debounce/throttle | High-frequency events: scroll, resize, search input |
| Main thread | Keep per-frame work < 16ms; offload heavy tasks |
| Progressive loading | Skeleton / shimmer for operations > 1 second |
| Offline | Provide offline state messaging and basic fallback |

### Priority 4 — STYLE SELECTION (HIGH)

- Match style to product type (see §1 table above)
- Use one consistent style across all screens — no mixing
- SVG icons only — one icon family, consistent stroke width
- Effects (shadow, blur, radius) must align with chosen style
- Each screen has exactly one primary CTA; secondary actions are visually subordinate
- Use `blur` to indicate background dismissal (modals/sheets), not decoration
- Prefer native/system controls; customize only when branding requires it
- Design light and dark variants together, never infer one from the other

### Priority 5 — LAYOUT & RESPONSIVE (HIGH)

| Rule | Standard |
|------|----------|
| Viewport meta | `width=device-width initial-scale=1` — never disable zoom |
| Mobile-first | Design 375px first, scale up to 768 / 1024 / 1440 |
| Breakpoints | Consistent: 375 / 768 / 1024 / 1440px |
| Body font | Min 16px on mobile (prevents iOS auto-zoom) |
| Line length | Mobile 35–60 chars/line; desktop 60–75 chars |
| Horizontal scroll | Never on mobile; all content fits viewport width |
| Spacing scale | 4pt/8dp incremental system (Material Design) |
| Container width | `max-w-6xl` / `max-w-7xl` on desktop |
| Z-index | Define layered scale: 0 / 10 / 20 / 40 / 100 / 1000 |
| Safe area | Fixed headers/tab bars must account for notch/gesture bar |
| Viewport units | `min-h-dvh` not `100vh` on mobile |
| Landscape | Layout must remain operable in landscape mode |

### Priority 6 — TYPOGRAPHY & COLOR (MEDIUM)

**Typography:**
- Line height: 1.5–1.75 for body text
- Font scale: 12 / 14 / 16 / 18 / 24 / 32 (consistent)
- Weight hierarchy: Bold headings (600–700), Regular body (400), Medium labels (500)
- Use tabular/monospace figures for data columns, prices, timers
- Truncate with ellipsis + tooltip; prefer wrapping over truncation

**Color:**
- Always use semantic color tokens: `--color-primary`, `--color-error`, `--color-surface`
- Dark mode: use desaturated/lighter tonal variants — NOT inverted colors
- Functional color (error red, success green) must include icon/text, never color-only
- Verify contrast pairs: 4.5:1 (AA) or 7:1 (AAA)
- Token-driven theming: no hardcoded hex in components

### Priority 7 — ANIMATION (MEDIUM)

| Rule | Standard |
|------|----------|
| Duration | Micro-interactions 150–300ms; complex ≤400ms; never >500ms |
| Properties | Only `transform` and `opacity`; never animate `width`/`height`/`top` |
| Easing | `ease-out` for entering; `ease-in` for exiting; never `linear` for UI |
| Exit speed | Exit animations ~60–70% of enter duration |
| Stagger | List items: 30–50ms offset per item |
| Spring physics | Prefer spring/physics curves over cubic-bezier for natural feel |
| Interruptible | User tap cancels in-progress animation immediately |
| No blocking | UI stays interactive during all animations |
| Reduced motion | Every animation must respect `prefers-reduced-motion` |
| Spatial continuity | Transitions express direction/hierarchy (forward=left, back=right) |
| Scale feedback | Subtle scale 0.95–1.05 on press; restore on release |
| Gesture feedback | Drag/swipe tracks finger in real-time |

### Priority 8 — FORMS & FEEDBACK (MEDIUM)

- Visible label on every input (never placeholder-only)
- Show error below the related field; auto-focus first invalid field on submit
- Error messages state cause + how to fix (not just "Invalid input")
- Required fields marked with asterisk or equivalent
- Submit shows: loading → success/error
- Auto-dismiss toasts in 3–5 seconds; `aria-live="polite"` for screen readers
- Confirm before destructive actions
- Inline validation: on blur, not on every keystroke
- Use semantic `input type` (email, tel, number) for correct mobile keyboard
- Provide show/hide toggle for password fields
- Multi-step flows show step indicator and allow back navigation
- Long forms auto-save drafts; confirm before dismissing with unsaved changes
- Progressive disclosure: reveal complex options step by step, don't overwhelm

### Priority 9 — NAVIGATION (HIGH)

| Rule | Standard |
|------|----------|
| Bottom nav | Max 5 items; every item has icon + text label |
| Back behavior | Predictable and consistent; preserve scroll/state |
| Active state | Current location visually highlighted (color, weight, indicator) |
| Deep linking | All key screens reachable via URL / deep link |
| Modal escape | Clear close/dismiss affordance; swipe-down on mobile |
| iOS Tab Bar | Bottom Tab Bar for top-level navigation (Apple HIG) |
| Android Top Bar | Top App Bar with nav icon (Material Design) |
| State preservation | Back restores previous scroll, filters, and input |
| Gesture support | System gestures (swipe-back, predictive back) must not conflict |
| Adaptive | ≥1024px → sidebar; small screens → bottom/top nav |
| No mixing | Don't combine Tab + Sidebar + Bottom Nav at the same level |

### Priority 10 — CHARTS & DATA (MEDIUM)

| Chart Type | Use When |
|-----------|---------|
| Line | Trends over time |
| Bar | Comparisons between categories |
| Pie/Donut | Proportions — max 5 categories; use bar for more |
| Area | Volume over time with cumulative context |
| Scatter | Correlations between two variables |
| Funnel | Conversion rates, drop-off |
| Heatmap | Density, frequency patterns |

**Rules:**
- Always show legend; position near chart, not below scroll fold
- Provide tooltips on hover (web) / tap (mobile) with exact values
- Supplement color with patterns/shapes for colorblind accessibility
- Accessible chart colors: ≥3:1 contrast for data vs background
- Include `aria-label` summary for screen readers
- Show meaningful empty state when no data; never blank axes
- For 1000+ data points: aggregate or sample, offer drill-down
- Charts must reflow or simplify on small screens

---

## §3. BRAND & DESIGN SYSTEM

### Brand Identity Checklist
When creating or reviewing a brand, ensure:
- **Voice:** Defined tone (formal/informal, playful/serious, expert/approachable)
- **Visual Identity:** Primary color, secondary, accent — all as HSL tokens
- **Typography:** Heading font + body font pair, with usage rules
- **Logo usage:** Clear space rules, forbidden modifications, color variants
- **Asset naming:** Consistent convention (brand-logo-primary-light.svg)

### Design Token Architecture (Three Layers)

```css
/* Layer 1: Primitive — raw values */
--color-blue-600: #2563EB;
--size-4: 1rem;

/* Layer 2: Semantic — purpose aliases */
--color-primary: var(--color-blue-600);
--spacing-section: var(--size-4);

/* Layer 3: Component — component-specific */
--button-bg: var(--color-primary);
--button-padding: var(--spacing-section);
```

**Rules:**
- Never use raw hex/px in components — always reference semantic tokens
- Semantic layer enables light/dark theme switching
- Use HSL format for easy opacity control: `hsl(220 90% 56% / 0.5)`
- Document every token's purpose

### shadcn/ui + Tailwind Quick Start

```bash
npx shadcn@latest init          # initializes both shadcn/ui and Tailwind
npx shadcn@latest add button card dialog form
```

**Component usage pattern:**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
        <CardContent>
          <Button variant="default" className="w-full">View Details</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Dark mode + responsive pattern:**
```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Content</h3>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

### Tailwind KV-Cache Ordering (Most Stable → Least)
1. Base styles / reset
2. Design tokens / CSS variables
3. Utility classes (layout, spacing, typography)
4. Responsive variants (`md:`, `lg:`)
5. State variants (`hover:`, `focus:`, `dark:`)
6. Dynamic / arbitrary values (`[value]`)

---

## §4. SLIDES & PRESENTATIONS

### Slide Creation Workflow

1. **Choose a strategy** based on goal:

| Strategy | Best For | Emotional Arc |
|----------|----------|--------------|
| Hero Pitch | Investors, fundraising | Excitement → Confidence |
| Problem-Solution | Sales, B2B | Frustration → Hope → Relief |
| Case Study | Client presentations | Skepticism → Belief |
| Product Launch | Marketing | Curiosity → Desire → Action |
| Data Story | Reports, QBRs | Neutral → Insight → Action |
| Educational | Onboarding, training | Confusion → Clarity → Confidence |

2. **Alternate emotions** (Duarte Sparkline): vary "What Is" (tension) with "What Could Be" (hope)
   at ⅓ and ⅔ through the deck for maximum engagement.

3. **Layout patterns** — pick per slide:

| Layout | Use When |
|--------|---------|
| Hero / Title | Opening, section breaks |
| Two-column | Before/after, feature vs benefit |
| Three-column | Comparison, pillars, team |
| Data spotlight | Single metric emphasis |
| Timeline | Process, history, roadmap |
| Grid mosaic | Multiple images, social proof |
| Full bleed image | Emotional impact, cover slides |
| Chart slide | Trend, growth, comparison data |

4. **Copywriting formulas** per slide:

| Formula | Pattern | Use For |
|---------|---------|---------|
| PAS | Problem → Agitation → Solution | Sales, pitch problem slide |
| AIDA | Attention → Interest → Desire → Action | Product slides, CTAs |
| FAB | Feature → Advantage → Benefit | Product / feature slides |
| STAR | Situation → Task → Action → Result | Case studies |
| 1-3-1 | 1 headline, 3 bullets, 1 CTA | Any supporting slide |

5. **Slide HTML requirements:**
   - Import `design-tokens.css` — single source of truth
   - Use `var(--color-primary)`, `var(--slide-bg)` — no hardcoded hex
   - Chart.js for all charts (`cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`)
   - Keyboard arrow navigation + progress bar
   - Center-aligned content; focus on persuasion

### Chart.js Template
```html
<canvas id="myChart"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
new Chart(document.getElementById('myChart'), {
  type: 'line',  // bar | pie | doughnut | radar | scatter
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      data: [12, 28, 45, 72],
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true, tension: 0.4
    }]
  },
  options: { responsive: true, plugins: { legend: { position: 'top' } } }
});
</script>
```

---

## §5. BANNER DESIGN

### Platform Size Reference

| Platform | Type | Size (px) |
|----------|------|-----------|
| Facebook | Cover | 820 × 312 |
| Facebook | Post | 1200 × 630 |
| Twitter/X | Header | 1500 × 500 |
| Twitter/X | Post | 1200 × 675 |
| LinkedIn | Personal banner | 1584 × 396 |
| LinkedIn | Post | 1200 × 627 |
| YouTube | Channel art | 2560 × 1440 |
| YouTube | Thumbnail | 1280 × 720 |
| Instagram | Post | 1080 × 1080 |
| Instagram | Story / Reel | 1080 × 1920 |
| Instagram | Carousel | 1080 × 1350 |
| Pinterest | Standard pin | 1000 × 1500 |
| TikTok | Video cover | 1080 × 1920 |
| Google Ads | Medium rectangle | 300 × 250 |
| Google Ads | Leaderboard | 728 × 90 |
| Google Ads | Wide skyscraper | 160 × 600 |
| Website | Hero banner | 1920 × 600–1080 |
| Email | Header | 600 × 200 |

### Art Direction Styles

| Style | Best For |
|-------|----------|
| Minimalist | SaaS, tech, professional |
| Bold typography | Announcements, sales events |
| Gradient mesh | Modern brands, apps |
| Photo-based | Lifestyle, e-commerce, food |
| Geometric | Fintech, tech, enterprise |
| Glassmorphism | SaaS, apps, futuristic |
| Neon / Cyberpunk | Gaming, events, nightlife |
| Editorial | Luxury, fashion, culture |
| Flat illustration | EdTech, consumer apps |
| Data visualization | B2B, analytics, reports |

### Banner Design Rules
- **Safe zones:** Critical content in central 70–80% (edge content may be cropped)
- **One CTA** per banner; bottom-right position; min 44px height
- **Max 2 fonts;** min 16px body, ≥32px headline
- **Text < 20%** of ad area for paid social (Meta penalizes heavy text)
- **Print:** 300 DPI, CMYK color space, 3–5mm bleed on all sides
- **Brand colors** dominant; background supports, never competes with CTA

---

## §6. ICON DESIGN

### Styles Reference

| Style | Best For | Traits |
|-------|----------|--------|
| Outlined | Web UI, dashboards | Thin stroke, open fills |
| Filled | Mobile nav bars, CTAs | Solid fill, high recognition |
| Duotone | Marketing, landing pages | Two-tone with accent layer |
| Rounded | Health, consumer apps | Soft corners, friendly |
| Sharp | Enterprise, fintech | Angular, precise |
| Flat | Material design, Google | No depth, bold color |
| Gradient | Modern SaaS, branding | Color transitions in fill |
| Line-art | Illustration, editorial | Expressive strokes |
| Pixel | Retro, gaming, nostalgia | Grid-snapped edges |
| 3D | Product pages, hero | Depth, lighting, shadow |
| Glass | Futuristic UI, apps | Translucent fill with blur |
| Sketch | Creative, handmade | Rough edges, organic |

### Icon Design Rules
- **Consistency:** One style and one stroke weight across entire product
- **Sizing:** Define tokens — `icon-sm: 16px`, `icon-md: 24px`, `icon-lg: 32px`
- **Filled vs outlined:** Never mix at the same hierarchy level (e.g. all nav icons = same style)
- **Touch target:** Minimum 44×44pt interactive area (add padding if icon is smaller)
- **Contrast:** 4.5:1 for small icons; 3:1 minimum for larger UI glyphs
- **Alignment:** Align to text baseline; consistent padding around all icons
- **SVG format:** Always export as SVG for scale-independent rendering and theme support

---

## §7. PRE-DELIVERY CHECKLIST

### Visual Quality
- [ ] No emoji used as icons — SVG icon set only
- [ ] Single consistent icon family and stroke weight
- [ ] Semantic color tokens used everywhere (no hardcoded hex)
- [ ] Pressed states don't shift layout bounds
- [ ] Light and dark variants both tested

### Interaction
- [ ] All tappable elements have pressed feedback (≤100ms)
- [ ] Touch targets ≥44×44pt (iOS) / ≥48×48dp (Android)
- [ ] Micro-interaction timing 150–300ms with native easing
- [ ] Disabled states visually clear and non-interactive
- [ ] Screen reader focus order matches visual order

### Accessibility
- [ ] Text contrast ≥4.5:1 (body) and ≥3:1 (large text)
- [ ] All interactive elements keyboard-accessible
- [ ] Error messages use `aria-live` or `role="alert"`
- [ ] Color never the sole differentiator
- [ ] Reduced motion respected

### Layout
- [ ] Safe areas respected for headers, tab bars, CTAs
- [ ] Scroll content not hidden behind fixed bars
- [ ] Tested at 375px (small phone), large phone, tablet — portrait and landscape
- [ ] 4/8dp spacing rhythm consistent throughout
- [ ] No horizontal scroll on mobile

### Dark Mode (if applicable)
- [ ] Primary text ≥4.5:1 in dark mode
- [ ] Secondary text ≥3:1 in dark mode
- [ ] Dividers and borders visible in both modes
- [ ] Modal scrim opacity 40–60% black

---

## §8. COMMON STICKING POINTS

| Problem | Fix |
|---------|-----|
| "Looks unprofessional" | Check §2 Priority 1–3 + style consistency (§1) |
| Dark mode contrast fails | §2 §6: `color-dark-mode` + `color-accessible-pairs` |
| Animations feel wrong | §2 §7: `spring-physics` + `exit-faster` + `easing` |
| Form UX is poor | §2 §8: `inline-validation` + `error-clarity` + `focus-management` |
| Navigation confusing | §2 §9: `nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
| Layout breaks mobile | §2 §5: `mobile-first` + `breakpoint-consistency` + safe areas |
| Performance / jank | §2 §3: `virtualize-lists` + `debounce-throttle` + `main-thread-budget` |
| Charts inaccessible | §2 §10: patterns, aria-label summary, keyboard-navigable elements |
| Icon inconsistency | §6: pick one style, define size tokens, align to baseline |
| Brand feels weak | §3: define 3-layer token system, voice framework, asset rules |

---

*Source: UI/UX Pro Max Skill Collection (github.com/claudekit/ui-ux-pro-max-skill)*
*Covers: ui-ux-pro-max, ui-styling, design, design-system, brand, slides sub-skills*
