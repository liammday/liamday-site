## liamday.co.uk component library — how to build with it

These are the real, compiled components from liamday.co.uk (an Astro + React + Tailwind v4 site). Build with them exactly as shipped — every design maps 1:1 onto code that ships.

### Surface & theme (read first)
The library is **light-on-dark by default**. Render components on the dark charcoal surface or light-on-dark text will be invisible:

- Wrap any screen in the dark surface: `<div className="bg-charcoal-900 text-aluminum-100"> … </div>`.
- Light mode exists: set `data-theme="light"` on a root ancestor (`<html>` or a wrapper div). Every colour token swaps automatically — no per-component change.
- There is **no ThemeProvider** — theming is pure CSS variables driven by the `[data-theme]` attribute.

### Styling idiom — Tailwind v4 utilities, fixed token vocabulary
Style your own layout with Tailwind utilities using **only these colour families** (don't invent colours):

| Family | Values | Use for |
|---|---|---|
| `charcoal` | 900, 950 | page / primary surfaces — `bg-charcoal-900` |
| `graphite` | 600, 700, 800 | secondary surfaces, card fills — `bg-graphite-700` |
| `aluminum` | 100, 200, 300, 400, 500 | text (100 = primary, 300 = body, 400 = muted) and borders — `text-aluminum-100`, `border-aluminum-500/20` |
| `ember` | 200, 300, 400, 500, 600 | the single accent — CTAs, active states, links — `bg-ember-400`, `text-ember-200` |

Two custom utilities carry the brand:
- `surface-panel` — the elevated card primitive (graphite fill, soft aluminium border, ember hover ring, mouse-tracked spotlight glow). Use it for any card.
- `texture-noise` — the subtle anodised-aluminium texture; reserved for accent surfaces (primary buttons, badges).

### Where the truth lives
- `_ds/<folder>/styles.css` and its imports — the compiled tokens plus the `surface-panel` / `texture-noise` definitions.
- Each component's `.d.ts` (prop contract) and `.prompt.md` (usage). Read these before composing.

### Components (all on `window.LiamDayUI.*`)
`Button` (variant `primary` | `secondary` | `pill`), `Badge`, `Tag`, `SurfacePanel`, `SectionHeading`, `StatCard`, `ExperienceCard`, `CapabilityCard`, `EducationPanel`, `MetaList`, `ProjectCard`, `Hero`, `ContactSection`, `ProjectsShowcase`. Image props (`ProjectCard`'s `project.icon`, `Hero`'s `photoSrc`) take a URL — supply your own.

### One idiomatic build
```tsx
<div className="bg-charcoal-900 text-aluminum-100 min-h-screen px-6 py-16">
  <div className="mx-auto max-w-5xl">
    <SectionHeading title="Core capabilities" intro="What I do best." />
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <CapabilityCard title="Applied AI" description="Daily Claude + MCP development." />
      <CapabilityCard title="Product Strategy" description="Roadmaps, RICE, delivery." />
    </div>
    <div className="mt-10">
      <Button variant="primary" href="#contact">Get in touch</Button>
    </div>
  </div>
</div>
```
