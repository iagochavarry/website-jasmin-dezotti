# Jasmin Website V2 Refactor — Design Spec

**Date:** 2026-05-24
**Status:** Approved (pending implementation)

## Goal

Replace the current site's design system, typography, logos, and layout with the new "V2" treatment located in `Jasmin Website V2/` (HTML/CSS mockups), while preserving the **real content** from the current Next.js site (V1) — bio, credentials, trajectory, testimonials, and the two real blog posts. Simplify routes to **only home and blog**; delete the rest.

## Non-goals

- No new features. No CMS. No i18n. No analytics rework. No design tweaks beyond what V2 already establishes.
- Not porting V2's 10 placeholder blog posts as real pages — only the 2 V1 posts ship.
- Not changing `next.config.js` (security headers + www redirect stay), GA wiring, sitemap, robots, or structured-data SEO.

## Approach

Surgical replacement inside the existing Next.js 15 / Tailwind v4 shell. Keep the framework, config, and infra; replace the design tokens, fonts, components, and page bodies. Drop all routes outside `/` and `/blog`.

**Rejected alternatives:**
- Pasting V2 HTML into one big `page.tsx` with V2's inline `<style>` — loses component boundaries; hard to maintain.
- Greenfield Next.js project — needlessly throws away config/redirects/analytics/SEO.

## Sources of truth

- **Style / typography / layout / logos** → `Jasmin Website V2/` (`index.html`, `blog.html`, `assets/site.css`, `assets/post.css`, `assets/*.png|jpg`, `posts/*.html` for post markup patterns).
- **Real text / credentials / bio / testimonials / blog content** → existing V1 components (`components/hero-home.tsx`, `components/about-doctor.tsx`, `components/workflows.tsx`, `components/features.tsx`, `components/testimonials.tsx`, `components/cta.tsx`, `components/ui/footer.tsx`, `app/(default)/blog/page.tsx`, `app/(default)/blog/[slug]/page.tsx`).

When the two collide, V2 wins on visual; V1 wins on copy. V2 placeholder copy is discarded.

## File-level plan

### Delete (routes / components / assets)

```
app/(auth)/
app/(default)/atendimento/
app/api/hello/
components/soon-available.tsx
components/modal-video.tsx
components/page-illustration.tsx
components/scroll-indicator.tsx
components/spotlight.tsx
components/ui/conditional-header.tsx
components/ui/breadcrumbs.tsx
public/fonts/nacelle-*.woff2
docs/adaptacao-medica-resumo.md
docs/paleta-cores-implementacao.md
docs/template-know-how.md
RESOLVER-REDIRECT-LOOP.md            (move to docs/ if Iago wants to keep operational notes)
```

Prune `public/images/` to only the assets that the new site actually references (see "Asset migration" below).

### Rewrite / replace

```
app/layout.tsx                            — swap nacelle for Cormorant Garamond (next/font/google)
app/css/style.css                         — replace @theme palette with V2 tokens
app/css/additional-styles/v2.css          — NEW: port V2's site.css + index.html + post.css <style> rules
app/css/additional-styles/theme.css       — DELETE (V1-era extra theme rules; v2.css replaces)
app/css/additional-styles/utility-patterns.css — DELETE (V1-era; V2 uses Tailwind utilities directly)
app/(default)/layout.tsx                  — drop "isSoonPage" branching; remove AOS init (dependency deleted)
app/(default)/page.tsx                    — assemble Home from new section components
app/(default)/blog/page.tsx               — V2 blog grid, 2 cards
app/(default)/blog/[slug]/page.tsx        — V2 post template + V1 post content
components/ui/header.tsx                  — V2 dark-sage fixed header (sticky, blur, brand mark left, links center, Blog + Agendar right)
components/ui/footer.tsx                  — V2 4-column footer on sage-deep
components/hero-home.tsx                  — V2 hero (eyebrow + display title + credentials + lede + CTAs + portrait); NO metrics row
components/about-doctor.tsx               — V2 Sobre + Trajetória 3-column cards
components/specialties.tsx                — NEW (replaces workflows.tsx): 3 spec cards (Otologia, Rinologia, Laringe & Voz)
components/differentials.tsx              — NEW (replaces features.tsx): dark-sage numbered list + aside (5 items)
components/testimonials.tsx               — V2 3-card grid (one "feature" tinted), drop category filter, drop masonry
components/cta.tsx                        — V2 cream "agendar" card with cta-info dl
components/marquee.tsx                    — NEW: marquee strip between Hero and Sobre
components/ui/logo.tsx                    — point to V2 logo
```

### Keep

```
next.config.js                            — security headers + www→non-www redirect
tsconfig.json
package.json                              — drop "aos" and "@types/aos" (AOS no longer used)
components/analytics/google-analytics.tsx
components/seo/structured-data.tsx
public/favicon.ico
public/robots.txt
public/sitemap.xml
public/.htaccess
public/images/(only used files)
.vscode/, .gitignore
```

## Asset migration

**Copy from `Jasmin Website V2/assets/` → `public/images/v2/`:**

| File | Used by |
|---|---|
| `logo-submark-white.png` | Header + Footer brand mark on sage-deep |
| `logo-full-tan.png` | Reserved for light backgrounds (e.g. blog post header variant) |
| `dra-jasmin.png` | Hero portrait |
| `cirurgia.jpg` | Sobre section image |
| `icon-ouvido.png` | Especialidades card (Otologia) |
| `icon-nariz.png` | Especialidades card (Rinologia) |
| `icon-garganta.png` | Especialidades card (Laringe & Voz) |

**Keep from existing `public/images/`:**

| File | Reason |
|---|---|
| `favicon.ico` | Browser tab |
| `otorrino-icons.png` | Referenced by V1 blog post `o-que-e-otorrino` |
| `workflow-01.png` | Referenced by V1 blog post `cuidados-com-rinite-alergica` as cover |

Verify before delete: `mesh2.jpg` is currently the root layout's background mesh. V2 uses a different hero treatment (radial gradients in CSS). **Drop `mesh2.jpg`** and the `<Image src="/images/mesh2.jpg">` block in `app/layout.tsx`.

**Delete:** all other images in `public/images/` (health-plan logos, `testimonial-0X.jpg`, `hero-image-01.jpg`, `LogoStyledHD*.png`, `blurred-shape*.svg`, `client-logo-*.svg`, `features.png`, `home.png`, `golden-crosspng.png`, `page-illustration.svg`, `secondary-illustration.svg`, `footer-illustration.svg`, `star.png`).

## Typography

Drop `localFont` for `nacelle-*.woff2`. Wire Cormorant Garamond via `next/font/google`:

```tsx
// app/layout.tsx
import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
```

Body uses `--font-inter`; display headings (`.brand-name`, `h1.display`, `h2.section-title`, `.lede`, `.sobre-quote`, `.testi-quote`, etc.) use `--font-cormorant`. All exact font-family strings come from V2's `site.css`.

## Design tokens (Tailwind v4 `@theme`)

In `app/css/style.css`, replace the entire `@theme` palette with V2 tokens (preserve `--text-*` scale):

```css
@theme {
  --font-inter: var(--font-inter), sans-serif;
  --font-cormorant: var(--font-cormorant), "Times New Roman", serif;

  /* V2 palette */
  --color-cream: #F1E3D3;
  --color-cream-2: #EAD6C2;
  --color-paper: #FBF6EF;
  --color-sage: #6E7563;
  --color-sage-deep: #565C4D;
  --color-sage-soft: #8E957F;
  --color-terra: #C07A52;
  --color-terra-deep: #A86340;
  --color-ink: #3A3D34;
  --color-line: rgba(110,117,99,.18);
  --color-line-warm: rgba(192,122,82,.35);
  --color-accent-soft: #E6BFA6;   /* used on sage-deep surfaces */

  /* Text scale: keep V1's clamp scale (works fine with serif display) */
  --text-xs ... --text-7xl  (unchanged)
}
```

Body bg: `var(--color-cream)`; body text: `var(--color-ink)`.

## Component / page composition

### Home (`app/(default)/page.tsx`)

```tsx
<StructuredData />
<Header />
<Hero />          {/* eyebrow, display title, credentials, lede, CTAs, portrait — NO metrics */}
<Marquee />       {/* horizontal scrolling specialty terms */}
<AboutDoctor />   {/* Sobre + Trajetória cards */}
<Specialties />   {/* 3 spec cards */}
<Differentials /> {/* dark-sage numbered list + aside */}
<Testimonials />  {/* 3 cards, one feature */}
<Cta />           {/* "Pronta para te escutar" cream card */}
<Footer />
```

### Blog index (`app/(default)/blog/page.tsx`)

- `blog-hero`: "Conhecimento que cuida." (V2 lede stays, written by Jasmin)
- **No filters** (only 2 posts; filters are noise)
- **No "featured" card** (with 2 posts total it's awkward) — render both as equal `post-card` items in a 1-col or 2-col grid (`grid-cols-1 md:grid-cols-2`)
- Each card pulls from a `posts` array in the file

### Blog post (`app/(default)/blog/[slug]/page.tsx`)

- Reuse V2's `post-hero` + `prose-grid` + `prose` markup from `Jasmin Website V2/posts/rinite-sinusite.html`
- Inject V1 post content (HTML strings from existing `blogPostsData` in V1's `[slug]/page.tsx`)
- Two slugs: `o-que-e-otorrino`, `cuidados-com-rinite-alergica`
- `generateStaticParams` returns those two slugs; `notFound()` otherwise

## Content mapping (V2 layout, V1 copy)

| V2 section | Use V1 copy from… |
|---|---|
| Hero title / credentials / lede | `components/hero-home.tsx` (name, CRM 52125602-5, RQE 60167) + V2 lede ("Cuidado especializado em ouvido, nariz e garganta…") which is appropriate |
| Sobre paragraphs | `components/about-doctor.tsx` lines 33–37 + 161–167 (specialization paragraph) |
| Trajetória 6 cards | V1's about-doctor sections: Graduação (Souza Marques + 4 sub-items), Residência (UERJ/HUPE), Fellowship (Rinologia HUPE/UERJ), Aprofundamentos (Mastoide UFRJ, Rinologia/Base Crânio CETEB), Apresentações (FORL São Paulo, Sociedade ORL RJ), Experiência Clínica (UERJ, OTO Grupo: Ipanema/Barra/Tijuca/Madureira, Pires de Melo Niterói) |
| Sobre image tag | "Centro cirúrgico · Hospital Pedro **Ernesto**" (fix V2's typo "Hernesto") |
| Especialidades 3 cards | Otologia/Rinologia/Laringe — copy from V1 `workflows.tsx` 3 cards |
| Differentials 5 items | Pick 5 from V1 `features.tsx` 6 cards: Formação de Excelência, Especialização em Rinologia, Experiência em Grandes Centros, Aprofundamento Técnico, Atendimento Personalizado (drop Participação Científica or merge it) |
| Testimonials 3 cards | Pick 3 from V1 `testimonials.tsx` array: Maria Silva (sinusite crônica), Carlos Mendes (audição), Ana Paula Costa (otite filho). Feature card = the most expressive of the three |
| CTA card | Title/lede from V2; phone `(21) 99773-4282` matches V1; **Instagram / email / address remain V2 placeholders until Jasmin confirms** — leave a `TODO` comment in the JSX so it's findable |
| Footer | V2 4-col on sage-deep; phone `(21) 99773-4282`; Instagram/email/address marked TODO until confirmed |

## Open content gaps (non-blocking — leave TODOs in JSX)

- Instagram handle (V2 has `@jasminlovisi.otorrino` — unverified)
- Contact email (V2 has `contato@jasminlovisi.com.br` — unverified)
- Clinic address (V2 has "Av. das Américas, 500 — Barra da Tijuca" — unverified)

Iago will fill these in after confirming with Jasmin.

## Behavior preserved

- `next.config.js` security headers + www→non-www redirect
- Sticky/scrolled header behavior (V2 has a `.is-stuck` class on scroll past 12px)
- GoogleAnalytics in `<body>`
- StructuredData JSON-LD on home
- Sitemap and robots
- Smooth-scroll for in-page `#anchor` links from header (sobre, especialidades, diferenciais, depoimentos, agendar)

## Behavior removed

- AOS scroll animations (V2 doesn't use them; remove `aos` dependency from `package.json`)
- ScrollIndicator floating arrow
- Mobile menu drawer (V2 hides nav-links under 980px, no replacement; add a simple mobile menu if needed — see open question below)
- Soon-available emergency page
- All `/atendimento`, `/signin`, `/signup`, `/reset-password`, `/api/hello` routes

## Open implementation question (decide during build)

**Mobile nav:** V2 hides `.nav-links` below 980px with no fallback. The header still shows brand + "Blog" + "Agendar". For a doctor's marketing site this is probably fine (the in-page anchors are also reachable from the footer). Decision: **ship without mobile drawer**. If Iago wants one, add later.

## Local dev / verification

Existing scripts (`package.json`):

```bash
pnpm install        # if dependencies changed
pnpm dev            # next dev --turbopack — open http://localhost:3000
pnpm build          # production build (verifies no broken imports / type errors)
pnpm start          # serve the production build at localhost:3000
pnpm lint           # next lint
```

After the refactor, manual checks:
1. `http://localhost:3000` — renders V2 home with V1 copy; all anchor links scroll smoothly
2. `http://localhost:3000/blog` — 2 cards (V1 posts) in V2 grid
3. `http://localhost:3000/blog/o-que-e-otorrino` — V1 article content in V2 post styling
4. `http://localhost:3000/blog/cuidados-com-rinite-alergica` — same
5. `http://localhost:3000/atendimento` — 404 (route deleted)
6. `http://localhost:3000/signin` — 404
7. Mobile width (375px) — layout collapses cleanly, brand + Agendar visible

## Out of scope (future)

- Mobile hamburger drawer
- More blog posts (CMS or MDX)
- Image optimization beyond what `next/image` does by default
- Re-introducing the "soon" emergency page (deleted, but easy to re-add if needed)
- Confirming the three placeholder contact strings (Instagram / email / address)
